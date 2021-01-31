import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin, merge, Observable, of, Subject } from 'rxjs';
import { concatMap, debounceTime, take, takeUntil, tap } from 'rxjs/operators';
import { ReceptPretragaService } from '../../recept-pretraga.service';
import * as Validacija from '../../recept-validations';
import { ReceptService } from '../../recept.service';
import * as Promjene from '../../recept-value-changes';

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
    //Kreiram EventEmitter da mogu obavjestiti roditeljsku komponentu da ugasi ovaj prozor
    @Output() close = new EventEmitter<any>();
    
    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis recepta
        private receptService: ReceptService,
        //Dohvaćam servis pretrage recepta
        private receptPretragaService: ReceptPretragaService
    ) {}

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Pretplaćujem se na podatke Resolvera
        this.route.data.pipe(
            takeUntil(this.pretplateSubject)
        ).subscribe(
            (podatci) => {
                //Spremam sve dijagnoze u svoje polje
                this.dijagnoze = podatci.importi.dijagnoze;

                //Prolazim kroz polje svih dijagnoza
                for(const dijagnoza of this.dijagnoze){
                    //U polje naziva dijagnoza dodavam svaki naziv dijagnoze iz importanog polja
                    this.naziviDijagnoze.push(dijagnoza.imeDijagnoza);
                    //U polje MKB šifra dijagnoza dodavam svaki MKB dijagnoze iz importanog polja
                    this.mkbSifre.push(dijagnoza.mkbSifra);
                }
                //Prolazim kroz polje svih lijekova sa osnovne liste
                for(const lijek of podatci.importi.lijekoviOsnovnaLista){
                    //U polje dodavam naziv - oblik, jačina i pakiranje lijeka
                    this.lijekoviOsnovnaListaOJP.push(lijek.zasticenoImeLijek + " " + lijek.oblikJacinaPakiranjeLijek);
                }
                //Prolazim kroz polje svih lijekova sa dopunske liste
                for(const lijek of podatci.importi.lijekoviDopunskaLista){
                    //U polje dodavam naziv - oblik, jačina i pakiranje lijeka
                    this.lijekoviDopunskaListaOJP.push(lijek.zasticenoImeLijek + " " + lijek.oblikJacinaPakiranjeLijek);
                }
                //Prolazim kroz polje svih magistralnih pripravaka sa osnovne liste
                for(const pripravak of podatci.importi.magistralniPripravciOsnovnaLista){
                    //U svoje polje spremam njihove nazive
                    this.magPripravciOsnovnaLista.push(pripravak.nazivMagPripravak);
                }
                //Prolazim kroz polje svih magistranih pripravaka sa dopunske liste
                for(const pripravak of podatci.importi.magistralniPripravciDopunskaLista){
                    //U svoje polje spremam njihove nazive
                    this.magPripravciDopunskaLista.push(pripravak.nazivMagPripravak);
                }
                //Kreiram formu unosa novog recepta
                this.forma = new FormGroup({
                    'primarnaDijagnoza': new FormControl(null,[Validators.required]),
                    'mkbPrimarnaDijagnoza': new FormControl(null,[Validators.required,Validacija.provjeriMKB(this.mkbSifre)]),
                    'sekundarnaDijagnoza': new FormArray([
                        new FormControl(null)
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
                        'kolicinaDropdown': new FormControl(null,[Validators.required]),
                        'kolicinaRimski': new FormControl(null),
                        'kolicinaLatinski': new FormControl()
                    }),
                    'doziranje': new FormGroup({
                        'doziranjeFrekvencija': new FormControl(null,[Validators.pattern("^[0-9]*$")]),
                        'doziranjePeriod': new FormControl("dnevno")
                    }),
                    'trajanje': new FormGroup({
                        'dostatnost': new FormControl(),
                        'vrijediDo': new FormControl(podatci.importi.datum)
                    }),
                    'sifraSpecijalist': new FormControl(),
                    'ostaliPodatci': new FormGroup({
                        'hitnost': new FormControl(),
                        'ponovljivost': new FormControl(),
                        'brojPonavljanja': new FormControl(),
                        'rijecimaBrojPonavljanja': new FormControl()
                    })
                });
                //Onemogućavam inicijalno unos sekundarne dijagnoze
                this.forma.get('sekundarnaDijagnoza').disable({onlySelf:true,emitEvent: false});
                //Inicijalno onemogućavam unos rimske oznake količine
                this.forma.get('kolicina.kolicinaRimski').disable({onlySelf:true,emitEvent: false});
                //Inicijalno onemogućavam unos ukupne cijene
                this.forma.get('cijenaDopunskaLista.cijenaUkupno').disable({onlySelf: true, emitEvent: false});
                //Inicijalno onemogućavam unos cijene koje plaća Zavod
                this.forma.get('cijenaDopunskaLista.cijenaZavod').disable({onlySelf: true, emitEvent: false});
                //Inicijalno onemogućavam unos cijene koje plaća osiguranik
                this.forma.get('cijenaDopunskaLista.cijenaOsiguranik').disable({onlySelf: true, emitEvent: false});
                //Inicijalno onemogućavam unos polja u kojemu se prikaziva datum isteka dostatnosti
                this.forma.get('trajanje.vrijediDo').disable({onlySelf: true, emitEvent: false});
                //Inicijalno onemogućavam unos perioda doziranja
                this.forma.get('doziranje.doziranjePeriod').disable({onlySelf: true, emitEvent: false});
                //Inicijalno onemogućavam unos broja pakiranja lijeka
                this.forma.get('kolicina.kolicinaDropdown').disable({onlySelf: true,emitEvent: false});
                //Inicijalno onemogućavam unos doziranja
                this.forma.get('doziranje.doziranjeFrekvencija').disable({onlySelf: true,emitEvent: false});
                //Inicijalno onemogućavam unos dostatnosti
                this.forma.get('trajanje.dostatnost').disable({onlySelf: true, emitEvent: false});
                //Inicijalno dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                        this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                                        this.isLijek,this.isMagPripravak),
                                        this.isValidDijagnoze.bind(this),
                                        Validacija.doziranjePrijeKolicina(),
                                        Validacija.kolicinaPrijeProizvod()]);
                //Ažuriram stanje validacije
                this.forma.updateValueAndValidity({emitEvent: false});
            }
        );
        //Importam slušanje promjena polja unosa "doziranjeFrekvencija"
        Promjene.promjenaFormeDoziranje(this.forma.get('doziranje'),this.pretplateSubject,this.forma,this.receptService);
        
        //Pretplaćujem se na promjene u pojedinim dijelovima forme
        const prviDio =
            merge(
            //Slušam promjene u polju unosa primarne dijagnoze
            this.forma.get('primarnaDijagnoza').valueChanges.pipe(
                takeUntil(this.pretplateSubject),
                tap(value => {
                    console.log("U promjenama primarne dijagnoze sam!");
                    //Ako se unesena vrijednost NALAZI u nazivima dijagnoza, onda znam da je liječnik unio vrijednost primarne dijagnoze
                    if(this.naziviDijagnoze.indexOf(value) !== -1){
                        //Ako je taj unos ispravan
                        if(this.forma.get('primarnaDijagnoza').valid){
                            //Pozivam metodu da popuni polje MKB šifre te dijagnoze
                            Validacija.nazivToMKB(value,this.dijagnoze,this.forma);
                            //Omogućavam unos sekundarnih dijagnoza
                            this.forma.get('sekundarnaDijagnoza').enable({onlySelf:true,emitEvent: false});
                        }
                    }
                    //Ako je polje naziva primarne dijagnoze prazno 
                    if(!this.forma.get('primarnaDijagnoza').value){
                        //Resetiraj polje MKB šifre primarne dijagnoze
                        this.forma.get('mkbPrimarnaDijagnoza').patchValue(null,{onlySelf:true,emitEvent: false});
                        //Dok ne ostane jedna sekundarna dijagnoza u arrayu
                        while(this.getControlsSekundarna().length !== 1){
                            //Briši mu prvi element 
                            (<FormArray>this.forma.get('sekundarnaDijagnoza')).removeAt(0);
                        }
                        //Kada je ostala jedna vrijednost sek. dijagnoze, resetiraj joj vrijednost i onemogući unos
                        this.forma.get('sekundarnaDijagnoza').reset();
                        this.forma.get('sekundarnaDijagnoza').disable({onlySelf:true,emitEvent: false});
                    }
                })
            ),
            //Slušam promjene u polju unosa MKB šifre primarne dijagnoze
            this.forma.get('mkbPrimarnaDijagnoza').valueChanges.pipe(
                takeUntil(this.pretplateSubject),
                tap(value => {
                    console.log("u promjenama mkb šifre dijagnoze sam!");
                    //Ako se unesena vrijednost NALAZI u MKB šiframa dijagnoza, onda znam da je liječnik unio vrijednost MKB šifre dijagnoze
                    if(this.mkbSifre.indexOf(value) !== -1){
                        //Ako je taj unos ispravan
                        if(this.forma.get('mkbPrimarnaDijagnoza').valid){
                            //Pozivam metodu da popuni polje naziva primarne dijagnoze
                            Validacija.MKBtoNaziv(value,this.dijagnoze,this.forma);
                            //Omogućavam unos sekundarne dijagnoze
                            this.forma.get('sekundarnaDijagnoza').enable({onlySelf:true,emitEvent: false});
                        }
                    }
                    //Ako se unesena vrijednost NE NALAZI u MKB šiframa
                    if(this.mkbSifre.indexOf(value) === -1){
                        //Te unos u polju MKB-a se NE NALAZI u MKB šiframa I unos se NE NALAZI u nazivima primarne dijagnoze
                        if(this.mkbSifre.indexOf(this.forma.get('mkbPrimarnaDijagnoza').value) === -1 && this.naziviDijagnoze.indexOf(value) === -1){
                            //Postavi naziv primarne dijagnoze na null
                            this.forma.get('primarnaDijagnoza').patchValue(null,{emitEvent: false});
                            //Dok ne ostane jedna sekundarna dijagnoza u arrayu
                            while(this.getControlsSekundarna().length !== 1){
                                //Briši mu prvi element 
                                (<FormArray>this.forma.get('sekundarnaDijagnoza')).removeAt(0);
                            }
                            //Kada je ostala jedna vrijednost sek. dijagnoze, resetiraj joj vrijednost i onemogući unos
                            this.forma.get('sekundarnaDijagnoza').reset();
                            this.forma.get('sekundarnaDijagnoza').disable({onlySelf:true,emitEvent: false});
                        }
                    }
                })
            ),
            //Slušam promjene u polju unosa lijeka sa osnovne liste pomoću dropdowna
            this.forma.get('osnovnaListaLijek.osnovnaListaLijekDropdown').valueChanges.pipe(
                takeUntil(this.pretplateSubject),
                tap(value => {
                    console.log("u dropdownu OSNOVNE LISTE LIJEKOVA sam!");
                    //Ako se unesena vrijednost NALAZI u polju OSNOVNE LISTE LIJEKOVA
                    if(this.lijekoviOsnovnaListaOJP.indexOf(value) !== -1){
                        //Te ako su popunjeni ILI dropdown ILI text polje osnovne liste lijekova
                        if(this.lijekoviOsnovnaListaOJP.indexOf(this.forma.get('osnovnaListaLijek.osnovnaListaLijekDropdown').value) !== -1 
                            || this.lijekoviOsnovnaListaOJP.indexOf(this.forma.get('osnovnaListaLijek.osnovnaListaLijekText').value) !== -1){
                            //Resetiram poruku da nema rezultata
                            this.porukaNemaRezultata = null;
                            //Sakrij cijene
                            this.isCijene = false;
                            //Ako količina nije unesena
                            if(!this.isKolicina){
                                //Pozivam metodu koja omogućuje unose količine i doziranja
                                this.omoguciKolicinaDoziranje();
                            }
                            //Resetiraj polja dopunske liste lijekova te tekstualno polje osnovne liste lijekova
                            this.forma.get('dopunskaListaLijek.dopunskaListaLijekDropdown').patchValue(null,{onlySelf: true,emitEvent: false});   
                            this.forma.get('dopunskaListaLijek.dopunskaListaLijekText').patchValue("",{onlySelf: true,emitEvent: false});
                            this.forma.get('osnovnaListaLijek.osnovnaListaLijekText').patchValue("",{onlySelf:true,emitEvent:false});
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
                        Promjene.promjenaDostatnostiLijek(this.forma,this.receptService,this.pretplateSubject),
                        this.receptService.getOznakaLijek(value)
                    ]).pipe(
                        takeUntil(this.pretplateSubject),
                        //Ulazim u još jedan concatMap da predam dostatnost u danima metodi koja vraća DATUM vrijediDo
                        concatMap(value => {
                            console.log(value);
                            //Ako server nije vratio null za dostatnost
                            if(value[0] !== null){
                                //Postavi dostatnost u polje unosa dostatnosti
                                this.forma.get('trajanje.dostatnost').patchValue(value[0],{onlySelf: true, emitEvent: false});
                                return this.receptService.getDatumDostatnost(value[0].toString()).pipe(
                                    takeUntil(this.pretplateSubject),
                                    //Dohvati datum do kada vrijedi terapija i postavi ga u polje datuma
                                    tap(value => {
                                        this.forma.get('trajanje.vrijediDo').patchValue(value,{onlySelf: true, emitEvent: false});
                                    })
                                );
                            }
                            //Ako je server vratio da ima oznake "RS" na izabranom lijeku
                            if(value[1]["success"] === "true"){
                                //Označavam da treba prikazati polje unosa šifre specijalista
                                this.isSpecijalist = true;
                                return of(null);
                            }
                            //Ako je server vratio da NEMA oznake "RS" na izabranom lijeku
                            else if(value[1]["success"] === "false"){
                                //Označavam da treba sakriti polje unosa šifre specijalista
                                this.isSpecijalist = false;
                                return of(null);
                            }
                        })
                    )
                })
            ),
            //Slušam promjene u polju unosa lijeka sa dopunske liste pomoću dropdowna
            this.forma.get('dopunskaListaLijek.dopunskaListaLijekDropdown').valueChanges.pipe(
                takeUntil(this.pretplateSubject),
                tap(value => {
                    console.log("u dropdownu DOPUNSKE LISTE LIJEKOVA sam!");
                    //Ako se unesena vrijednost NALAZI u polju DOPUNSKE LISTE LIJEKOVA
                    if(this.lijekoviDopunskaListaOJP.indexOf(value) !== -1){
                        //Te su popunjeni ILI dropdown ili text polje dopunske liste lijekova
                        if(this.lijekoviDopunskaListaOJP.indexOf(this.forma.get('dopunskaListaLijek.dopunskaListaLijekDropdown').value) !== -1 
                            || this.lijekoviDopunskaListaOJP.indexOf(this.forma.get('dopunskaListaLijek.dopunskaListaLijekText').value) !== -1){
                            //Resetiram poruku da nema rezultata
                            this.porukaNemaRezultata = null;
                            //Označavam da se pojave cijene u formi
                            this.isCijene = true;
                            //Ako količina nije unesena
                            if(!this.isKolicina){
                                //Omogući unos količine i doziranja
                                this.omoguciKolicinaDoziranje();
                            }
                            //Resetiraj polja osnovne liste lijekova te tekstualno polje dopunske liste lijekova
                            this.forma.get('osnovnaListaLijek.osnovnaListaLijekDropdown').patchValue(null,{onlySelf: true,emitEvent: false});  
                            this.forma.get('osnovnaListaLijek.osnovnaListaLijekText').patchValue("",{onlySelf: true,emitEvent: false});
                            this.forma.get('dopunskaListaLijek.dopunskaListaLijekText').patchValue("",{onlySelf: true, emitEvent: false});
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
                        Promjene.promjenaDostatnostiLijek(this.forma,this.receptService,this.pretplateSubject)
                    ]).pipe(
                        takeUntil(this.pretplateSubject),
                        tap(value => {
                            console.log(value);
                            //Postavljam vrijednosti cijena u formu
                            this.forma.get('cijenaDopunskaLista.cijenaUkupno').patchValue(`${value[0][0].cijenaLijek} kn`,{onlySelf: true, emitEvent: false});
                            this.forma.get('cijenaDopunskaLista.cijenaZavod').patchValue(`${value[0][0].cijenaZavod} kn`,{onlySelf: true, emitEvent: false});
                            this.forma.get('cijenaDopunskaLista.cijenaOsiguranik').patchValue(`${value[0][0].doplataLijek} kn`,{onlySelf: true, emitEvent: false}); 
                        }),
                        concatMap(value => {
                            console.log(value);
                            //Ako server nije vratio null za dostatnost
                            if(value[2] !== null){
                                //Postavi dostatnost u polje unosa dostatnosti
                                this.forma.get('trajanje.dostatnost').patchValue(value[2],{onlySelf: true, emitEvent: false});
                                return this.receptService.getDatumDostatnost(value[2].toString()).pipe(
                                    takeUntil(this.pretplateSubject),
                                    //Dohvati datum do kada vrijedi terapija i postavi ga u polje datuma
                                    tap(value => {
                                        this.forma.get('trajanje.vrijediDo').patchValue(value,{onlySelf: true, emitEvent: false});
                                    })
                                );
                            }
                            //Ako je server vratio da ovaj lijek IMA oznaku "RS":
                            if(value[1].success === "true"){
                                //Označavam da treba prikazati polje unosa šifre specijalista
                                this.isSpecijalist = true;
                                return of(null);
                            }
                            //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                            else{
                                this.isSpecijalist = false;
                                return of(null);
                            }
                        })
                    )
                })
            ),
            //Slušam promjene u polju unosa mag. pripravka sa osnovne liste pomoću dropdowna
            this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown').valueChanges.pipe(
                takeUntil(this.pretplateSubject),
                tap(value => {
                    console.log("u dropdownu OSNOVNE LISTE MAG. PRIPRAVAKA SAM!");
                    //Ako se unesena vrijednost NALAZI u polju MAGISTRALNIH PRIPRAVAKA OSNOVNE LISTE
                    if(this.magPripravciOsnovnaLista.indexOf(value) !== -1){
                        //Ako se unesena vrijednost BAŠ ODNOSI na dropdown ILI text polje magistralnih pripravaka osnovne liste
                        if(this.magPripravciOsnovnaLista.indexOf(this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown').value) !== -1 
                            || this.magPripravciOsnovnaLista.indexOf(this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').value) !== -1){
                                //Resetiram poruku da nema rezultata
                                this.porukaNemaRezultata = null;
                                //Sakrij cijene
                                this.isCijene = false;
                                //Ako količina nije unesena
                                if(!this.isKolicina){
                                    //Omogući unos količine i doziranja
                                    this.omoguciKolicinaDoziranje();
                                }
                                //Resetiraj polja dopunske liste magistralnih pripravaka te tekstualno polje osnovne liste mag. pripravaka
                                this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown').patchValue(null,{onlySelf: true,emitEvent: false});
                                this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').patchValue("",{onlySelf: true,emitEvent: false});
                                this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').patchValue("",{onlySelf: true, emitEvent: false});
                                //Ako su liste pretrage ostale otvorene, zatvori ih
                                if(this.isPretragaMagPripravakOsnovnaLista){
                                    this.isPretragaMagPripravakOsnovnaLista = false;
                                }
                                if(this.isPretragaMagPripravakDopunskaLista){
                                    this.isPretragaMagPripravakDopunskaLista = false;
                                }
                        }
                    }
                }),
                concatMap(value => {
                    return this.receptService.getOznakaMagistralniPripravak(value).pipe(
                        takeUntil(this.pretplateSubject),
                        tap(value => {
                            console.log(value);
                            //Ako je server vratio da ima oznake "RS" na izabranom magistralnom pripravku
                            if(value["success"] === "true"){
                                //Označavam da treba prikazati polje unosa šifre specijalista
                                this.isSpecijalist = true;
                            }
                            //Ako je server vratio da NEMA oznake "RS" na izabranom lijeku
                            else{
                                //Označavam da treba sakriti polje unosa šifre specijalista
                                this.isSpecijalist = false;
                            }
                        })
                    );
                })
            ),
            //Slušam promjene u polju unosa mag. pripravka sa dopunske liste pomoću dropdowna
            this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown').valueChanges.pipe(
                takeUntil(this.pretplateSubject),
                tap(value => {
                    console.log("u dropdownu DOPUNSKE LISTE MAG. PRIPRAVAKA SAM!");
                    //Ako se unesena vrijednost NALAZI u polju MAGISTRALNIH PRIPRAVAKA DOPUNSKE LISTE
                    if(this.magPripravciDopunskaLista.indexOf(value) !== -1){
                        //Ako se unesena vrijednost BAŠ ODNOSI na dropdown ILI text polje magistralnih pripravaka dopunske liste
                        if(this.magPripravciDopunskaLista.indexOf(this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown').value) !== -1 
                            || this.magPripravciDopunskaLista.indexOf(this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').value) !== -1){
                                //Resetiram poruku da nema rezultata
                                this.porukaNemaRezultata = null;
                                //Označavam da se pojave cijene u formi
                                this.isCijene = true;
                                //Ako količina nije unesena
                                if(!this.isKolicina){
                                    this.omoguciKolicinaDoziranje();
                                }
                                //Resetiraj polja osnovne liste magistralnih pripravaka te tekstualno polje dopunske liste mag. pripravaka
                                this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown').patchValue(null,{onlySelf: true,emitEvent: false});
                                this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').patchValue("",{onlySelf: true,emitEvent: false});
                                this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').patchValue("",{onlySelf: true, emitEvent: false});
                                //Ako su liste pretrage ostale otvorene, zatvori ih
                                if(this.isPretragaMagPripravakOsnovnaLista){
                                    this.isPretragaMagPripravakOsnovnaLista = false;
                                }
                                if(this.isPretragaMagPripravakDopunskaLista){
                                    this.isPretragaMagPripravakDopunskaLista = false;
                                }
                        }
                    }
                }),
                concatMap(value => {
                    return forkJoin([
                        this.receptService.getCijenaMagPripravakDL(value),
                        this.receptService.getOznakaMagistralniPripravak(value)
                    ]).pipe(
                        takeUntil(this.pretplateSubject),
                        tap(value => {
                            console.log(value);
                            //Postavljam cijene magistralnih pripravaka u formu
                            this.forma.get('cijenaDopunskaLista.cijenaUkupno').patchValue(`${value[0][0].cijenaMagPripravak} kn`,{onlySelf: true, emitEvent: false});
                            this.forma.get('cijenaDopunskaLista.cijenaZavod').patchValue(`${value[0][0].cijenaZavod} kn`,{onlySelf: true, emitEvent: false});
                            this.forma.get('cijenaDopunskaLista.cijenaOsiguranik').patchValue(`${value[0][0].doplataMagPripravak} kn`,{onlySelf: true, emitEvent: false});
                            //Ako je server vratio da ima oznake "RS" na izabranom magistralnom pripravku
                            if(value[1]["success"] === "true"){
                                //Označavam da treba prikazati polje unosa šifre specijalista
                                this.isSpecijalist = true;
                            }
                            //Ako je server vratio da NEMA oznake "RS" na izabranom lijeku
                            else{
                                //Označavam da treba sakriti polje unosa šifre specijalista
                                this.isSpecijalist = false;
                            }
                        })
                    )
                })
            )
        ).subscribe();
        //Pretplaćujem se na promjene u tekstualnim poljima lijekova i mag.pripravaka
        const drugiDio = merge(
            //Slušam promjene u polju unosa lijeka sa osnovne liste pomoću pretrage
            this.forma.get('osnovnaListaLijek.osnovnaListaLijekText').valueChanges.pipe(
                takeUntil(this.pretplateSubject),
                debounceTime(100),
                tap(value => {
                    console.log("U osnovnoj listi lijekova texta sam!");
                    //Označavam da je liječnik počeo pretraživati LIJEKOVE OSNOVNE liste
                    this.isPretragaLijekOsnovnaLista = true;
                    //Označavam da je liječnik prestao pretraživati ostale proizvode
                    this.isPretragaLijekDopunskaLista = false;
                    this.isPretragaMagPripravakOsnovnaLista = false;
                    this.isPretragaMagPripravakDopunskaLista = false;
                }),
                concatMap(value => {
                    return this.receptPretragaService.getLijekOsnovnaListaPretraga(value).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                })
            ),
            //Slušam promjene u polju unosa lijeka sa dopunske liste pomoću pretrage
            this.forma.get('dopunskaListaLijek.dopunskaListaLijekText').valueChanges.pipe(
                takeUntil(this.pretplateSubject),
                debounceTime(100),
                tap(value => {
                    console.log("U dopunskoj listi lijekova texta sam!");
                    //Označavam da je liječnik počeo pretraživati LIJEKOVE DOPUNSKE liste
                    this.isPretragaLijekDopunskaLista = true;
                    //Označavam da je liječnik prestao pretraživati ostale proizvode
                    this.isPretragaLijekOsnovnaLista = false;
                    this.isPretragaMagPripravakOsnovnaLista = false;
                    this.isPretragaMagPripravakDopunskaLista = false;
                }),
                concatMap(value => {
                    return this.receptPretragaService.getLijekDopunskaListaPretraga(value).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                })
            ),
            //Slušam promjene u polju unosa mag. pripravka sa osnovne liste pomoću pretrage
            this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').valueChanges.pipe(
                takeUntil(this.pretplateSubject),
                debounceTime(100),
                tap(value => {
                    console.log("U osnovnoj listi mag. pripravaka sam!");
                    //Označavam da je liječnik počeo pretraživati MAGISTRALNE PRIPRAVKE sa OSNOVNE LISTE
                    this.isPretragaMagPripravakOsnovnaLista = true;
                    //Označavam da je liječnik prestao pretraživati ostale proizvode
                    this.isPretragaMagPripravakDopunskaLista = false;
                    this.isPretragaLijekOsnovnaLista = false;
                    this.isPretragaLijekDopunskaLista = false;
                }),
                concatMap(value => {
                    return this.receptPretragaService.getMagPripravciOsnovnaListaPretraga(value).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                })
            ),
            //Slušam promjene u polju unosa mag. pripravka sa dopunske liste pomoću pretrage
            this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').valueChanges.pipe(
                takeUntil(this.pretplateSubject),
                debounceTime(100),
                tap(value => {
                    console.log("U dopunskoj listi mag. pripravaka sam!");
                    //Označavam da je liječnik počeo pretraživati MAGISTRALNE PRIPRAVKE sa DOPUNSKE LISTE
                    this.isPretragaMagPripravakDopunskaLista = true;
                    //Označavam da je liječnik prestao pretraživati ostale proizvode
                    this.isPretragaMagPripravakOsnovnaLista = false;
                    this.isPretragaLijekOsnovnaLista = false;
                    this.isPretragaLijekDopunskaLista = false;
                }),
                concatMap(value => {
                    return this.receptPretragaService.getMagPripravciDopunskaListaPretraga(value).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                })
            )
        ).subscribe(
            (odgovor) => {
                //Ako liječnik pretražuje LIJEKOVE sa OSNOVNE LISTE
                if(this.isPretragaLijekOsnovnaLista){
                    //Ako je polje unosa prazno
                    if(this.osnovnaListaLijekText.value.length === 0){
                        //Digni ul tag
                        this.isPretragaLijekOsnovnaLista = false;
                        //Onemogući unos količine i doziranja
                        this.onemoguciKolicinaDoziranje();
                    }
                    //Ako je server vratio uspješnu poruku
                    if(odgovor["success"] !== "false"){
                        //Prolazim kroz LIJEKOVE OSNOVNE LISTE
                        for(const lijek of this.lijekoviOsnovnaListaOJP){
                            //Ako je neki lijek (malim slovima) jednak lijeku (malim slovima) koji je liječnik upisao u pretragu
                            if(lijek.toLowerCase() === this.osnovnaListaLijekText.value.toLowerCase()){
                                //Postavljam lijek iz polja u polje pretrage automatski
                                this.osnovnaListaLijekText.patchValue(lijek,{onlySelf: true, emitEvent: false});
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
                        //Ako NEMA vrijednosti u dropdownu dopunske liste lijekova ili u tekstualnom polju
                        if(!this.dopunskaListaLijekDropdown.value && !this.dopunskaListaLijekText.value){
                            //Digni cijene
                            this.isCijene = false;
                        }
                        //Onemogući unos količine i doziranja
                        this.onemoguciKolicinaDoziranje();
                        //Spremam odgovor servera da nema rezultata
                        this.porukaNemaRezultata = odgovor["message"];
                    } 
                }
                //Ako liječnik pretražuje LIJEKOVE sa DOPUNSKE LISTE
                else if(this.isPretragaLijekDopunskaLista){
                    //Ako je polje unosa prazno
                    if(this.dopunskaListaLijekText.value.length === 0){
                        //Digni ul tag
                        this.isPretragaLijekDopunskaLista = false;
                        //Onemogući unos količine i doziranja
                        this.onemoguciKolicinaDoziranje();
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
                                this.dopunskaListaLijekText.patchValue(lijek,{onlySelf: true, emitEvent: false});
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
                        //Ako dropdown dopunske liste lijekova nije prazan
                        if(!this.dopunskaListaLijekDropdown.value){
                            //Digni cijene
                            this.isCijene = false;
                        } 
                        //Onemogući unos količine i doziranja
                        this.onemoguciKolicinaDoziranje();
                        //Spremam odgovor servera da nema rezultata
                        this.porukaNemaRezultata = odgovor["message"];
                    }
                } 
                //Ako liječnik pretražuje MAGISTRALNE PRIPRAVKE sa OSNOVNE LISTE
                else if(this.isPretragaMagPripravakOsnovnaLista){
                    //Ako je polje unosa prazno
                    if(this.osnovnaListaMagPripravakText.value.length === 0){
                        //Digni ul tag
                        this.isPretragaMagPripravakOsnovnaLista = false;
                        //Onemogući unos količine i doziranja
                        this.onemoguciKolicinaDoziranje();
                    }
                    //Ako JE server vratio neke rezultate
                    if(odgovor["success"] !== "false"){
                        //Prolazim polje mag.pripravaka osnovne liste
                        for(const magPripravak of this.magPripravciOsnovnaLista){
                            //Ako je mag.pripravak iz polja (malim slovima) JEDNAK mag. pripravku iz polja pretrage (malim slovima)
                            if(magPripravak.toLowerCase() === this.osnovnaListaMagPripravakText.value.toLowerCase()){
                                //Postavljam mag. pripravak iz polja u polje pretrage
                                this.osnovnaListaMagPripravakText.patchValue(magPripravak,{onlySelf: true, emitEvent: false});
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
                        //Ako nema vrijednosti u dropdownu mag. pripravaka dopunske liste
                        if(!this.dopunskaListaMagPripravakDropdown.value && !this.dopunskaListaMagPripravakText.value){
                            //Digni cijene
                            this.isCijene = false;
                        }
                        //Onemogući unos količine i doziranja
                        this.onemoguciKolicinaDoziranje();
                        //Spremam odgovor servera da nema rezultata
                        this.porukaNemaRezultata = odgovor["message"];
                    }
                }
                //Ako liječnik pretražuje MAGISTRALNE PRIPRAVKE sa DOPUNSKE LISTE
                else if(this.isPretragaMagPripravakDopunskaLista){
                    //Ako je polje unosa prazno
                    if(this.dopunskaListaMagPripravakText.value.length === 0){
                        //Onemogući unos količine i doziranja
                        this.onemoguciKolicinaDoziranje();
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
                                this.dopunskaListaMagPripravakText.patchValue(magPripravak,{onlySelf: true, emitEvent: false});
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
                        //Ako dropdown dopunske liste magistralnih pripravaka nije prazan
                        if(!this.dopunskaListaMagPripravakDropdown.value){
                            //Digni cijene
                            this.isCijene = false;
                        }
                        //Onemogući unos količine i doziranja
                        this.onemoguciKolicinaDoziranje();
                        //Spremam odgovor servera da nema rezultata
                        this.porukaNemaRezultata = odgovor["message"];
                    }
                }
            }
        );
    }

    //Metoda koja se pokreće kada korisnik unese pravu vrijednost u polje pretrage OSNOVNE LISTE LIJEKOVA
    ispravanUnosLijekOL(lijek: string){
        //Skrivam ul tag
        this.isPretragaLijekOsnovnaLista = false;
        //Sakrij cijene
        this.isCijene = false;
        //Ako količina nije unesena
        if(!this.isKolicina){
            //Omogući unos količine i doziranja
            this.omoguciKolicinaDoziranje();
        }
        //Resetiraj dropdown i tekstualno polje dopunske liste lijekova te dropdown osnovne liste lijekova
        this.dopunskaListaLijekDropdown.patchValue(null,{onlySelf:true,emitEvent: false});
        this.dopunskaListaLijekText.patchValue("",{onlySelf:true,emitEvent: false});
        this.osnovnaListaLijekDropdown.patchValue(null,{onlySelf: true, emitEvent: false});
        //Pretplaćujem se na informaciju ima li izabrani lijek oznaku "RS"
        this.receptService.getOznakaLijek(lijek).pipe(
            takeUntil(this.pretplateSubject)
        ).subscribe(
            //Dohvaćam odgovor
            (odgovor) => {
                //Ako je server vratio da ovaj lijek IMA oznaku "RS":
                if(odgovor.success === "true"){
                    //Označavam da treba prikazati polje unosa šifre specijalista
                    this.isSpecijalist = true;
                }
                //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                else{
                    this.isSpecijalist = false;
                }
            }
        );
    }
    //Metoda koja se poziva kada liječnik unese pravu vrijednost lijeka sa DOPUNSKE LISTE LIJEKOVA
    ispravanUnosLijekDL(lijek: string){
        //Skrivam ul tag
        this.isPretragaLijekDopunskaLista = false;
        //Prikaži cijene
        this.isCijene = true;
        //Ako količina nije unesena
        if(!this.isKolicina){
            //Omogući unos količine i doziranja
            this.omoguciKolicinaDoziranje();
        }
        //Resetiraj dropdown i tekstualno polje osnovne liste lijekova te dropdown dopunske liste lijekova
        this.osnovnaListaLijekDropdown.patchValue(null,{onlySelf:true,emitEvent: false});
        this.osnovnaListaLijekText.patchValue("",{onlySelf:true,emitEvent: false});
        this.dopunskaListaLijekDropdown.patchValue(null,{onlySelf: true,emitEvent: false});
        //Pretplaćujem se na Observable u kojemu se nalaze cijene i informacija je li lijek ima oznaku "RS"
        const combined = forkJoin([
            this.receptService.getCijenaLijekDL(lijek),
            this.receptService.getOznakaLijek(lijek)
        ]).pipe(
            takeUntil(this.pretplateSubject),
            tap(odgovor => {
                //Postavljam dohvaćene cijene u formu
                this.forma.get('cijenaDopunskaLista.cijenaUkupno').patchValue(`${odgovor[0][0].cijenaLijek} kn`,{onlySelf: true,emitEvent: false});
                this.forma.get('cijenaDopunskaLista.cijenaZavod').patchValue(`${odgovor[0][0].cijenaZavod} kn`,{onlySelf: true,emitEvent: false});
                this.forma.get('cijenaDopunskaLista.cijenaOsiguranik').patchValue(`${odgovor[0][0].doplataLijek} kn`,{onlySelf: true, emitEvent: false});
                //Ako je server vratio da ovaj lijek IMA oznaku "RS":
                if(odgovor[1].success === "true"){
                    //Označavam da treba prikazati polje unosa šifre specijalista
                    this.isSpecijalist = true;
                }
                //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                else{
                    this.isSpecijalist = false;
                }
            })
        ).subscribe();
    }
    //Metoda koja se poziva kada liječnik unese ispravan unos MAG.PRIPRAVKA iz OSNOVNE LISTE
    ispravanUnosMagPripravakOL(magPripravak: string){
        //Skrivam ul tag
        this.isPretragaMagPripravakOsnovnaLista = false;
        //Sakrij cijene
        this.isCijene = false;
        //Ako količina nije unesena
        if(!this.isKolicina){
            //Omogući unos količine i doziranja
            this.omoguciKolicinaDoziranje();
        }
        //Resetiraj dropdown i tekstualno polje dopunske liste magistralnih pripravaka te dropdown osnovne liste mag. pripravaka
        this.dopunskaListaMagPripravakDropdown.patchValue(null,{onlySelf: true,emitEvent: false});
        this.dopunskaListaMagPripravakText.patchValue("",{onlySelf: true,emitEvent: false});
        this.osnovnaListaMagPripravakDropdown.patchValue(null,{onlySelf: true,emitEvent: false});
        //Pretplaćujem se na Observable koji sadrži informaciju je li MAGISTRALNI PRIPRAVAK ima oznaku "RS"
        this.receptService.getOznakaMagistralniPripravak(magPripravak).pipe(
            takeUntil(this.pretplateSubject)
        ).subscribe(
            //Dohvaćam odgovor
            (odgovor) => {
                //Ako je server vratio da ovaj lijek IMA oznaku "RS":
                if(odgovor.success === "true"){
                    //Označavam da treba prikazati polje unosa šifre specijalista
                    this.isSpecijalist = true;
                }
                //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                else{
                    this.isSpecijalist = false;
                }
            }
        );
    }
    //Metoda koja se poziva kada liječnik unese ispravan unos MAG. PRIPRAVKA sa DOPUNSKE LISTE
    ispravanUnosMagPripravakDL(magPripravak: string){
        //Skrivam ul tag
        this.isPretragaMagPripravakDopunskaLista = false;
        //Prikaži cijene
        this.isCijene = true;
        //Ako količina nije unesena
        if(!this.isKolicina){
            //Omogući unos količine i doziranja
            this.omoguciKolicinaDoziranje();
        }
        //Resetiraj dropdown i tekstualno polje osnovne liste magistralnih pripravaka te dropdown dopunske liste mag. pripravaka
        this.osnovnaListaMagPripravakDropdown.patchValue(null,{onlySelf: true,emitEvent: false});
        this.osnovnaListaMagPripravakText.patchValue("",{onlySelf: true,emitEvent: false});
        this.dopunskaListaMagPripravakDropdown.patchValue(null,{onlySelf: true, emitEvent: false});
        //Pretplaćujem se na cijene izabranog magistralnog pripravka sa dopunske liste te njegovu oznaku
        const combined = forkJoin([
            this.receptService.getCijenaMagPripravakDL(magPripravak),
            this.receptService.getOznakaMagistralniPripravak(magPripravak)
        ]).pipe(
            takeUntil(this.pretplateSubject),
            tap(value => {
                console.log(value);
                //Postavljam cijene magistralnog pripravka u formu
                this.forma.get('cijenaDopunskaLista.cijenaUkupno').patchValue(`${value[0][0].cijenaMagPripravak} kn`,{onlySelf: true,emitEvent: false});
                this.forma.get('cijenaDopunskaLista.cijenaZavod').patchValue(`${value[0][0].cijenaZavod} kn`,{onlySelf: true,emitEvent: false});
                this.forma.get('cijenaDopunskaLista.cijenaOsiguranik').patchValue(`${value[0][0].doplataMagPripravak} kn`,{onlySelf: true, emitEvent: false});
                //Ako je server vratio da ovaj lijek IMA oznaku "RS":
                if(value[1].success === "true"){
                    //Označavam da treba prikazati polje unosa šifre specijalista
                    this.isSpecijalist = true;
                }
                //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                else{
                    this.isSpecijalist = false;
                }
            })
        ).subscribe();
    }
    //Metoda koja se pokreće kada liječnik izabere neki proizvod iz liste pretrage
    onClickLi(proizvod: string){
        //Ako se naziv proizvoda NALAZI u listi lijekova OSNOVNE LISTE
        if(this.lijekoviOsnovnaListaOJP.indexOf(proizvod) !== -1){
            //U polje unosa pretrage osnovne liste lijekova, stavljam tu vrijednost
            this.osnovnaListaLijekText.patchValue(proizvod,{onlySelf: true,emitEvent: false});
            //Pozivam metodu koja se pokreće kada liječnik ispravno unese lijek sa OSNOVNE LISTE
            this.ispravanUnosLijekOL(proizvod);
            //Okini sve validatore ponovno
            this.forma.updateValueAndValidity();
        }
        //Ako se naziv proizvoda NALAZI u listi lijekova DOPUNSKE LISTE
        else if(this.lijekoviDopunskaListaOJP.indexOf(proizvod) !== -1){
            //U polje unosa pretrage dopunske liste lijekova, stavljam tu vrijednost
            this.dopunskaListaLijekText.patchValue(proizvod,{onlySelf: true, emitEvent: false});
            //Pozivam metodu koja se pokreće kada liječnik ispravno unese lijek sa DOPUNSKE LISTE
            this.ispravanUnosLijekDL(proizvod);
            //Okini sve validatore ponovno
            this.forma.updateValueAndValidity();
        }
        //Ako se naziv proizvoda NALAZI u listi MAGISTRALNIH PRIPRAVAKA OSNOVNE LISTE
        else if(this.magPripravciOsnovnaLista.indexOf(proizvod) !== -1){
            //U polje unosa pretrage osnovne liste magistralnih pripravaka, stavljam tu vrijednost
            this.osnovnaListaMagPripravakText.patchValue(proizvod,{onlySelf: true, emitEvent: false});
            //Pozivam metodu koja se pokreće kada liječnik ispravno unese mag. pripravak sa OSNOVNE LISTE
            this.ispravanUnosMagPripravakOL(proizvod);
            //Okini sve validatore ponovno
            this.forma.updateValueAndValidity();
        }
        //Ako se naziv proizvoda NALAZI u listi MAGISTRALNIH PRIPRAVAKA DOPUNSKE LISTE
        else if(this.magPripravciDopunskaLista.indexOf(proizvod) !== -1){
            //U polje unosa pretrage dopunske liste magistralnih pripravaka, stavljam tu vrijednost
            this.dopunskaListaMagPripravakText.patchValue(proizvod,{onlySelf: true, emitEvent: false});
            //Pozivam metodu koja se pokreće kada liječnik ispravno unese mag. pripravak sa DOPUNSKE LISTE
            this.ispravanUnosMagPripravakDL(proizvod);
            //Okini sve validatore ponovno
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
            //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
            this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                                    this.isLijek,this.isMagPripravak),
                                    this.isValidDijagnoze.bind(this),
                                    Validacija.doziranjePrijeKolicina(),
                                    Validacija.kolicinaPrijeProizvod()]);
            //Ažuriram stanje validacije
            this.forma.updateValueAndValidity({emitEvent: false});
            //Sakrij cijene
            this.isCijene = false;
            //Resetiram sva polja vezana za magistralne pripravke
            this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown').patchValue(null,{onlySelf:true,emitEvent: false});
            this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').patchValue("",{onlySelf:true,emitEvent: false});
            this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown').patchValue(null,{onlySelf:true,emitEvent: false});
            this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').patchValue("",{onlySelf:true,emitEvent: false});  
            //Dižem polje unosa šifre specijalista
            this.isSpecijalist = false;
            //Onemogući unos količine i doziranja
            this.onemoguciKolicinaDoziranje();
        }
        else if($event.target.value === "magPripravak"){
            //Resetiram poruku koja objavljuje da nema rezultata
            this.porukaNemaRezultata = null;
            //Označavam da liječnik želi unijeti mag.pripravak
            this.isMagPripravak = true;
            //Označavam da liječnik ne želi unijeti lijek
            this.isLijek = false;
            //Dinamački postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
            this.forma.setValidators([Validacija.isUnesenProizvod(this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista,this.magPripravciDopunskaLista,
                                    this.isLijek,this.isMagPripravak),
                                    this.isValidDijagnoze.bind(this),
                                    Validacija.doziranjePrijeKolicina(),
                                    Validacija.kolicinaPrijeProizvod()]);
            //Ažuriram stanje validacije
            this.forma.updateValueAndValidity({emitEvent: false});
            //Sakrij cijene
            this.isCijene = false;
            //Resetiram sva polja vezana uz lijekove
            this.forma.get('osnovnaListaLijek.osnovnaListaLijekDropdown').patchValue(null,{onlySelf:true,emitEvent: false});
            this.forma.get('osnovnaListaLijek.osnovnaListaLijekText').patchValue("",{onlySelf:true,emitEvent: false});
            this.forma.get('dopunskaListaLijek.dopunskaListaLijekDropdown').patchValue(null,{onlySelf:true,emitEvent: false});
            this.forma.get('dopunskaListaLijek.dopunskaListaLijekText').patchValue("",{onlySelf:true,emitEvent: false});
            //Dižem polje unosa šifre specijalista
            this.isSpecijalist = false;
            //Onemogući unos količine i doziranja
            this.onemoguciKolicinaDoziranje();
        }
    }

    //Metoda se poziva kada liječnik promijeni količinu (broj pakiranja proizvoda)
    promijeniKolicina(kolicina: string){
        if(kolicina === "1"){
            //Postavi polje rimske oznake:
            this.kolicinaRimski.patchValue("I unam",{onlySelf: true,emitEvent: false});
        }
        else if(kolicina === "2"){
            //Postavi polje rimske oznake:
            this.kolicinaRimski.patchValue("II duas",{onlySelf: true,emitEvent: false});
        }
    }

    //Ova metoda se izvršava kada liječnik klikne negdje izvan liste pretrage
    zatvoriListu(tip: string){
        //Ako je otvorena lista pretrage LIJEKOVA OSNOVNE LISTE
        if(tip === "lijekOL"){
            //Zatvori listu pretrage osnovne liste lijekova
            this.isPretragaLijekOsnovnaLista = false;
            //Isprazni polje unosa
            this.osnovnaListaLijekText.patchValue("",{onlySelf: true, emitEvent: false});
        }
        //Ako je otvorena lista pretrage LIJEKOVA DOPUNSKE LISTE
        else if(tip === "lijekDL"){
            //Zatvori listu pretrage dopunske liste lijekova
            this.isPretragaLijekDopunskaLista = false;
            //Isprazni polje unosa 
            this.dopunskaListaLijekText.patchValue("",{onlySelf: true, emitEvent: false});
        }
        //Ako je otvorena lista pretrage MAGISTRALNIH PRIPRAVAKA OSNOVNE LISTE
        else if(tip === "magPripravakOL"){
            //Zatvori listu pretrage magistralnih pripravaka osnovne liste
            this.isPretragaMagPripravakOsnovnaLista = false;
            //Isprazni polje unosa 
            this.osnovnaListaMagPripravakText.patchValue("",{onlySelf: true, emitEvent: false});
        }
        //Ako je otvorena lista pretrage MAGISTRALNIH PRIPRAVAKA DOPUNSKE LISTE
        else if(tip === "magPripravakDL"){
            //Zatvori listu pretrage magistralnih pripravaka dopunske liste
            this.isPretragaMagPripravakDopunskaLista = false;
            //Isprazni polje unosa 
            this.dopunskaListaMagPripravakText.patchValue("",{onlySelf: true, emitEvent: false});
        }
    }

    //Metoda koja omogućuje unose količine i doziranja
    omoguciKolicinaDoziranje(){
        //Omogući unos količine i doziranja
        this.kolicinaDropdown.enable({onlySelf: true, emitEvent: false});
        this.doziranjeFrekvencija.enable({onlySelf: true, emitEvent: false});
        //Postavi količinu na 1
        this.kolicinaDropdown.patchValue(1,{onlySelf: true, emitEvent: false});
        //Postavi rimsku oznaku
        this.kolicinaRimski.patchValue("I unam",{onlySelf: true, emitEvent: false});
        //Označavam da je količina aktivna
        this.isKolicina = true;
    }

    //Onemogući unos količine i doziranja
    onemoguciKolicinaDoziranje(){
        //Označavam da je količina null
        this.isKolicina = false;
        //Resetiraj te onemogući unos količine
        this.kolicinaDropdown.patchValue(null,{onlySelf: true, emitEvent: false});
        this.kolicinaDropdown.disable({onlySelf: true, emitEvent: false});
        this.kolicinaRimski.patchValue(null,{onlySelf: true, emitEvent: false});
        //Resetiraj te onemogući unos doziranja
        this.doziranjeFrekvencija.patchValue(null,{onlySelf: true, emitEvent: false});
        this.doziranjeFrekvencija.disable({onlySelf: true, emitEvent: false});
    }

    //Metoda koja provjerava je li uneseno više istih sekundarnih dijagnoza
    isValidSekundarnaDijagnoza(array: FormArray): {[key: string]: boolean}{
        //Kreiram pomoćno polje
        let pom = [];
        //Prolazim kroz array 
        for(let control of array.controls){
            //Ako se vrijednost sekundarne dijagnoze VEĆ NALAZI u pom polju, ali da nije "Odaberite sekundarnu dijagnozu"
            if(pom.indexOf(control.value) !== -1 && control.value !== null){
                //U svoju varijablu spremam sekundarnu dijagnozu koja je duplikat
                this.sekDijagnoza = control.value;
                return {'duplikat': true};
            }
            //Ako se vrijednost sekundarne dijagnoze NE NALAZI u pom polju
            else{
                //Dodaj ga u pom polje
                pom.push(control.value);
            }
        }
        return null;
    }  
    
    //Metoda koja provjerava je li primarna dijagnoza ista kao i neka od sekundarnih dijagnoza
    isValidDijagnoze(group: FormGroup): {[key: string]: boolean} {
      //Prolazim kroz polje sekundarnih dijagnoza
      for(let control of (group.get('sekundarnaDijagnoza') as FormArray).controls){
          //Ako je vrijednost primarne dijagnoze jednaka vrijednosti sekundarne dijagnoze, ali da oba dvije nisu null, jer bih bilo (Odaberite dijagnozu === Odaberite dijagnozu)
          if(group.get('primarnaDijagnoza').value === control.value && (group.get('primarnaDijagnoza') !== null && control.value !== null)){
              //Spremam vrijednost sekundarne dijagnoze koja je jednaka primarnoj dijagnozi
              this.dijagnoza = control.value;
              return {'primarnaJeIstaKaoSekundarna': true};
          }
      }
      return null;
    }

    //Ova metoda se poziva kada korisnik klikne "Izađi" ili negdje izvan prozora
    onClose(){
        //Izađi iz prozora 
        this.close.emit();
    }
    //Dohvaća pojedine form controlove unutar polja 
    getControlsSekundarna(){
      return (this.forma.get('sekundarnaDijagnoza') as FormArray).controls;
    }

    //Kada se klikne button "Dodaj dijagnozu"
    onAddDiagnosis(){
      (<FormArray>this.forma.get('sekundarnaDijagnoza')).push(
        new FormControl(null) 
      );
    }

    //Kada se klikne button "X"
    onDeleteDiagnosis(index: number){
      (<FormArray>this.forma.get('sekundarnaDijagnoza')).removeAt(index);
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
