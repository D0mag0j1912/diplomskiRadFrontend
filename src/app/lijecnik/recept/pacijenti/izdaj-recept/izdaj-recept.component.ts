import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { concatMap, debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReceptPretragaService } from '../../recept-pretraga.service';
import * as Validacija from '../../recept-validations';
import { ReceptService } from '../../recept.service';
import * as AzurirajDostatnost from '../../recept-azuriraj-dostatnost';
import {azurirajValidatore} from '../../azuriraj-validatore';

@Component({
  selector: 'app-izdaj-recept',
  templateUrl: './izdaj-recept.component.html',
  styleUrls: ['./izdaj-recept.component.css']
})
export class IzdajReceptComponent implements OnInit, OnDestroy{
    //Kreiram novi Subject koji uvjetuje do kada držim pretplate (kad je on true => pretplata.unsubscribe())
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li liječnik odabrao lijek (Inicijalno na početku je lijek uvijek)
    isLijek: boolean = true;
    //Oznaka je li liječnik izabrao magistralni pripravak
    isMagPripravak: boolean = false;
    //Oznaka je li liječnik pretražuje lijekove sa osnovne liste
    isPretragaLijekOsnovnaLista: boolean = false;
    //Oznaka je li liječnik pretražuje lijekove sa dopunske liste
    isPretragaLijekDopunskaLista: boolean = false;
    //Oznaka je li liječnik pretražuje magistralne pripravke sa osnovne liste
    isPretragaMagPripravakOsnovnaLista: boolean = false;
    //Oznaka je li liječnik pretražuje magistralne pripravke sa dopunske liste
    isPretragaMagPripravakDopunskaLista: boolean = false;
    //Spremam poruku od servera da nema rezultata za navedenu pretragu
    porukaNemaRezultata: string = null;
    //Oznaka hoće li se prikazati cijene u formi
    isCijene: boolean = false;
    //Oznaka je li potrebno upisati šifru specijalisa
    isSpecijalist: boolean = false;
    //Oznaka je li količina aktivna
    isKolicina: boolean = false;
    //Kreiram formu
    forma: FormGroup;
    //Spremam trenutno izabranu sekundarnu dijagnozu zbog validacije duplikata
    sekDijagnoza: string = null;
    //Spremam dijagnozu koja je ista kod primarne i kod sekundarne dijagnoze
    dijagnoza: string;
    //Spremam sve dijagnoze
    dijagnoze: any;
    //Spremam sve lijekove sa osnovne liste
    lijekoviOsnovnaLista: any;
    //Spremam sve lijekove sa dopunske liste
    lijekoviDopunskaLista: any;
    //Spremam sve magistralne pripravke sa osnovne liste
    magPripravciOsnovnaLista: string[] = [];
    //Spremam sve magistralne pripravke sa dopunske liste
    magPripravciDopunskaLista: string[] = [];
    //Spremam nazive dijagnoza
    naziviDijagnoze: string[] = [];
    //Spremam MKB šifre dijagnoza
    mkbSifre: string[] = [];
    //Spremam nazive lijekova iz osnovne liste te njihovu oblik, jačinu i pakiranje
    lijekoviOsnovnaListaOJP: string[] = [];
    //Spremam nazive lijekova iz DOPUNSKE LISTE te njihov oblik, jačinu i pakiranje
    lijekoviDopunskaListaOJP: string[] = [];
    //Spremam rezultat pretrage LIJEKOVA sa OSNOVNE liste
    resultLijekOsnovnaLista: any;
    //Spremam rezultat pretrage LIJEKOVA sa DOPUNSKE liste
    resultLijekDopunskaLista: any;
    //Spremam rezultat pretrage MAGISTRALNIH PRIPRAVAKA sa OSNOVNE LISTE
    resultMagPripravciOsnovnaLista: any;
    //Spremam rezultat pretrage MAGISTRALNIH PRIPRAVAKA sa DOPUNSKE LISTE
    resultMagPripravciDopunskaLista: any;
    //Kreiram polje u koje ću spremati inicijalne sekundarne dijagnoze
    sekundarnaDijagnozaPovijestBolesti: string[] = [];
    //Spremam naziv inicijalne primarne dijagnoze
    primarnaDijagnozaPovijestBolesti: string = null;
    //Kreiram polje u kojemu se nalaze dozvoljene vrijednosti broja ponavljanja recepta
    poljeBrojPonavljanja: string[] = ["1","2","3","4","5"];
    //Oznaka je li recept ponovljiv ili nije
    isPonovljiv: boolean = false;
    //Inicijalno stavljam trajanje terapije na 30 dana
    trajanjeTerapije: number = 30;
    indexSekundarna: number = 0;
    pomIndex: number = 0;
    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis recepta
        private receptService: ReceptService,
        //Dohvaćam servis pretrage recepta
        private receptPretragaService: ReceptPretragaService,
        //Dohvaćam router
        private router: Router
    ) {}

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {

        this.route.data.pipe(
            map(podatci => podatci.importi),
            tap((podatci) => {
                //Spremam sve dijagnoze u svoje polje
                this.dijagnoze = podatci.dijagnoze;

                //Prolazim kroz polje svih dijagnoza
                for(const dijagnoza of this.dijagnoze){
                    //U polje naziva dijagnoza dodavam svaki naziv dijagnoze iz importanog polja
                    this.naziviDijagnoze.push(dijagnoza.imeDijagnoza);
                    //U polje MKB šifra dijagnoza dodavam svaki MKB dijagnoze iz importanog polja
                    this.mkbSifre.push(dijagnoza.mkbSifra);
                }
                //Prolazim kroz polje svih lijekova sa osnovne liste
                for(const lijek of podatci.lijekoviOsnovnaLista){
                    //U polje dodavam naziv - oblik, jačina i pakiranje lijeka
                    this.lijekoviOsnovnaListaOJP.push(lijek.zasticenoImeLijek + " " + lijek.oblikJacinaPakiranjeLijek);
                }
                //Prolazim kroz polje svih lijekova sa dopunske liste
                for(const lijek of podatci.lijekoviDopunskaLista){
                    //U polje dodavam naziv - oblik, jačina i pakiranje lijeka
                    this.lijekoviDopunskaListaOJP.push(lijek.zasticenoImeLijek + " " + lijek.oblikJacinaPakiranjeLijek);
                }
                //Prolazim kroz polje svih magistralnih pripravaka sa osnovne liste
                for(const pripravak of podatci.magistralniPripravciOsnovnaLista){
                    //U svoje polje spremam njihove nazive
                    this.magPripravciOsnovnaLista.push(pripravak.nazivMagPripravak);
                }
                //Prolazim kroz polje svih magistranih pripravaka sa dopunske liste
                for(const pripravak of podatci.magistralniPripravciDopunskaLista){
                    //U svoje polje spremam njihove nazive
                    this.magPripravciDopunskaLista.push(pripravak.nazivMagPripravak);
                }
                //Kreiram formu unosa novog recepta
                this.forma = new FormGroup({
                    'primarnaDijagnoza': new FormControl(null,[Validators.required]),
                    'mkbPrimarnaDijagnoza': new FormControl(null,[Validators.required,Validacija.provjeriMKB(this.mkbSifre)]),
                    'sekundarnaDijagnoza': new FormArray([
                        new FormGroup({
                            'nazivSekundarna': new FormControl(null),
                            'mkbSifraSekundarna': new FormControl(null),
                            'indexSekundarna': new FormControl(0)
                        },{validators: [Validacija.requiredMKBSifraSekundarna(),Validacija.provjeriMKBSifraSekundarna(this.mkbSifre)]})  
                    ],{validators: this.isValidSekundarnaDijagnoza.bind(this)}),
                    'tip': new FormControl("lijek"),
                    'osnovnaListaLijek': new FormGroup({
                        'osnovnaListaLijekDropdown': new FormControl(),
                        'osnovnaListaLijekText': new FormControl()
                    }),
                    'dopunskaListaLijek': new FormGroup({
                        'dopunskaListaLijekDropdown': new FormControl(),
                        'dopunskaListaLijekText': new FormControl()
                    }),
                    'osnovnaListaMagPripravak': new FormGroup({
                        'osnovnaListaMagPripravakDropdown': new FormControl(),
                        'osnovnaListaMagPripravakText' : new FormControl()
                    }),
                    'dopunskaListaMagPripravak': new FormGroup({
                        'dopunskaListaMagPripravakDropdown': new FormControl(),
                        'dopunskaListaMagPripravakText': new FormControl()
                    }),
                    'cijenaDopunskaLista': new FormGroup({
                        'cijenaUkupno': new FormControl(),
                        'cijenaZavod': new FormControl(),
                        'cijenaOsiguranik': new FormControl()
                    }),
                    'kolicina': new FormGroup({
                        'kolicinaDropdown': new FormControl(1,[Validators.required]),
                        'kolicinaRimski': new FormControl(null),
                        'kolicinaLatinski': new FormControl()
                    }),
                    'doziranje': new FormGroup({
                        'doziranjeFrekvencija': new FormControl(null,[Validators.pattern("^[0-9]*$"),Validators.required]),
                        'doziranjePeriod': new FormControl("dnevno")
                    }),
                    'trajanje': new FormGroup({
                        'dostatnost': new FormControl("30"),
                        'vrijediDo': new FormControl(podatci.datum)
                    }),
                    'sifraSpecijalist': new FormControl(),
                    'ostaliPodatci': new FormGroup({
                        'hitnost': new FormControl(),
                        'ponovljivost': new FormControl(),
                        'brojPonavljanja': new FormControl(null),
                        'rijecimaBrojPonavljanja': new FormControl("jedan put")
                    },{validators: Validacija.provjeriBrojPonavljanja()})
                });
                //Inicijalno onemogućavam unos sekundarnih dijagnoza
                this.sekundarnaDijagnoza.disable({emitEvent: false});
                //Inicijalno onemogućavam unos rimske oznake količine
                this.kolicinaRimski.disable({emitEvent: false});
                //Inicijalno onemogućavam unos ukupne cijene
                this.cijenaUkupno.disable({emitEvent: false});
                //Inicijalno onemogućavam unos cijene koje plaća Zavod
                this.cijenaZavod.disable({emitEvent: false});
                //Inicijalno onemogućavam unos cijene koje plaća osiguranik
                this.cijenaOsiguranik.disable({emitEvent: false});
                //Inicijalno onemogućavam unos polja u kojemu se prikaziva datum isteka dostatnosti
                this.vrijediDo.disable({emitEvent: false});
                //Inicijalno onemogućavam unos riječima broja ponavljanja
                this.rijecimaBrojPonavljanja.disable({emitEvent: false});
                /* //Inicijalno dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                        this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                                        this.isLijek,this.isMagPripravak),
                                        this.isValidDijagnoze.bind(this),
                                        Validacija.doziranjePrijeProizvod(),
                                        Validacija.kolicinaPrijeProizvod(),
                                        Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                //Ažuriram stanje validacije
                this.forma.updateValueAndValidity({emitEvent: false}); */
                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                    this.isMagPripravak, this.isSpecijalist);
                //Postavljam validatore na polje dostatnosti
                this.dostatnost.setValidators([Validacija.provjeriDostatnost(this.isPonovljiv,this.brojPonavljanja.value),Validators.pattern("^[0-9]*$"),Validators.required]);
                //Ažuriram validaciju
                this.dostatnost.updateValueAndValidity({emitEvent: false});
                
                //Dohvaćam inicijalne dijagnoze ako ih ovaj pacijent ima
                if(podatci.inicijalneDijagnoze !== null){
                    //Omogućavam unos sekundarne dijagnoze koja je inicijalno disable
                    this.sekundarnaDijagnoza.enable({emitEvent: false});
                    this.sekundarnaDijagnoza.clear();
                    //Resetiram svoje polje sekundarnih dijagnoza
                    this.sekundarnaDijagnozaPovijestBolesti = [];
                    //Dodavam jedan form control u polje sekundarnih dijagnoza
                    this.onAddDiagnosis();
                    //Prolazim poljem odgovora servera
                    for(let dijagnoza of podatci.inicijalneDijagnoze){
                        //Spremam naziv primarne dijagnoze povezane povijesti bolesti
                        this.primarnaDijagnozaPovijestBolesti = dijagnoza.NazivPrimarna;
                        //U polje sekundarnih dijagnoza spremam sve sekundarne dijagnoze povezane povijesti bolesti
                        this.sekundarnaDijagnozaPovijestBolesti.push(dijagnoza.NazivSekundarna);
                        //Za svaku sekundarnu dijagnozu sa servera NADODAVAM JEDAN FORM CONTROL 
                        this.onAddDiagnosis();
                    }
                    //BRIŠEM ZADNJI FORM CONTROL da ne bude jedan viška
                    this.onDeleteDiagnosis(-1);  
                    //Postavljam vrijednost naziva primarne dijagnoze na vrijednost koju sam dobio sa servera
                    this.primarnaDijagnoza.patchValue(this.primarnaDijagnozaPovijestBolesti,{emitEvent: false});
                    //Postavljam MKB šifru na osnove odabranog naziva primarne dijagnoze
                    Validacija.nazivToMKB(this.primarnaDijagnozaPovijestBolesti,this.dijagnoze,this.forma);
                    //Prolazim kroz sve prikupljene nazive sekundarnih dijagnoza sa servera
                    this.sekundarnaDijagnozaPovijestBolesti.forEach((element,index) => {
                        //U polju naziva sekundarnih dijagnoza postavljam prikupljena imena sek. dijagnoza na određenom indexu 
                        (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('nazivSekundarna').patchValue(element,{emitEvent: false});
                        //Postavljam MKB šifre sek.dijagnoza
                        Validacija.nazivToMKBSekundarna(element,this.dijagnoze,this.forma,index);
                    });
                }
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
        
        //Pretplaćujem se na promjene u pojedinim dijelovima forme
        const prviDio = merge(
            //Slušam promjene u polju unosa primarne dijagnoze
            this.primarnaDijagnoza.valueChanges.pipe(
                tap(value => {
                    console.log("U promjenama primarne dijagnoze sam!");
                    //Ako se unesena vrijednost NALAZI u nazivima dijagnoza, onda znam da je liječnik unio vrijednost primarne dijagnoze
                    if(this.naziviDijagnoze.indexOf(value) !== -1){
                        //Ako je taj unos ispravan
                        if(this.primarnaDijagnoza.valid){
                            //Pozivam metodu da popuni polje MKB šifre te dijagnoze
                            Validacija.nazivToMKB(value,this.dijagnoze,this.forma);
                            //Omogućavam unos sekundarnih dijagnoza
                            this.sekundarnaDijagnoza.enable({emitEvent: false});
                        }
                    }
                    //Ako je polje naziva primarne dijagnoze prazno 
                    if(!this.primarnaDijagnoza.value){
                        //Resetiraj polje MKB šifre primarne dijagnoze
                        this.mkbPrimarnaDijagnoza.patchValue(null,{emitEvent: false});
                        //Dok ne ostane jedna sekundarna dijagnoza u arrayu
                        while(this.getControlsSekundarna().length !== 1){
                            //Briši mu prvi element 
                            (<FormArray>this.sekundarnaDijagnoza).removeAt(0);
                        }
                        //Kada je ostala jedna vrijednost sek. dijagnoze, resetiraj joj vrijednost i onemogući unos
                        this.sekundarnaDijagnoza.reset();
                        this.sekundarnaDijagnoza.disable({emitEvent: false});
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa MKB šifre primarne dijagnoze
            this.mkbPrimarnaDijagnoza.valueChanges.pipe(
                tap(value => {
                    console.log("u promjenama mkb šifre dijagnoze sam!");
                    //Ako je MKB ispravno unesen (ako je prošao validaciju)
                    if(this.mkbPrimarnaDijagnoza.valid){
                        //Prolazim kroz sve MKB šifre
                        for(const mkb of this.mkbSifre){
                            //Ako se upisana vrijednost nalazi u polju MKB šifri
                            if(mkb.toLowerCase() === value.toLowerCase()){
                                //U polje MKB šifri postavi šifru velikim slovima
                                this.mkbPrimarnaDijagnoza.patchValue(mkb,{emitEvent: false});
                            }
                        }
                        //Pozivam metodu da popuni polje naziva primarne dijagnoze
                        Validacija.MKBtoNaziv(this.mkbPrimarnaDijagnoza.value,this.dijagnoze,this.forma);
                        //Omogućavam unos sekundarne dijagnoze
                        this.sekundarnaDijagnoza.enable({emitEvent: false}); 
                    }
                    //Ako je MKB neispravno unesen
                    else{
                        //Postavi naziv primarne dijagnoze na null
                        this.primarnaDijagnoza.patchValue(null,{emitEvent: false});
                        //Dok ne ostane jedna sekundarna dijagnoza u arrayu
                        while(this.getControlsSekundarna().length !== 1){
                            //Briši mu prvi element 
                            (<FormArray>this.sekundarnaDijagnoza).removeAt(0);
                        }
                        //Kada je ostala jedna vrijednost sek. dijagnoze, resetiraj joj vrijednost i onemogući unos
                        this.sekundarnaDijagnoza.reset();
                        this.sekundarnaDijagnoza.disable({emitEvent: false});
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa lijeka sa osnovne liste pomoću dropdowna
            this.osnovnaListaLijekDropdown.valueChanges.pipe(
                tap(value => {
                    console.log("u dropdownu OSNOVNE LISTE LIJEKOVA sam!");
                    //Ako se unesena vrijednost NALAZI u polju OSNOVNE LISTE LIJEKOVA
                    if(this.lijekoviOsnovnaListaOJP.indexOf(value) !== -1){
                        //Te ako je popunjen dropdown OSNOVNE LISTE LIJEKOVA
                        if(this.lijekoviOsnovnaListaOJP.indexOf(this.osnovnaListaLijekDropdown.value) !== -1/*  
                            || this.lijekoviOsnovnaListaOJP.indexOf(this.forma.get('osnovnaListaLijek.osnovnaListaLijekText').value) !== -1 */){
                            //Resetiram poruku da nema rezultata
                            this.porukaNemaRezultata = null;
                            //Sakrij cijene
                            this.isCijene = false;
                            //Ažurira validaciju cijele forme
                            this.forma.updateValueAndValidity({emitEvent: false});
                            //Resetiraj polja dopunske liste lijekova te tekstualno polje osnovne liste lijekova
                            this.dopunskaListaLijekDropdown.patchValue(null,{emitEvent: false});   
                            this.dopunskaListaLijekText.patchValue("",{emitEvent: false});
                            this.osnovnaListaLijekText.patchValue("",{emitEvent:false});
                            //Zatvori liste ako su bile otvorene
                            if(this.isPretragaLijekOsnovnaLista){
                                this.isPretragaLijekOsnovnaLista = false;
                            }
                            if(this.isPretragaLijekDopunskaLista){
                                this.isPretragaLijekDopunskaLista = false;
                            }
                        }
                    }
                }),
                concatMap(value => {
                    return forkJoin([
                        AzurirajDostatnost.azuriranjeDostatnosti(this.forma,this.receptService),
                        this.receptService.getOznakaLijek(value)
                    ]).pipe(
                        tap(value => {
                            //Ako je server vratio da ima oznake "RS" na izabranom lijeku
                            if(value[1]["success"] === "true"){
                                //Označavam da treba prikazati polje unosa šifre specijalista
                                this.isSpecijalist = true;
                                //Ažuriram ponovno sve validatore
                                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                    this.isMagPripravak, this.isSpecijalist);
                            }
                            //Ako je server vratio da NEMA oznake "RS" na izabranom lijeku
                            else if(value[1]["success"] === "false"){
                                //Označavam da treba sakriti polje unosa šifre specijalista
                                this.isSpecijalist = false;
                                
                                this.sifraSpecijalist.patchValue("",{emitEvent: false});
                                //Ažuriram ponovno sve validatore
                                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                    this.isMagPripravak, this.isSpecijalist);
                            }
                        }),
                        //Ulazim u još jedan concatMap da predam dostatnost u danima metodi koja vraća DATUM vrijediDo
                        concatMap(value => {
                            console.log(value);
                            //Ako server nije vratio null za dostatnost
                            if(value[0] !== null){
                                //Postavi dostatnost u polje unosa dostatnosti
                                this.dostatnost.patchValue(value[0].toString(),{emitEvent: false});
                                return this.receptService.getDatumDostatnost(value[0].toString()).pipe(
                                    //Dohvati datum do kada vrijedi terapija i postavi ga u polje datuma
                                    tap(value => {
                                        this.vrijediDo.patchValue(value,{emitEvent: false});
                                    }),
                                    takeUntil(this.pretplateSubject)
                                );
                            }
                            //Ako je server vratio null za dostatnost (uključuje da je odabran mag.pripravak ili je prazno doziranje, lijek ili količina)
                            if(value[0] === null){
                                return of(null).pipe(
                                    tap(value => {
                                        //Ponovno postavljam trajanje terapije na 30 dana
                                        this.trajanjeTerapije = 30;
                                        //Ako je postavljen broj ponavljanja
                                        if(this.brojPonavljanja.value){
                                            this.trajanjeTerapije = this.trajanjeTerapije * (+this.brojPonavljanja.value + 1);
                                        }
                                        //Postavi dostatnost inicijalno na 30 dana
                                        this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
                                    }),
                                    //Kada server vrati null za dostatnost, pozovi funkciju koja ažurira datum "vrijediDo"
                                    concatMap(value => {
                                        return this.receptService.getDatumDostatnost(this.trajanjeTerapije.toString()).pipe(
                                            tap(datum => {
                                                //Postavi datum
                                                this.vrijediDo.patchValue(datum,{emitEvent: false});
                                            }),
                                            takeUntil(this.pretplateSubject)
                                        );
                                    }), 
                                    takeUntil(this.pretplateSubject)
                                );
                            }
                        }),
                        takeUntil(this.pretplateSubject)
                    )
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa lijeka sa dopunske liste pomoću dropdowna
            this.dopunskaListaLijekDropdown.valueChanges.pipe(
                tap(value => {
                    console.log("u dropdownu DOPUNSKE LISTE LIJEKOVA sam!");
                    //Ako se unesena vrijednost NALAZI u polju DOPUNSKE LISTE LIJEKOVA
                    if(this.lijekoviDopunskaListaOJP.indexOf(value) !== -1){
                        //Te ako je popunjen dropdown DOPUNSKE LISTE LIJEKOVA
                        if(this.lijekoviDopunskaListaOJP.indexOf(this.dopunskaListaLijekDropdown.value) !== -1/*  
                            || this.lijekoviDopunskaListaOJP.indexOf(this.forma.get('dopunskaListaLijek.dopunskaListaLijekText').value) !== -1 */){
                            //Resetiram poruku da nema rezultata
                            this.porukaNemaRezultata = null;
                            //Označavam da se pojave cijene u formi
                            this.isCijene = true;
                            //Ažuriram validaciju cijele forme
                            this.forma.updateValueAndValidity({emitEvent: false});
                            //Resetiraj polja osnovne liste lijekova te tekstualno polje dopunske liste lijekova
                            this.osnovnaListaLijekDropdown.patchValue(null,{emitEvent: false});  
                            this.osnovnaListaLijekText.patchValue("",{emitEvent: false});
                            this.dopunskaListaLijekText.patchValue("",{emitEvent: false});
                            //Zatvori liste ako su ostale otvorene
                            if(this.isPretragaLijekOsnovnaLista){
                                this.isPretragaLijekOsnovnaLista = false;
                            }
                            if(this.isPretragaLijekDopunskaLista){
                                this.isPretragaLijekDopunskaLista = false;
                            }
                        }
                    }
                }),
                //Unese se lijek sa dopunske liste, uzmem tu vrijednost i pošaljem je serveru da dohvatim cijenu tog lijeka
                concatMap(value => {
                    return forkJoin([
                        this.receptService.getCijenaLijekDL(value),
                        this.receptService.getOznakaLijek(value),
                        AzurirajDostatnost.azuriranjeDostatnosti(this.forma,this.receptService)
                    ]).pipe(
                        tap(value => {
                            console.log(value);
                            //Ako je server vratio da ovaj lijek IMA oznaku "RS":
                            if(value[1].success === "true"){
                                //Označavam da treba prikazati polje unosa šifre specijalista
                                this.isSpecijalist = true;
                                //Ažuriram ponovno sve validatore
                                this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                                    this.isLijek,this.isMagPripravak),
                                    this.isValidDijagnoze.bind(this),
                                    Validacija.doziranjePrijeProizvod(),
                                    Validacija.kolicinaPrijeProizvod(),
                                    Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                                //Ažuriram stanje validacije
                                this.forma.updateValueAndValidity({emitEvent: false});
                            }
                            //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                            else{
                                this.isSpecijalist = false;
                                //Ažuriram ponovno sve validatore
                                this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                                    this.isLijek,this.isMagPripravak),
                                    this.isValidDijagnoze.bind(this),
                                    Validacija.doziranjePrijeProizvod(),
                                    Validacija.kolicinaPrijeProizvod(),
                                    Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                                //Ažuriram stanje validacije
                                this.forma.updateValueAndValidity({emitEvent: false});
                            }
                            //Postavljam vrijednosti cijena u formu
                            this.cijenaUkupno.patchValue(`${value[0][0].cijenaLijek} kn`,{emitEvent: false});
                            this.cijenaZavod.patchValue(`${value[0][0].cijenaZavod} kn`,{emitEvent: false});
                            this.cijenaOsiguranik.patchValue(`${value[0][0].doplataLijek} kn`,{emitEvent: false}); 
                        }),
                        concatMap(value => {
                            //Ako server nije vratio null za dostatnost
                            if(value[2] !== null){
                                //Postavi dostatnost u polje unosa dostatnosti
                                this.dostatnost.patchValue(value[2].toString(),{emitEvent: false});
                                return this.receptService.getDatumDostatnost(value[2].toString()).pipe(
                                    //Dohvati datum do kada vrijedi terapija i postavi ga u polje datuma
                                    tap(value => {
                                        this.vrijediDo.patchValue(value,{emitEvent: false});
                                    }),
                                    takeUntil(this.pretplateSubject)
                                );
                            }
                            //Ako je server vratio null za dostatnost (uključuje da je odabran mag.pripravak ili je prazno doziranje, lijek ili količina)
                            else if(value[2] === null){
                                //Nastavi niz podataka
                                return of(null).pipe(
                                    tap(value => {
                                        //Ponovno postavljam trajanje terapije na 30 dana
                                        this.trajanjeTerapije = 30;
                                        //Ako je postavljen broj ponavljanja
                                        if(this.brojPonavljanja.value){
                                            this.trajanjeTerapije = this.trajanjeTerapije * (+this.brojPonavljanja.value + 1);
                                        }
                                        //Postavi dostatnost inicijalno na 30 dana
                                        this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
                                    }),
                                    //Kada server vrati null za dostatnost, pozovi funkciju koja ažurira datum "vrijediDo"
                                    concatMap(value => {
                                        return this.receptService.getDatumDostatnost(this.trajanjeTerapije.toString()).pipe(
                                            tap(datum => {
                                                //Postavi datum
                                                this.vrijediDo.patchValue(datum,{emitEvent: false});
                                            }),
                                            takeUntil(this.pretplateSubject)
                                        );
                                    }),
                                    takeUntil(this.pretplateSubject)
                                );
                            }
                        }),
                        takeUntil(this.pretplateSubject)
                    )
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa mag. pripravka sa osnovne liste pomoću dropdowna
            this.osnovnaListaMagPripravakDropdown.valueChanges.pipe(
                tap(value => {
                    console.log("u dropdownu OSNOVNE LISTE MAG. PRIPRAVAKA SAM!");
                    //Ako se unesena vrijednost NALAZI u polju MAGISTRALNIH PRIPRAVAKA OSNOVNE LISTE
                    if(this.magPripravciOsnovnaLista.indexOf(value) !== -1){
                        //Ako se unesena vrijednost odnosi na dropdown OSNOVNE LISTE MAG. PRIPRAVAKA
                        if(this.magPripravciOsnovnaLista.indexOf(this.osnovnaListaMagPripravakDropdown.value) !== -1/*  
                            || this.magPripravciOsnovnaLista.indexOf(this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').value) !== -1 */){
                                //Resetiram poruku da nema rezultata
                                this.porukaNemaRezultata = null;
                                //Sakrij cijene
                                this.isCijene = false;
                                //Ažuriram validaciju cijele forme
                                this.forma.updateValueAndValidity({emitEvent: false});
                                //Resetiraj polja dopunske liste magistralnih pripravaka te tekstualno polje osnovne liste mag. pripravaka
                                this.dopunskaListaMagPripravakDropdown.patchValue(null,{emitEvent: false});
                                this.dopunskaListaMagPripravakText.patchValue("",{emitEvent: false});
                                this.osnovnaListaMagPripravakText.patchValue("",{emitEvent: false});
                                //Ako su liste pretrage ostale otvorene, zatvori ih
                                if(this.isPretragaMagPripravakOsnovnaLista){
                                    this.isPretragaMagPripravakOsnovnaLista = false;
                                }
                                if(this.isPretragaMagPripravakDopunskaLista){
                                    this.isPretragaMagPripravakDopunskaLista = false;
                                }
                                //Postavi inicijalno trajanje terapije na 30 dana
                                this.trajanjeTerapije = 30;
                                //Ako je postavljen broj ponavljanja
                                if(this.brojPonavljanja.value){
                                    this.trajanjeTerapije = this.trajanjeTerapije * (+this.brojPonavljanja.value + 1);
                                }
                                //U polje dostatnosti postavi 30 dana
                                this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
                        }
                    }
                }),
                concatMap(value => {
                    return forkJoin([
                        this.receptService.getOznakaMagistralniPripravak(value),
                        this.receptService.getDatumDostatnost(this.trajanjeTerapije.toString())
                    ]).pipe(
                        tap(value => {
                            console.log(value);
                            //Ako je server vratio da ima oznake "RS" na izabranom magistralnom pripravku
                            if(value[0]["success"] === "true"){
                                //Označavam da treba prikazati polje unosa šifre specijalista
                                this.isSpecijalist = true;
                                //Inicijalno dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                                    this.isLijek,this.isMagPripravak),
                                    this.isValidDijagnoze.bind(this),
                                    Validacija.doziranjePrijeProizvod(),
                                    Validacija.kolicinaPrijeProizvod(),
                                    Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                                //Ažuriram stanje validacije
                                this.forma.updateValueAndValidity({emitEvent: false});
                            }
                            //Ako je server vratio da NEMA oznake "RS" na izabranom lijeku
                            else{
                                //Označavam da treba sakriti polje unosa šifre specijalista
                                this.isSpecijalist = false;
                                //Inicijalno dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                                    this.isLijek,this.isMagPripravak),
                                    this.isValidDijagnoze.bind(this),
                                    Validacija.doziranjePrijeProizvod(),
                                    Validacija.kolicinaPrijeProizvod(),
                                    Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                                //Ažuriram stanje validacije
                                this.forma.updateValueAndValidity({emitEvent: false});
                            }
                            //U polje datuma postavljam datum
                            this.vrijediDo.patchValue(value[1],{emitEvent: false});
                        }),
                        takeUntil(this.pretplateSubject)
                    );
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa mag. pripravka sa dopunske liste pomoću dropdowna
            this.dopunskaListaMagPripravakDropdown.valueChanges.pipe(
                tap(value => {
                    console.log("u dropdownu DOPUNSKE LISTE MAG. PRIPRAVAKA SAM!");
                    //Ako se unesena vrijednost NALAZI u polju MAGISTRALNIH PRIPRAVAKA DOPUNSKE LISTE
                    if(this.magPripravciDopunskaLista.indexOf(value) !== -1){
                        //Ako se unesena vrijednost odnosi na dropdown DOPUNSKE LISTE MAG.PRIPRAVAKA
                        if(this.magPripravciDopunskaLista.indexOf(this.dopunskaListaMagPripravakDropdown.value) !== -1/*  
                            || this.magPripravciDopunskaLista.indexOf(this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').value) !== -1 */){
                                //Resetiram poruku da nema rezultata
                                this.porukaNemaRezultata = null;
                                //Označavam da se pojave cijene u formi
                                this.isCijene = true;
                                //Ažuriram validaciju cijele forme
                                this.forma.updateValueAndValidity({emitEvent: false});
                                //Resetiraj polja osnovne liste magistralnih pripravaka te tekstualno polje dopunske liste mag. pripravaka
                                this.osnovnaListaMagPripravakDropdown.patchValue(null,{emitEvent: false});
                                this.osnovnaListaMagPripravakText.patchValue("",{emitEvent: false});
                                this.dopunskaListaMagPripravakText.patchValue("",{emitEvent: false});
                                //Ako su liste pretrage ostale otvorene, zatvori ih
                                if(this.isPretragaMagPripravakOsnovnaLista){
                                    this.isPretragaMagPripravakOsnovnaLista = false;
                                }
                                if(this.isPretragaMagPripravakDopunskaLista){
                                    this.isPretragaMagPripravakDopunskaLista = false;
                                }
                                //Postavi inicijalno trajanje terapije na 30 dana
                                this.trajanjeTerapije = 30;
                                //Ako je postavljen broj ponavljanja
                                if(this.brojPonavljanja.value){
                                    this.trajanjeTerapije = this.trajanjeTerapije * (+this.brojPonavljanja.value + 1);
                                }
                                //U polje dostatnosti postavi 30 dana
                                this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
                        }
                    }
                }),
                concatMap(value => {
                    return forkJoin([
                        this.receptService.getCijenaMagPripravakDL(value),
                        this.receptService.getOznakaMagistralniPripravak(value),
                        this.receptService.getDatumDostatnost(this.trajanjeTerapije.toString())
                    ]).pipe(
                        tap(value => {
                            console.log(value);
                            //Postavljam cijene magistralnih pripravaka u formu
                            this.cijenaUkupno.patchValue(`${value[0][0].cijenaMagPripravak} kn`,{emitEvent: false});
                            this.cijenaZavod.patchValue(`${value[0][0].cijenaZavod} kn`,{emitEvent: false});
                            this.cijenaOsiguranik.patchValue(`${value[0][0].doplataMagPripravak} kn`,{emitEvent: false});
                            //Ako je server vratio da ima oznake "RS" na izabranom magistralnom pripravku
                            if(value[1]["success"] === "true"){
                                //Označavam da treba prikazati polje unosa šifre specijalista
                                this.isSpecijalist = true;
                                //Inicijalno dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                                    this.isLijek,this.isMagPripravak),
                                    this.isValidDijagnoze.bind(this),
                                    Validacija.doziranjePrijeProizvod(),
                                    Validacija.kolicinaPrijeProizvod(),
                                    Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                                //Ažuriram stanje validacije
                                this.forma.updateValueAndValidity({emitEvent: false});
                            }
                            //Ako je server vratio da NEMA oznake "RS" na izabranom lijeku
                            else{
                                //Označavam da treba sakriti polje unosa šifre specijalista
                                this.isSpecijalist = false;
                                //Inicijalno dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                                    this.isLijek,this.isMagPripravak),
                                    this.isValidDijagnoze.bind(this),
                                    Validacija.doziranjePrijeProizvod(),
                                    Validacija.kolicinaPrijeProizvod(),
                                    Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                                //Ažuriram stanje validacije
                                this.forma.updateValueAndValidity({emitEvent: false});
                            }
                            //U polje datuma postavljam vrijednost datuma
                            this.vrijediDo.patchValue(value[2],{emitEvent: false});
                        }),
                        takeUntil(this.pretplateSubject)
                    )
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na promjene u polju unosa količine
            this.kolicinaDropdown.valueChanges.pipe(
                //Za svaku promjenu u vrijednosti količine, izvršava se unutarnji Observable koji dohvaća dostatnost
                concatMap(value => {
                    return AzurirajDostatnost.azuriranjeDostatnostiHandler(this.forma,this.receptService,this.pretplateSubject,this.trajanjeTerapije);
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na promjene u polju FREKVENCIJE DOZIRANJA i PERIODA DOZIRANJA
            this.doziranje.valueChanges.pipe(
                //Za svaku promjenu u vrijednosti doziranja, izvršava se unutarnji Observable koji dohvaća dostatnost
                concatMap(value => {
                    return AzurirajDostatnost.azuriranjeDostatnostiHandler(this.forma,this.receptService,this.pretplateSubject,this.trajanjeTerapije);
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćivam se na promjene u polju DOSTATNOSTI
            this.dostatnost.valueChanges.pipe(
                //Uzimam vrijednost dostatnosti i prosljeđivam je funkciji koja računa datum "Vrijedi do:" na osnovu te dostatnosti
                concatMap(dostatnost => {
                    //Ako dostatnost NIJE NULL
                    if(dostatnost){
                        //Ako je unos dostatnosti ispravan (samo cjelobrojne vrijednosti)
                        if(this.dostatnost.valid){
                            return this.receptService.getDatumDostatnost(dostatnost.toString()).pipe(
                                tap(datum => {
                                    //Postavi datum u njegovo polje
                                    this.vrijediDo.patchValue(datum,{emitEvent: false});
                                }),
                                takeUntil(this.pretplateSubject)
                            );
                        }
                        //Ako unos dostatnosti nije valjan (slova, specijalni znakovi itd..)
                        else{
                            //Resetiram vrijednost datuma
                            this.vrijediDo.patchValue(null,{emitEvent: false});
                            return of(null).pipe(
                                takeUntil(this.pretplateSubject)
                            );
                        }
                    }
                    //Ako je dostatnost null
                    else{
                        return of(null).pipe(
                            tap(value => {
                                //Postavi datum na null
                                this.vrijediDo.patchValue(null,{emitEvent: false});
                            }),
                            takeUntil(this.pretplateSubject)
                        );
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćivam se na promjene u polju BROJA PONAVLJANJA
            this.brojPonavljanja.valueChanges.pipe(
                tap(() => console.log("U promjenama sam broja ponavljanja!")),
                concatMap(() => {
                    return AzurirajDostatnost.azuriranjeDostatnostiHandler(this.forma,this.receptService,this.pretplateSubject,this.trajanjeTerapije);
                }),
                takeUntil(this.pretplateSubject)
            )
        ).subscribe();
        //Pretplaćujem se na promjene u tekstualnim poljima lijekova i mag.pripravaka
        const drugiDio = merge(
            //Slušam promjene u polju unosa lijeka sa osnovne liste pomoću pretrage
            this.osnovnaListaLijekText.valueChanges.pipe(
                debounceTime(100),
                distinctUntilChanged(),
                tap(value => {
                    console.log("U osnovnoj listi lijekova texta sam!");
                    //Označavam da je liječnik počeo pretraživati LIJEKOVE OSNOVNE liste
                    this.isPretragaLijekOsnovnaLista = true;
                    //Označavam da je liječnik prestao pretraživati ostale proizvode
                    this.isPretragaLijekDopunskaLista = false;
                    this.isPretragaMagPripravakOsnovnaLista = false;
                    this.isPretragaMagPripravakDopunskaLista = false;
                }),
                switchMap(value => {
                    return this.receptPretragaService.getLijekOsnovnaListaPretraga(value).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa lijeka sa dopunske liste pomoću pretrage
            this.dopunskaListaLijekText.valueChanges.pipe(
                debounceTime(100),
                distinctUntilChanged(),
                tap(value => {
                    console.log("U dopunskoj listi lijekova texta sam!");
                    //Označavam da je liječnik počeo pretraživati LIJEKOVE DOPUNSKE liste
                    this.isPretragaLijekDopunskaLista = true;
                    //Označavam da je liječnik prestao pretraživati ostale proizvode
                    this.isPretragaLijekOsnovnaLista = false;
                    this.isPretragaMagPripravakOsnovnaLista = false;
                    this.isPretragaMagPripravakDopunskaLista = false;
                }),
                switchMap(value => {
                    return this.receptPretragaService.getLijekDopunskaListaPretraga(value).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa mag. pripravka sa osnovne liste pomoću pretrage
            this.osnovnaListaMagPripravakText.valueChanges.pipe(
                debounceTime(100),
                distinctUntilChanged(),
                tap(value => {
                    console.log("U osnovnoj listi mag. pripravaka sam!");
                    //Označavam da je liječnik počeo pretraživati MAGISTRALNE PRIPRAVKE sa OSNOVNE LISTE
                    this.isPretragaMagPripravakOsnovnaLista = true;
                    //Označavam da je liječnik prestao pretraživati ostale proizvode
                    this.isPretragaMagPripravakDopunskaLista = false;
                    this.isPretragaLijekOsnovnaLista = false;
                    this.isPretragaLijekDopunskaLista = false;
                }),
                switchMap(value => {
                    return this.receptPretragaService.getMagPripravciOsnovnaListaPretraga(value).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa mag. pripravka sa dopunske liste pomoću pretrage
            this.dopunskaListaMagPripravakText.valueChanges.pipe(
                debounceTime(100),
                distinctUntilChanged(),
                tap(value => {
                    console.log("U dopunskoj listi mag. pripravaka sam!");
                    //Označavam da je liječnik počeo pretraživati MAGISTRALNE PRIPRAVKE sa DOPUNSKE LISTE
                    this.isPretragaMagPripravakDopunskaLista = true;
                    //Označavam da je liječnik prestao pretraživati ostale proizvode
                    this.isPretragaMagPripravakOsnovnaLista = false;
                    this.isPretragaLijekOsnovnaLista = false;
                    this.isPretragaLijekDopunskaLista = false;
                }),
                switchMap(value => {
                    return this.receptPretragaService.getMagPripravciDopunskaListaPretraga(value).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                }),
                takeUntil(this.pretplateSubject)
            )
        ).subscribe(
            (odgovor) => {
                //Ako liječnik pretražuje LIJEKOVE sa OSNOVNE LISTE
                if(this.isPretragaLijekOsnovnaLista){
                    //Ako je polje unosa prazno
                    if(this.osnovnaListaLijekText.value.length === 0){
                        //Digni ul tag
                        this.isPretragaLijekOsnovnaLista = false;
                        //Ažuriraj validaciju cijele forme
                        this.forma.updateValueAndValidity({emitEvent: false});
                    }
                    //Ako je server vratio uspješnu poruku
                    if(odgovor["success"] !== "false"){
                        //Prolazim kroz LIJEKOVE OSNOVNE LISTE
                        for(const lijek of this.lijekoviOsnovnaListaOJP){
                            //Ako je neki lijek (malim slovima) jednak lijeku (malim slovima) koji je liječnik upisao u pretragu
                            if(lijek.toLowerCase() === this.osnovnaListaLijekText.value.toLowerCase()){
                                //Postavljam lijek iz polja u polje pretrage automatski
                                this.osnovnaListaLijekText.patchValue(lijek,{emitEvent: false});
                                //Ažuriram validaciju cijele forme
                                this.forma.updateValueAndValidity({emitEvent: false});
                            }
                        }
                        //Ako se unesena vrijednost polja pretrage NALAZI u polju osnovnih lijekova BEZ ODABIRA IZ LISTE
                        if(this.lijekoviOsnovnaListaOJP.indexOf(this.osnovnaListaLijekText.value) !== -1){
                            //Pozivam metodu koja se poziva kada liječnik unese ispravan lijek sa osnovne liste
                            this.ispravanUnosLijekOL(this.osnovnaListaLijekText.value);
                        }
                        //Resetiram poruku 
                        this.porukaNemaRezultata = null;
                        //Spremam odgovor servera u svoje polje rezultata
                        this.resultLijekOsnovnaLista = odgovor;
                    } 
                    //Ako je server vratio da nema rezultata
                    else{
                        //Ažuriram validaciju cijele forme
                        this.forma.updateValueAndValidity({emitEvent: false});
                        //Ako NEMA vrijednosti u dropdownu dopunske liste lijekova ili u tekstualnom polju
                        if(!this.dopunskaListaLijekDropdown.value && !this.dopunskaListaLijekText.value){
                            //Digni cijene
                            this.isCijene = false;
                        }
                        //Spremam odgovor servera da nema rezultata
                        this.porukaNemaRezultata = odgovor["message"];
                    } 
                }
                //Ako liječnik pretražuje LIJEKOVE sa DOPUNSKE LISTE
                else if(this.isPretragaLijekDopunskaLista){
                    //Ako je polje unosa prazno
                    if(this.dopunskaListaLijekText.value.length === 0){
                        //Ažuriram validaciju cijele forme
                        this.forma.updateValueAndValidity({emitEvent: false});
                        //Digni ul tag
                        this.isPretragaLijekDopunskaLista = false;
                        //Ako dropdown dopunske liste lijekova nije prazan
                        if(!this.dopunskaListaLijekDropdown.value){
                            //Digni cijene
                            this.isCijene = false;
                        }
                    }
                    //Ako je server vratio uspješnu poruku (tj. da ima rezultata)
                    if(odgovor["success"] !== "false"){
                        //Prolazim kroz lijekove dopunske liste
                        for(const lijek of this.lijekoviDopunskaListaOJP){
                            //Ako je lijek iz polja (malim slovima) jednak unesenome lijeku (malim slovima)
                            if(lijek.toLowerCase() === this.dopunskaListaLijekText.value.toLowerCase()){
                                //Postavljam lijek iz polja u polje pretrage
                                this.dopunskaListaLijekText.patchValue(lijek,{emitEvent: false});
                                //Ažuriram validaciju cijele forme
                                this.forma.updateValueAndValidity({emitEvent: false});
                            }
                        }
                        //Ako se unesena vrijednost u polju pretrage DOPUNSKE LISTE LIJEKOVA nalazi u polju dopunske liste lijekova
                        if(this.lijekoviDopunskaListaOJP.indexOf(this.dopunskaListaLijekText.value) !== -1){
                            //Pozivam metodu koja se poziva kada liječnik unese ispravan lijek sa DOPUNSKE LISTE
                            this.ispravanUnosLijekDL(this.dopunskaListaLijekText.value);
                        }
                        //Resetiram poruku
                        this.porukaNemaRezultata = null;
                        //Spremam odgovor servera u svoje polje rezultata
                        this.resultLijekDopunskaLista = odgovor;
                    }
                    //Ako server NIJE vratio rezultate
                    else{
                        //Ažuriram validaciju cijele forme
                        this.forma.updateValueAndValidity({emitEvent: false});
                        //Ako dropdown dopunske liste lijekova nije prazan
                        if(!this.dopunskaListaLijekDropdown.value){
                            //Digni cijene
                            this.isCijene = false;
                        } 
                        //Spremam odgovor servera da nema rezultata
                        this.porukaNemaRezultata = odgovor["message"];
                    }
                } 
                //Ako liječnik pretražuje MAGISTRALNE PRIPRAVKE sa OSNOVNE LISTE
                else if(this.isPretragaMagPripravakOsnovnaLista){
                    //Ako je polje unosa prazno
                    if(this.osnovnaListaMagPripravakText.value.length === 0){
                        //Ažuriram validaciju cijele forme
                        this.forma.updateValueAndValidity({emitEvent: false});
                        //Digni ul tag
                        this.isPretragaMagPripravakOsnovnaLista = false;
                    }
                    //Ako JE server vratio neke rezultate
                    if(odgovor["success"] !== "false"){
                        //Prolazim polje mag.pripravaka osnovne liste
                        for(const magPripravak of this.magPripravciOsnovnaLista){
                            //Ako je mag.pripravak iz polja (malim slovima) JEDNAK mag. pripravku iz polja pretrage (malim slovima)
                            if(magPripravak.toLowerCase() === this.osnovnaListaMagPripravakText.value.toLowerCase()){
                                //Postavljam mag. pripravak iz polja u polje pretrage
                                this.osnovnaListaMagPripravakText.patchValue(magPripravak,{emitEvent: false});
                                //Ažuriram validaciju cijele forme
                                this.forma.updateValueAndValidity({emitEvent: false});
                            }
                        }
                        //Ako se vrijednost u polju unosa NALAZI u polju mag. pripravaka OSNOVNE LISTE
                        if(this.magPripravciOsnovnaLista.indexOf(this.osnovnaListaMagPripravakText.value) !== -1){
                            //Pozivam metodu koja se poziva kada liječnik unese ispravan mag. pripravak sa DOPUNSKE LISTE
                            this.ispravanUnosMagPripravakOL(this.osnovnaListaMagPripravakText.value);
                        }
                        //Resetiram poruku
                        this.porukaNemaRezultata = null;
                        //Spremam odgovor servera u svoje polje rezultata
                        this.resultMagPripravciOsnovnaLista = odgovor;
                    }
                    //Ako server NIJE vratio rezultate
                    else{
                        //Ažuriram validaciju cijele forme
                        this.forma.updateValueAndValidity({emitEvent: false});
                        //Ako nema vrijednosti u dropdownu mag. pripravaka dopunske liste
                        if(!this.dopunskaListaMagPripravakDropdown.value && !this.dopunskaListaMagPripravakText.value){
                            //Digni cijene
                            this.isCijene = false;
                        }
                        //Spremam odgovor servera da nema rezultata
                        this.porukaNemaRezultata = odgovor["message"];
                    }
                }
                //Ako liječnik pretražuje MAGISTRALNE PRIPRAVKE sa DOPUNSKE LISTE
                else if(this.isPretragaMagPripravakDopunskaLista){
                    //Ako je polje unosa prazno
                    if(this.dopunskaListaMagPripravakText.value.length === 0){
                        //Ažuriram validaciju cijele forme
                        this.forma.updateValueAndValidity({emitEvent: false});
                        //Ako dropdown dopunske liste magistralnih pripravaka nije prazan
                        if(!this.dopunskaListaMagPripravakDropdown.value){
                            //Digni cijene
                            this.isCijene = false;
                        }
                        //Digni ul tag
                        this.isPretragaMagPripravakDopunskaLista = false;
                    }
                    //Ako JE server vratio neke rezultate
                    if(odgovor["success"] !== "false"){
                        //Prolazim kroz polje mag. pripravaka dopunske liste
                        for(const magPripravak of this.magPripravciDopunskaLista){
                            //Ako je mag. pripravak iz polja (malim slovima) JEDNAK mag. pripravku iz polja pretrage (malim slovima)
                            if(magPripravak.toLowerCase() === this.dopunskaListaMagPripravakText.value.toLowerCase()){
                                //Postavljam mag. pripravak iz polja u polje pretrage
                                this.dopunskaListaMagPripravakText.patchValue(magPripravak,{emitEvent: false});
                                //Ažuriram validaciju cijele forme
                                this.forma.updateValueAndValidity({emitEvent: false});
                            }
                        }
                        //Ako se vrijednost u polju unosa NALAZI u polju mag. pripravaka DOPUNSKE LISTE
                        if(this.magPripravciDopunskaLista.indexOf(this.dopunskaListaMagPripravakText.value) !== -1){
                            //Pozivam metodu koja se poziva kada liječnik unese ispravan mag.pripravak sa DOPUNSKE LISTE
                            this.ispravanUnosMagPripravakDL(this.dopunskaListaMagPripravakText.value);
                        }
                        //Resetiram poruku
                        this.porukaNemaRezultata = null;
                        //Spremam odgovor servera u svoje polje rezultata
                        this.resultMagPripravciDopunskaLista = odgovor;
                    }
                    //Ako server NIJE vratio rezultate
                    else{
                        //Ažuriram validaciju cijele forme
                        this.forma.updateValueAndValidity({emitEvent: false});
                        //Ako dropdown dopunske liste magistralnih pripravaka nije prazan
                        if(!this.dopunskaListaMagPripravakDropdown.value){
                            //Digni cijene
                            this.isCijene = false;
                        }
                        //Spremam odgovor servera da nema rezultata
                        this.porukaNemaRezultata = odgovor["message"];
                    }
                }
            }
        );
    }

    //Metoda koja se pokreće kada korisnik unese pravu vrijednost u polje pretrage OSNOVNE LISTE LIJEKOVA
    ispravanUnosLijekOL(lijek: string){
        //Ažuriram validaciju cijele forme
        this.forma.updateValueAndValidity({emitEvent: false});
        //Skrivam ul tag
        this.isPretragaLijekOsnovnaLista = false;
        //Sakrij cijene
        this.isCijene = false;
        //Resetiraj dropdown i tekstualno polje dopunske liste lijekova te dropdown osnovne liste lijekova
        this.dopunskaListaLijekDropdown.patchValue(null,{emitEvent: false});
        this.dopunskaListaLijekText.patchValue("",{emitEvent: false});
        this.osnovnaListaLijekDropdown.patchValue(null,{emitEvent: false});
        //Pretplaćujem se na informaciju ima li izabrani lijek oznaku "RS"
        const combined = forkJoin([
            this.receptService.getOznakaLijek(lijek),
            AzurirajDostatnost.azuriranjeDostatnosti(this.forma,this.receptService)
        ]).pipe(
            //Dohvaćam odgovor
            tap((odgovor) => {
                console.log(odgovor);
                //Ako je server vratio da ovaj lijek IMA oznaku "RS":
                if(odgovor[0].success === "true"){
                    //Označavam da treba prikazati polje unosa šifre specijalista
                    this.isSpecijalist = true;
                    //Ažuriram ponovno sve validatore
                    this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                        this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                        this.isLijek,this.isMagPripravak),
                        this.isValidDijagnoze.bind(this),
                        Validacija.doziranjePrijeProizvod(),
                        Validacija.kolicinaPrijeProizvod(),
                        Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                    //Ažuriram stanje validacije
                    this.forma.updateValueAndValidity({emitEvent: false});
                }
                //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                else{
                    this.isSpecijalist = false;
                    //Ažuriram ponovno sve validatore
                    this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                        this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                        this.isLijek,this.isMagPripravak),
                        this.isValidDijagnoze.bind(this),
                        Validacija.doziranjePrijeProizvod(),
                        Validacija.kolicinaPrijeProizvod(),
                        Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                    //Ažuriram stanje validacije
                    this.forma.updateValueAndValidity({emitEvent: false});
                }
            }),
            concatMap(value => {
                //Ako vrijednost dostatnosti NIJE NULL
                if(value[1] !== null){
                    //Ažuriram polje trajanja terapije
                    this.dostatnost.patchValue(value[1].toString(),{emitEvent: false});
                    return this.receptService.getDatumDostatnost(value[1].toString()).pipe(
                        tap(datum => {
                            //Postavljam datum
                            this.vrijediDo.patchValue(datum,{emitEvent: false});
                        }),
                        takeUntil(this.pretplateSubject)
                    );
                }
                //Ako JE vrijednost dostatnosti null
                else if(value[1] === null){
                    //Ponovno postavljam trajanje terapije na 30 dana
                    this.trajanjeTerapije = 30;
                    //Ako je postavljen broj ponavljanja
                    if(this.brojPonavljanja.value){
                        this.trajanjeTerapije = this.trajanjeTerapije * (+this.brojPonavljanja.value + 1);
                    }
                    //Nastavi stream
                    return of(null).pipe(
                        tap(value => {
                            //Računam dostatnost pa ga postavljam u polje
                            this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
                        }),
                        //Kada server vrati null za dostatnost, pozovi funkciju koja ažurira datum "vrijediDo"
                        concatMap(value => {
                            return this.receptService.getDatumDostatnost(this.trajanjeTerapije.toString()).pipe(
                                tap(datum => {
                                    //Postavi datum
                                    this.vrijediDo.patchValue(datum,{emitEvent: false});
                                }),
                                takeUntil(this.pretplateSubject)
                            );
                        }),
                        takeUntil(this.pretplateSubject)
                    );
                }
            }), 
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }
    //Metoda koja se poziva kada liječnik unese pravu vrijednost lijeka sa DOPUNSKE LISTE LIJEKOVA
    ispravanUnosLijekDL(lijek: string){
        //Ažuriram validaciju cijele forme
        this.forma.updateValueAndValidity({emitEvent: false});
        //Skrivam ul tag
        this.isPretragaLijekDopunskaLista = false;
        //Prikaži cijene
        this.isCijene = true;
        //Resetiraj dropdown i tekstualno polje osnovne liste lijekova te dropdown dopunske liste lijekova
        this.osnovnaListaLijekDropdown.patchValue(null,{emitEvent: false});
        this.osnovnaListaLijekText.patchValue("",{emitEvent: false});
        this.dopunskaListaLijekDropdown.patchValue(null,{emitEvent: false});
        //Pretplaćujem se na Observable u kojemu se nalaze cijene i informacija je li lijek ima oznaku "RS"
        const combined = forkJoin([
            this.receptService.getCijenaLijekDL(lijek),
            this.receptService.getOznakaLijek(lijek),
            AzurirajDostatnost.azuriranjeDostatnosti(this.forma,this.receptService)
        ]).pipe(
            tap(odgovor => {
                //Postavljam dohvaćene cijene u formu
                this.cijenaUkupno.patchValue(`${odgovor[0][0].cijenaLijek} kn`,{emitEvent: false});
                this.cijenaZavod.patchValue(`${odgovor[0][0].cijenaZavod} kn`,{emitEvent: false});
                this.cijenaOsiguranik.patchValue(`${odgovor[0][0].doplataLijek} kn`,{emitEvent: false});
                //Ako je server vratio da ovaj lijek IMA oznaku "RS":
                if(odgovor[1].success === "true"){
                    //Označavam da treba prikazati polje unosa šifre specijalista
                    this.isSpecijalist = true;
                    //Inicijalno dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                        this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                        this.isLijek,this.isMagPripravak),
                        this.isValidDijagnoze.bind(this),
                        Validacija.doziranjePrijeProizvod(),
                        Validacija.kolicinaPrijeProizvod(),
                        Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                    //Ažuriram stanje validacije
                    this.forma.updateValueAndValidity({emitEvent: false});
                }
                //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                else{
                    this.isSpecijalist = false;
                    //Inicijalno dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                        this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                        this.isLijek,this.isMagPripravak),
                        this.isValidDijagnoze.bind(this),
                        Validacija.doziranjePrijeProizvod(),
                        Validacija.kolicinaPrijeProizvod(),
                        Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                    //Ažuriram stanje validacije
                    this.forma.updateValueAndValidity({emitEvent: false});
                }
            }),
            concatMap(odgovor => {
                //Ako vrijednost dostatnosti NIJE NULL
                if(odgovor[2] !== null){
                    //Ažuriram polje trajanja terapije
                    this.dostatnost.patchValue(odgovor[2].toString(),{emitEvent: false});
                    //Prosljeđivam dostatnost u danima funkciji za računanje datuma
                    return this.receptService.getDatumDostatnost(odgovor[2].toString()).pipe(
                        tap(datum => {
                            //Postavljam datum
                            this.vrijediDo.patchValue(datum,{emitEvent: false});
                        }),
                        takeUntil(this.pretplateSubject)
                    );
                }
                //Ako JE vrijednost datuma null
                else if(odgovor[2] === null){
                    //Ponovno postavljam trajanje terapije na 30 dana
                    this.trajanjeTerapije = 30;
                    //Ako je postavljen broj ponavljanja
                    if(this.brojPonavljanja.value){
                        this.trajanjeTerapije = this.trajanjeTerapije * (+this.brojPonavljanja.value + 1);
                    }
                    //Nastavi stream
                    return of(null).pipe(
                        tap(value => {
                            //Računam dostatnost pa ga postavljam u polje
                            this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
                        }),
                        //Kada server vrati null za dostatnost, pozovi funkciju koja ažurira datum "vrijediDo"
                        concatMap(value => {
                            return this.receptService.getDatumDostatnost(this.trajanjeTerapije.toString()).pipe(
                                tap(datum => {
                                    //Postavi datum
                                    this.vrijediDo.patchValue(datum,{emitEvent: false});
                                }),
                                takeUntil(this.pretplateSubject)
                            );
                        }),
                        takeUntil(this.pretplateSubject)
                    );
                }
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }
    //Metoda koja se poziva kada liječnik unese ispravan unos MAG.PRIPRAVKA iz OSNOVNE LISTE
    ispravanUnosMagPripravakOL(magPripravak: string){
        //Ažuriram validaciju cijele forme
        this.forma.updateValueAndValidity({emitEvent: false});
        //Skrivam ul tag
        this.isPretragaMagPripravakOsnovnaLista = false;
        //Sakrij cijene
        this.isCijene = false;
        //Resetiraj dropdown i tekstualno polje dopunske liste magistralnih pripravaka te dropdown osnovne liste mag. pripravaka
        this.dopunskaListaMagPripravakDropdown.patchValue(null,{emitEvent: false});
        this.dopunskaListaMagPripravakText.patchValue("",{emitEvent: false});
        this.osnovnaListaMagPripravakDropdown.patchValue(null,{emitEvent: false});
        //Ponovno postavljam trajanje terapije na 30 dana
        this.trajanjeTerapije = 30;
        //Ako je postavljen broj ponavljanja
        if(this.brojPonavljanja.value){
            this.trajanjeTerapije = this.trajanjeTerapije * (+this.brojPonavljanja.value + 1);
        }
        //Postavi dane dostatnosti inicijalno na 30 dana
        this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
        //Pretplaćujem se na Observable koji sadrži informaciju je li MAGISTRALNI PRIPRAVAK ima oznaku "RS"
        const combined = forkJoin([
            this.receptService.getOznakaMagistralniPripravak(magPripravak),
            this.receptService.getDatumDostatnost(this.trajanjeTerapije.toString())
        ]).pipe(
            //Dohvaćam odgovor
            tap((odgovor) => {
                //Ako je server vratio da ovaj mag.pripravak IMA oznaku "RS":
                if(odgovor[0].success === "true"){
                    //Označavam da treba prikazati polje unosa šifre specijalista
                    this.isSpecijalist = true;
                    //Inicijalno dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                        this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                        this.isLijek,this.isMagPripravak),
                        this.isValidDijagnoze.bind(this),
                        Validacija.doziranjePrijeProizvod(),
                        Validacija.kolicinaPrijeProizvod(),
                        Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                    //Ažuriram stanje validacije
                    this.forma.updateValueAndValidity({emitEvent: false});
                }
                //Ako je server vratio da ovaj mag.pripravak NEMA oznaku "RS":
                else{
                    this.isSpecijalist = false;
                    //Inicijalno dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                        this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                        this.isLijek,this.isMagPripravak),
                        this.isValidDijagnoze.bind(this),
                        Validacija.doziranjePrijeProizvod(),
                        Validacija.kolicinaPrijeProizvod(),
                        Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                    //Ažuriram stanje validacije
                    this.forma.updateValueAndValidity({emitEvent: false});
                }
                //Postavljam datum 
                this.vrijediDo.patchValue(odgovor[1],{emitEvent: false});
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }
    //Metoda koja se poziva kada liječnik unese ispravan unos MAG. PRIPRAVKA sa DOPUNSKE LISTE
    ispravanUnosMagPripravakDL(magPripravak: string){
        //Ažuriram validaciju cijele forme
        this.forma.updateValueAndValidity({emitEvent: false});
        //Skrivam ul tag
        this.isPretragaMagPripravakDopunskaLista = false;
        //Prikaži cijene
        this.isCijene = true;
        //Resetiraj dropdown i tekstualno polje osnovne liste magistralnih pripravaka te dropdown dopunske liste mag. pripravaka
        this.osnovnaListaMagPripravakDropdown.patchValue(null,{emitEvent: false});
        this.osnovnaListaMagPripravakText.patchValue("",{emitEvent: false});
        this.dopunskaListaMagPripravakDropdown.patchValue(null,{emitEvent: false});
        //Ponovno postavljam trajanje terapije na 30 dana
        this.trajanjeTerapije = 30;
        //Ako je postavljen broj ponavljanja
        if(this.brojPonavljanja.value){
            this.trajanjeTerapije = this.trajanjeTerapije * (+this.brojPonavljanja.value + 1);
        }
        //Postavi dostatnost inicijalno na 30 dana
        this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
        //Pretplaćujem se na cijene izabranog magistralnog pripravka sa dopunske liste te njegovu oznaku
        const combined = forkJoin([
            this.receptService.getCijenaMagPripravakDL(magPripravak),
            this.receptService.getOznakaMagistralniPripravak(magPripravak),
            this.receptService.getDatumDostatnost(this.trajanjeTerapije.toString())
        ]).pipe(
            tap(value => {
                console.log(value);
                //Postavljam cijene magistralnog pripravka u formu
                this.cijenaUkupno.patchValue(`${value[0][0].cijenaMagPripravak} kn`,{emitEvent: false});
                this.cijenaZavod.patchValue(`${value[0][0].cijenaZavod} kn`,{emitEvent: false});
                this.cijenaOsiguranik.patchValue(`${value[0][0].doplataMagPripravak} kn`,{emitEvent: false});
                //Ako je server vratio da ovaj lijek IMA oznaku "RS":
                if(value[1].success === "true"){
                    //Označavam da treba prikazati polje unosa šifre specijalista
                    this.isSpecijalist = true;
                    //Inicijalno dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                        this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                        this.isLijek,this.isMagPripravak),
                        this.isValidDijagnoze.bind(this),
                        Validacija.doziranjePrijeProizvod(),
                        Validacija.kolicinaPrijeProizvod(),
                        Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                    //Ažuriram stanje validacije
                    this.forma.updateValueAndValidity({emitEvent: false});
                }
                //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                else{
                    this.isSpecijalist = false;
                    //Inicijalno dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                        this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                        this.isLijek,this.isMagPripravak),
                        this.isValidDijagnoze.bind(this),
                        Validacija.doziranjePrijeProizvod(),
                        Validacija.kolicinaPrijeProizvod(),
                        Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
                    //Ažuriram stanje validacije
                    this.forma.updateValueAndValidity({emitEvent: false});
                }
                //Postavljam datum
                this.vrijediDo.patchValue(value[2],{emitEvent: false});
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }
    //Metoda koja se pokreće kada liječnik izabere neki proizvod iz liste pretrage
    onClickLi(proizvod: string){
        //Ako se naziv proizvoda NALAZI u listi lijekova OSNOVNE LISTE
        if(this.lijekoviOsnovnaListaOJP.indexOf(proizvod) !== -1){
            //U polje unosa pretrage osnovne liste lijekova, stavljam tu vrijednost
            this.osnovnaListaLijekText.patchValue(proizvod,{emitEvent: false});
            //Pozivam metodu koja se pokreće kada liječnik ispravno unese lijek sa OSNOVNE LISTE
            this.ispravanUnosLijekOL(proizvod);
            //Ažuriraj sve validatore ponovno
            this.forma.updateValueAndValidity();
        }
        //Ako se naziv proizvoda NALAZI u listi lijekova DOPUNSKE LISTE
        else if(this.lijekoviDopunskaListaOJP.indexOf(proizvod) !== -1){
            //U polje unosa pretrage dopunske liste lijekova, stavljam tu vrijednost
            this.dopunskaListaLijekText.patchValue(proizvod,{emitEvent: false});
            //Pozivam metodu koja se pokreće kada liječnik ispravno unese lijek sa DOPUNSKE LISTE
            this.ispravanUnosLijekDL(proizvod);
            //Ažuriraj sve validatore ponovno
            this.forma.updateValueAndValidity();
        }
        //Ako se naziv proizvoda NALAZI u listi MAGISTRALNIH PRIPRAVAKA OSNOVNE LISTE
        else if(this.magPripravciOsnovnaLista.indexOf(proizvod) !== -1){
            //U polje unosa pretrage osnovne liste magistralnih pripravaka, stavljam tu vrijednost
            this.osnovnaListaMagPripravakText.patchValue(proizvod,{emitEvent: false});
            //Pozivam metodu koja se pokreće kada liječnik ispravno unese mag. pripravak sa OSNOVNE LISTE
            this.ispravanUnosMagPripravakOL(proizvod);
            //Ažuriraj sve validatore ponovno
            this.forma.updateValueAndValidity();
        }
        //Ako se naziv proizvoda NALAZI u listi MAGISTRALNIH PRIPRAVAKA DOPUNSKE LISTE
        else if(this.magPripravciDopunskaLista.indexOf(proizvod) !== -1){
            //U polje unosa pretrage dopunske liste magistralnih pripravaka, stavljam tu vrijednost
            this.dopunskaListaMagPripravakText.patchValue(proizvod,{emitEvent: false});
            //Pozivam metodu koja se pokreće kada liječnik ispravno unese mag. pripravak sa DOPUNSKE LISTE
            this.ispravanUnosMagPripravakDL(proizvod);
            //Ažruriraj sve validatore ponovno
            this.forma.updateValueAndValidity();
        }
    }

    //Metoda koja se pokreće kada se promijeni vrijednost radio buttona
    onChange($event){
        //Ako radio button koji je kliknut ima vrijednost "Lijek":
        if($event.target.value === "lijek"){
            //Resetiram poruku koja objavljuje da nema rezultata
            this.porukaNemaRezultata = null;
            //Označavam da liječnik ne želi unijeti mag. pripravak
            this.isMagPripravak = false;
            //Označavam da liječnik želi unijeti lijek
            this.isLijek = true;
            /* //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
            this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                                    this.isLijek,this.isMagPripravak),
                                    this.isValidDijagnoze.bind(this),
                                    Validacija.doziranjePrijeProizvod(),
                                    Validacija.kolicinaPrijeProizvod(),
                                    Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
            //Ažuriram stanje validacije
            this.forma.updateValueAndValidity({emitEvent: false}); */
            azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                this.isMagPripravak, this.isSpecijalist);
            //Sakrij cijene
            this.isCijene = false;
            //Resetiram sva polja vezana za magistralne pripravke
            this.osnovnaListaMagPripravakDropdown.patchValue(null,{emitEvent: false});
            this.osnovnaListaMagPripravakText.patchValue("",{emitEvent: false});
            this.dopunskaListaMagPripravakDropdown.patchValue(null,{emitEvent: false});
            this.dopunskaListaMagPripravakText.patchValue("",{emitEvent: false});  
            //Dižem polje unosa šifre specijalista
            this.isSpecijalist = false;
        }
        else if($event.target.value === "magPripravak"){
            //Resetiram poruku koja objavljuje da nema rezultata
            this.porukaNemaRezultata = null;
            //Označavam da liječnik želi unijeti mag.pripravak
            this.isMagPripravak = true;
            //Označavam da liječnik ne želi unijeti lijek
            this.isLijek = false;
            /* //Dinamački postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
            this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                                    this.isLijek,this.isMagPripravak),
                                    this.isValidDijagnoze.bind(this),
                                    Validacija.doziranjePrijeProizvod(),
                                    Validacija.kolicinaPrijeProizvod(),
                                    Validacija.provjeraSifraSpecijalist(this.isSpecijalist)]);
            //Ažuriram stanje validacije
            this.forma.updateValueAndValidity({emitEvent: false}); */
            azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                this.isMagPripravak, this.isSpecijalist);
            //Sakrij cijene
            this.isCijene = false;
            //Resetiram sva polja vezana uz lijekove
            this.osnovnaListaLijekDropdown.patchValue(null,{emitEvent: false});
            this.osnovnaListaLijekText.patchValue("",{emitEvent: false});
            this.dopunskaListaLijekDropdown.patchValue(null,{emitEvent: false});
            this.dopunskaListaLijekText.patchValue("",{emitEvent: false});
            //Dižem polje unosa šifre specijalista
            this.isSpecijalist = false;
        }
    }

    //Metoda koja se poziva kada liječnik klikne "Unesi novi recept":
    onSubmit(){
        //Ako je forma neispravna
        if(!this.forma.valid){
            return;
        }
        console.log(this.forma.getRawValue());
        //Pomoćno polje u koje spremam samo MKB šifre sek. dijagnoza
        let mkbPolje: string[] = [];
        //Prolazim kroz polje sekundarnih dijagnoza i uzimam samo MKB šifre
        for(const el of this.getControlsSekundarna()){
            if(el.value.mkbSifraSekundarna !== null){
                mkbPolje.push(el.value.mkbSifraSekundarna);
            }
        }
        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na dodavanje novog recepta
        this.receptService.dodajRecept(this.mkbPrimarnaDijagnoza.value,mkbPolje,this.osnovnaListaLijekDropdown.value,
                                    this.osnovnaListaLijekText.value,this.dopunskaListaLijekDropdown.value,this.dopunskaListaLijekText.value,
                                    this.osnovnaListaMagPripravakDropdown.value,this.osnovnaListaMagPripravakText.value,
                                    this.dopunskaListaMagPripravakDropdown.value,this.dopunskaListaMagPripravakText.value,
                                    this.kolicinaDropdown.value,this.doziranjeFrekvencija.value + "x" + this.doziranjePeriod.value,
                                    this.dostatnost.value,this.hitnost.value ? "hitno": "nijehitno",
                                    this.ponovljivost.value ? "ponovljiv": "obican",this.brojPonavljanja.value).pipe(
            tap(odgovor => {
                console.log(odgovor);
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();  
    }

    //Metoda se poziva kada liječnik promijeni količinu (broj pakiranja proizvoda)
    promijeniKolicina(kolicina: string){
        if(kolicina === "1"){
            //Postavi polje rimske oznake:
            this.kolicinaRimski.patchValue("I unam",{emitEvent: false});
        }
        else if(kolicina === "2"){
            //Postavi polje rimske oznake:
            this.kolicinaRimski.patchValue("II duas",{emitEvent: false});
        }
    }

    //Metoda koja popunjava polje unosa riječima broja ponavljanja
    onChangeBrojPonavljanja(brojPonavljanja: string){
        //Ako je broj ponavljanja 1:
        if(brojPonavljanja === "1"){
            //U polje unosa riječima postavi vrijednost koja odgovara tom broju 
            this.rijecimaBrojPonavljanja.patchValue("jedan put",{emitEvent: false});
            //Postavljam validatore na polje dostatnosti
            this.dostatnost.setValidators([Validacija.provjeriDostatnost(this.isPonovljiv,this.brojPonavljanja.value),Validators.pattern("^[0-9]*$"),Validators.required]); 
            //Ažuriram validaciju
            this.dostatnost.updateValueAndValidity({emitEvent: false});
        }
        //Ako je broj ponavljanja 2:
        else if(brojPonavljanja === "2"){
            //U polje unosa riječima postavi vrijednost koja odgovara tom broju 
            this.rijecimaBrojPonavljanja.patchValue("dva puta",{emitEvent: false});
            //Postavljam validatore na polje dostatnosti
            this.dostatnost.setValidators([Validacija.provjeriDostatnost(this.isPonovljiv,this.brojPonavljanja.value),Validators.pattern("^[0-9]*$"),Validators.required]); 
            //Ažuriram validaciju
            this.dostatnost.updateValueAndValidity({emitEvent: false});
        }
        //Ako je broj ponavljanja 3:
        else if(brojPonavljanja === "3"){
            //U polje unosa riječima postavi vrijednost koja odgovara tom broju 
            this.rijecimaBrojPonavljanja.patchValue("tri puta",{emitEvent: false});
            //Postavljam validatore na polje dostatnosti
            this.dostatnost.setValidators([Validacija.provjeriDostatnost(this.isPonovljiv,this.brojPonavljanja.value),Validators.pattern("^[0-9]*$"),Validators.required]); 
            //Ažuriram validaciju
            this.dostatnost.updateValueAndValidity({emitEvent: false});
        }
        //Ako je broj ponavljanja 4:
        else if(brojPonavljanja === "4"){
            //U polje unosa riječima postavi vrijednost koja odgovara tom broju 
            this.rijecimaBrojPonavljanja.patchValue("četiri puta",{emitEvent: false});
            //Postavljam validatore na polje dostatnosti
            this.dostatnost.setValidators([Validacija.provjeriDostatnost(this.isPonovljiv,this.brojPonavljanja.value),Validators.pattern("^[0-9]*$"),Validators.required]); 
            //Ažuriram validaciju
            this.dostatnost.updateValueAndValidity({emitEvent: false});
        }
        //Ako je broj ponavljanja 5:
        else if(brojPonavljanja === "5"){
            //U polje unosa riječima postavi vrijednost koja odgovara tom broju 
            this.rijecimaBrojPonavljanja.patchValue("pet puta",{emitEvent: false});
            //Postavljam validatore na polje dostatnosti
            this.dostatnost.setValidators([Validacija.provjeriDostatnost(this.isPonovljiv,this.brojPonavljanja.value),Validators.pattern("^[0-9]*$"),Validators.required]); 
            //Ažuriram validaciju
            this.dostatnost.updateValueAndValidity({emitEvent: false});
        }
    }

    //Ova metoda se izvršava kada liječnik klikne negdje izvan liste pretrage
    zatvoriListu(tip: string){
        //Ako je otvorena lista pretrage LIJEKOVA OSNOVNE LISTE
        if(tip === "lijekOL"){
            //Zatvori listu pretrage osnovne liste lijekova
            this.isPretragaLijekOsnovnaLista = false;
            //Isprazni polje unosa
            this.osnovnaListaLijekText.patchValue("",{emitEvent: false});
        }
        //Ako je otvorena lista pretrage LIJEKOVA DOPUNSKE LISTE
        else if(tip === "lijekDL"){
            //Zatvori listu pretrage dopunske liste lijekova
            this.isPretragaLijekDopunskaLista = false;
            //Isprazni polje unosa 
            this.dopunskaListaLijekText.patchValue("",{emitEvent: false});
        }
        //Ako je otvorena lista pretrage MAGISTRALNIH PRIPRAVAKA OSNOVNE LISTE
        else if(tip === "magPripravakOL"){
            //Zatvori listu pretrage magistralnih pripravaka osnovne liste
            this.isPretragaMagPripravakOsnovnaLista = false;
            //Isprazni polje unosa 
            this.osnovnaListaMagPripravakText.patchValue("",{emitEvent: false});
        }
        //Ako je otvorena lista pretrage MAGISTRALNIH PRIPRAVAKA DOPUNSKE LISTE
        else if(tip === "magPripravakDL"){
            //Zatvori listu pretrage magistralnih pripravaka dopunske liste
            this.isPretragaMagPripravakDopunskaLista = false;
            //Isprazni polje unosa 
            this.dopunskaListaMagPripravakText.patchValue("",{emitEvent: false});
        }
    }

    //Metoda koja provjerava je li uneseno više istih sekundarnih dijagnoza
    isValidSekundarnaDijagnoza(array: FormArray): {[key: string]: boolean}{
        //Kreiram pomoćno polje
        let pom = [];
        //Prolazim kroz array 
        for(let control of array.controls){
            //Ako se vrijednost sekundarne dijagnoze VEĆ NALAZI u pom polju, ali da nije "Odaberite sekundarnu dijagnozu"
            if(pom.indexOf(control.value.nazivSekundarna) !== -1 && control.value.nazivSekundarna !== null){
                //U svoju varijablu spremam sekundarnu dijagnozu koja je duplikat
                this.sekDijagnoza = control.value.nazivSekundarna;
                return {'duplikat': true};
            }
            //Ako se vrijednost sekundarne dijagnoze NE NALAZI u pom polju
            else{
                //Dodaj ga u pom polje
                pom.push(control.value.nazivSekundarna);
            }
        }
        return null;
    }  
    
    //Metoda koja provjerava je li primarna dijagnoza ista kao i neka od sekundarnih dijagnoza
    isValidDijagnoze(group: FormGroup): {[key: string]: boolean} | null{
      //Prolazim kroz polje sekundarnih dijagnoza
      for(let control of (group.get('sekundarnaDijagnoza') as FormArray).controls){
          //Ako je vrijednost primarne dijagnoze jednaka vrijednosti sekundarne dijagnoze, ali da oba dvije nisu null, jer bih bilo (Odaberite dijagnozu === Odaberite dijagnozu)
          if(group.get('primarnaDijagnoza').value === control.value.nazivSekundarna && (group.get('primarnaDijagnoza') !== null && control.value.nazivSekundarna !== null)){
              //Spremam vrijednost sekundarne dijagnoze koja je jednaka primarnoj dijagnozi
              this.dijagnoza = control.value.nazivSekundarna;
              return {'primarnaJeIstaKaoSekundarna': true};
          }
      }
      return null;
    }

    //Metoda koja označava hoće li se prikazati dio forme za unos ponavljanja recepta
    onChangePonovljiv($event){
        //Ako je "ponovljiv" checked
        if($event.target.checked){
            //Označi da je recept PONOVLJIV
            this.isPonovljiv = true;
            //Postavljam broj ponavljanja na 1
            this.brojPonavljanja.patchValue("1",{emitEvent: false});
            //Pretplaćivam se na Observable ažuriranja trajanje terapije
            const pretplataTrajanjeTerapije = AzurirajDostatnost.azuriranjeDostatnostiHandler(this.forma,this.receptService,
                                                                                    this.pretplateSubject,this.trajanjeTerapije).subscribe();
            //Postavljam validatore na polje dostatnosti
            this.dostatnost.setValidators([Validacija.provjeriDostatnost(this.isPonovljiv,this.brojPonavljanja.value),Validators.pattern("^[0-9]*$"),Validators.required]); 
            //Ažuriram validaciju
            this.dostatnost.updateValueAndValidity({emitEvent: false});
        }
        //Ako "ponovljiv" NIJE CHECKED
        else{
            //Označi da recept NIJE PONOVLJIV
            this.isPonovljiv = false;
            //Postavljam broj ponavljanja na null
            this.brojPonavljanja.patchValue(null,{emitEvent: false});
            //Pretplaćivam se na Observable ažuriranja trajanje terapije
            const pretplataTrajanjeTerapije = AzurirajDostatnost.azuriranjeDostatnostiHandler(this.forma,this.receptService,
                                                                                    this.pretplateSubject,this.trajanjeTerapije).subscribe();
            //Postavljam validatore na polje dostatnosti
            this.dostatnost.setValidators([Validacija.provjeriDostatnost(this.isPonovljiv,this.brojPonavljanja.value),Validators.pattern("^[0-9]*$"),Validators.required]); 
            //Ažuriram validaciju
            this.dostatnost.updateValueAndValidity({emitEvent: false});
        }
    }

    //Ova metoda se poziva kada korisnik klikne "Izađi" ili negdje izvan prozora
    onClose(){
        this.router.navigate(['../'],{relativeTo: this.route});
    }

    //Ova metoda se poziva kada se promijeni naziv sekundarne dijagnoze
    onChangeNazivSekundarna(nazivSekundarna: string, index: number){
        //Pozivam metodu koja će automatski unijeti MKB šifru sekundarne dijagnoze
        Validacija.nazivToMKBSekundarna(nazivSekundarna,this.dijagnoze,this.forma,index);
    }

    //Dohvaća pojedine form controlove unutar polja 
    getControlsSekundarna(){
        return (this.forma.get('sekundarnaDijagnoza') as FormArray).controls;
    }

    //Kada se klikne button "Dodaj dijagnozu"
    onAddDiagnosis(){
        //Kreiram novi form group
        const formGroup = new FormGroup({
            'nazivSekundarna': new FormControl(null),
            'mkbSifraSekundarna': new FormControl(null)
        },{validators: [Validacija.requiredMKBSifraSekundarna(),Validacija.provjeriMKBSifraSekundarna(this.mkbSifre)]});
        //Nadodavam novi form group u form array
        (<FormArray>this.forma.get('sekundarnaDijagnoza')).push(formGroup);
    }
    //Ova metoda se poziva kada se liječnik krene upisivati vrijednosti u polja MKB šifri sek. dijagnoze
    onChangeMKB(mkbSifra: string,index:number){
        //Ako je MKB ispravno unesen (ako je prošao validaciju)
        if(this.sekundarnaDijagnoza.at(index).valid){
            //Prolazim kroz sve MKB šifre
            for(const mkb of this.mkbSifre){
                //Ako se upisana vrijednost nalazi u polju MKB šifri
                if(mkb.toLowerCase() === mkbSifra.toLowerCase()){
                    //U polje MKB šifri postavi šifru velikim slovima
                    (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('mkbSifraSekundarna').patchValue(mkb,{emitEvent: false});
                }
            }
            //Pozivam metodu da popuni polje naziva primarne dijagnoze
            Validacija.MKBtoNazivSekundarna(mkbSifra,this.dijagnoze,this.forma,index);
        }
        //Ako je MKB neispravno unesen
        else{
            (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('nazivSekundarna').patchValue(null,{emitEvent: false});
        }
    }

    //Kada se klikne button "X"
    onDeleteDiagnosis(index: number){
        //Obriši form group na indexu kliknutog retka
        this.sekundarnaDijagnoza.removeAt(index);
    }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnDestroy(){
        //Postavljam Subject na true
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

    //Getteri za dijelove forme
    get primarnaDijagnoza(): FormControl{
        return this.forma.get('primarnaDijagnoza') as FormControl;
    }
    get mkbPrimarnaDijagnoza(): FormControl{
        return this.forma.get('mkbPrimarnaDijagnoza') as FormControl;
    }
    get sekundarnaDijagnoza(): FormArray{
      return this.forma.get('sekundarnaDijagnoza') as FormArray;
    }
    get tip(): FormGroup{
        return this.forma.get('tip') as FormGroup;
    }
    get lijek(): FormControl{
        return this.forma.get('tip.lijek') as FormControl;
    }
    get magPripravak(): FormControl{
        return this.forma.get('tip.magPripravak') as FormControl;
    }
    get osnovnaListaLijek(): FormGroup{
        return this.forma.get('osnovnaListaLijek') as FormGroup;
    }
    get osnovnaListaLijekDropdown(): FormControl{
        return this.forma.get('osnovnaListaLijek.osnovnaListaLijekDropdown') as FormControl;
    }
    get osnovnaListaLijekText(): FormControl{
        return this.forma.get('osnovnaListaLijek.osnovnaListaLijekText') as FormControl;
    }
    get dopunskaListaLijek(): FormGroup{
        return this.forma.get('dopunskaListaLijek') as FormGroup;
    }
    get dopunskaListaLijekDropdown(): FormControl{
        return this.forma.get('dopunskaListaLijek.dopunskaListaLijekDropdown') as FormControl;
    }
    get dopunskaListaLijekText(): FormControl{
        return this.forma.get('dopunskaListaLijek.dopunskaListaLijekText') as FormControl;
    }
    get osnovnaListaMagPripravak(): FormGroup{
        return this.forma.get('osnovnaListaMagPripravak') as FormGroup;
    }
    get osnovnaListaMagPripravakDropdown(): FormControl{
        return this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown') as FormControl;
    }
    get osnovnaListaMagPripravakText(): FormControl{
        return this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText') as FormControl;
    }
    get dopunskaListaMagPripravak(): FormGroup{
        return this.forma.get('dopunskaListaMagPripravak') as FormGroup;
    }
    get dopunskaListaMagPripravakDropdown(): FormControl{
        return this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown') as FormControl;
    }
    get dopunskaListaMagPripravakText(): FormControl{
      return this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText') as FormControl;
    }
    get cijenaDopunskaLista(): FormGroup{
        return this.forma.get('cijenaDopunskaLista') as FormGroup;
    }
    get cijenaUkupno(): FormControl{
        return this.forma.get('cijenaDopunskaLista.cijenaUkupno') as FormControl;
    }
    get cijenaZavod(): FormControl{
        return this.forma.get('cijenaDopunskaLista.cijenaZavod') as FormControl;
    }
    get cijenaOsiguranik(): FormControl{
        return this.forma.get('cijenaDopunskaLista.cijenaOsiguranik') as FormControl;
    }
    get kolicina(): FormGroup{
        return this.forma.get('kolicina') as FormGroup;
    }
    get kolicinaDropdown(): FormControl{
        return this.forma.get('kolicina.kolicinaDropdown') as FormControl;
    }
    get kolicinaRimski(): FormControl{
        return this.forma.get('kolicina.kolicinaRimski') as FormControl;
    }
    get kolicinaLatinski(): FormControl{
        return this.forma.get('kolicina.kolicinaLatinski') as FormControl;
    }
    get doziranje(): FormGroup{
        return this.forma.get('doziranje') as FormGroup;
    }
    get doziranjeFrekvencija(): FormControl{
        return this.forma.get('doziranje.doziranjeFrekvencija') as FormControl;
    }
    get doziranjePeriod(): FormControl{
      return this.forma.get('doziranje.doziranjePeriod') as FormControl;
    }
    get dostatnost(): FormControl{
        return this.forma.get('trajanje.dostatnost') as FormControl;
    }
    get vrijediDo(): FormControl{
        return this.forma.get('trajanje.vrijediDo') as FormControl;
    }
    get sifraSpecijalist(): FormControl{
        return this.forma.get('sifraSpecijalist') as FormControl;
    }
    get ostaliPodatci(): FormGroup{
        return this.forma.get('ostaliPodatci') as FormGroup;
    }
    get hitnost(): FormControl{
      return this.forma.get('ostaliPodatci.hitnost') as FormControl;
    }
    get ponovljivost(): FormControl{
      return this.forma.get('ostaliPodatci.ponovljivost') as FormControl;
    }
    get brojPonavljanja(): FormControl{
      return this.forma.get('ostaliPodatci.brojPonavljanja') as FormControl;
    }
    get rijecimaBrojPonavljanja(): FormControl{
      return this.forma.get('ostaliPodatci.rijecimaBrojPonavljanja') as FormControl;
    }
}
