import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { concatMap, debounceTime, distinctUntilChanged, map, mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReceptPretragaService } from '../../recept-pretraga.service';
import * as Validacija from '../../recept-validations';
import { ReceptService } from '../../recept.service';
import * as receptHandler from '../../recept-handler';
import {azurirajValidatore} from '../../azuriraj-validatore';
import { ZdravstveniRadnik } from 'src/app/shared/modeli/zdravstveniRadnik.model';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
import { Recept } from 'src/app/shared/modeli/recept.model';
import { PrikazReceptService } from '../../lista-recepti/prikaz-recept/prikaz-recept.service';
import { HeaderService } from 'src/app/shared/header/header.service';
import * as SharedHandler from '../../../../shared/shared-handler';
import * as SharedValidations from '../../../../shared/shared-validations';
import { SharedService } from 'src/app/shared/shared.service';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';

@Component({
  selector: 'app-izdaj-recept',
  templateUrl: './izdaj-recept.component.html',
  styleUrls: ['./izdaj-recept.component.css']
})
export class IzdajReceptComponent implements OnInit, OnDestroy{
    //Spremam ID pacijenta
    idPacijent: string;
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
    dijagnoza: string = null;
    //Spremam sve dijagnoze
    dijagnoze: Dijagnoza[] = [];
    //Dohvaćam sve zdravstvene radnike
    zdravstveniRadnici: ZdravstveniRadnik[] = [];
    //Spremam sve lijekove sa osnovne liste
    lijekoviOsnovnaLista: any;
    //Spremam sve lijekove sa dopunske liste
    lijekoviDopunskaLista: any;
    //Spremam sve magistralne pripravke sa osnovne liste
    magPripravciOsnovnaLista: string[] = [];
    //Spremam sve magistralne pripravke sa dopunske liste
    magPripravciDopunskaLista: string[] = [];
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
    //Oznaka je li se prikaziva redak sa svjesnim prekoračenjem
    isValidatorDDD: boolean = false;
    //Oznaka je li komponenta u modu ažuriranja
    editMode: boolean = false;
    //Spremam podatke recepta kojega ažuriram u svoj model
    recept: Recept;
    //Oznaka je li recept hitan ili nije
    isHitnost: boolean = false;
    //Spremam ID liječnika
    idLijecnik: number;
    //Spremam poslani ID obrade
    poslaniIDObrada: string = "";
    //Spremam tip slučaja povijesti bolesti kojemu nadodavam uneseni ID recepta
    poslaniTipSlucaj: string = "";
    //Spremam vrijeme povijesti bolesti kojemu nadodavam uneseni ID recepta
    poslanoVrijeme: string = "";
    //Spremam izabrani proizvod radi identificiranja odakle je (da vidim je li iz dopunske liste)
    izabraniProizvod: string;

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis recepta
        private receptService: ReceptService,
        //Dohvaćam servis pretrage recepta
        private receptPretragaService: ReceptPretragaService,
        //Dohvaćam router
        private router: Router,
        //Dohvaćam servis prikaza recepta
        private prikazService: PrikazReceptService,
        //Dohvaćam servis headera
        private headerService: HeaderService,
        //Dohvaćam shared servis
        private sharedService: SharedService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis dialoga
        private dialog: MatDialog
    ) {}

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {
        //Pretplaćivam se na podatke Resolvera
        this.route.data.pipe(
            map(podatci => podatci.importi),
            tap((podatci) => {
                //Ako se u Resolveru nalaze podatci dohvaćenog recepta, mode je AŽURIRANJE
                if(podatci.recept){
                    //Spremam podatke recepta iz Resolvera u svoj model
                    this.recept = new Recept(podatci.recept[0]);
                    console.log(this.recept);
                    //Ako je server vratio da je recept običan i da je broj ponavljanja null (tj. 0)
                    if(this.recept.ponovljivost === "obican" && !this.recept.brojPonavljanja){
                        //Označavam da je recept običan
                        this.isPonovljiv = false;
                    }
                    //Ako je server vratio da je recept ponovljiv i da je broj ponavljanja cijeli broj (1-5)
                    else if(this.recept.ponovljivost === "ponovljiv" && this.recept.brojPonavljanja){
                        //Označavam da je recept ponovljiv
                        this.isPonovljiv = true;
                    }
                    //Ako je server vratio da je recept hitan
                    if(this.recept.hitnost === 'hitno'){
                        //Označavam da je recept hitan
                        this.isHitnost = true;
                    }
                    //Ako je server vratio da recept NIJE HITAN
                    else{
                        //Označavam da recept nije hitan
                        this.isHitnost = false;
                    }
                    //Ako JE definirana šifra specijalista
                    if(this.recept.sifraSpecijalist){
                        //Označavam da recept ima šifru specijalista
                        this.isSpecijalist = true;
                    }
                    //Ako NIJE definirana šifra specijalista
                    else{
                        //Označavam da recept NEMA upisanu šifru specijalista
                        this.isSpecijalist = false;
                    }
                    //Označavam da ažuriram komponentu
                    this.editMode = true;
                }
                //Ako se u Resolveru NE NALAZE podatci recepta
                else{
                    //Označavam da dodavam novi recept
                    this.editMode = false;
                }
                //Spremam ID pacijenta
                this.idPacijent = this.route.snapshot.paramMap.get('id');
                //Inicijaliziram praznu varijablu u kojoj ću spremiti objekte tipa "Dijagnoza"
                let objektDijagnoza;
                for(const d of podatci.dijagnoze){
                    objektDijagnoza = new Dijagnoza(d);
                    this.dijagnoze.push(objektDijagnoza);
                }
                //Definiram objekt u kojega spremam sve zdravstvene radnike
                let objektZdrRadnik;
                for(const djel of podatci.zdravstveniRadnici){
                    objektZdrRadnik = new ZdravstveniRadnik(djel);
                    this.zdravstveniRadnici.push(objektZdrRadnik);
                }
                //Prolazim kroz polje svih dijagnoza
                for(const dijagnoza of this.dijagnoze){
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
                    'primarnaDijagnoza': new FormControl(
                        this.editMode ? this.recept.nazivPrimarna.trim()
                        : null,[Validators.required, SharedValidations.provjeriNazivDijagnoza(this.dijagnoze)]),
                    'mkbPrimarnaDijagnoza': new FormControl(this.editMode ? this.recept.mkbSifraPrimarna.trim() : null,[Validators.required,SharedValidations.provjeriMKB(this.mkbSifre)]),
                    'sekundarnaDijagnoza': new FormArray([
                        new FormGroup({
                            'nazivSekundarna': new FormControl(null),
                            'mkbSifraSekundarna': new FormControl(null)
                        },{validators: [SharedValidations.requiredMKBSifraSekundarna(),SharedValidations.provjeriMKBSifraSekundarna(this.mkbSifre)]})
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
                        'kolicinaDropdown': new FormControl(this.editMode ? this.recept.kolicina : "1",[Validators.required]),
                        'kolicinaRimski': new FormControl(null),
                        'kolicinaLatinski': new FormControl()
                    }),
                    'doziranje': new FormGroup({
                        'doziranjeFrekvencija': new FormControl(null,[Validators.pattern("^[0-9]*$"),Validators.required]),
                        'doziranjePeriod': new FormControl("dnevno"),
                        'dddLijek': new FormControl(null)
                    }),
                    'svjesnoPrekoracenje': new FormControl(null),
                    'trajanje': new FormGroup({
                        'dostatnost': new FormControl("30"),
                        'vrijediDo': new FormControl(podatci.datum)
                    }),
                    'specijalist': new FormGroup({
                        'sifraSpecijalist': new FormControl(this.editMode && this.recept.sifraSpecijalist ? this.recept.sifraSpecijalist.toString() : null),
                        'tipSpecijalist': new FormControl(null)
                    }),
                    'ostaliPodatci': new FormGroup({
                        'hitnost': new FormControl(this.editMode && this.isHitnost ? true : null),
                        'ponovljivost': new FormControl(this.editMode && this.isPonovljiv ? true : null),
                        'brojPonavljanja': new FormControl(this.editMode && this.isPonovljiv ? this.recept.brojPonavljanja : null),
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
                //Postavljam rimsku oznaku količine
                this.promijeniKolicina("1");
                //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                this.isMagPripravak, this.isValidDijagnoze.bind(this));
                //Postavljam validatore na polje dostatnosti
                this.dostatnost.setValidators([Validacija.provjeriDostatnost(this.isPonovljiv,this.brojPonavljanja.value),Validators.pattern("^[0-9]*$"),Validators.required]);
                //Ažuriram validaciju
                this.dostatnost.updateValueAndValidity({emitEvent: false});
                //Ako je komponenta u MODU AŽURIRANJA
                if(this.editMode){
                    //Ako je definiran broj ponavljanja recepta
                    if(this.recept.brojPonavljanja){
                        //Postavi vrijednost broja ponavljanja riječima
                        this.onChangeBrojPonavljanja(this.recept.brojPonavljanja.toString());
                    }
                    //Ako je inicijalno popunjena vrijednost naziva primarne dijagnoze
                    if(this.primarnaDijagnoza.value){
                        //Omogućavam unos sekundarnih dijagnoza
                        this.sekundarnaDijagnoza.enable({emitEvent: false});
                    }
                    //Postavljam rimsku oznaku
                    this.promijeniKolicina(this.recept.kolicina);
                    //Splitam dohvaćeno doziranje da ga mogu postaviti u potrebna polja
                    const doziranje = this.recept.doziranje.split("x");
                    //Postavljam vrijednosti frekvencije dozirnanja i perioda doziranja
                    this.doziranjeFrekvencija.patchValue(doziranje[0],{emitEvent: false});
                    this.doziranjePeriod.patchValue(doziranje[1],{emitEvent: false});
                    //Postavljam vrijednost dohvaćene dostatnosti
                    this.dostatnost.patchValue(this.recept.dostatnost,{emitEvent: false});
                    //Ako JE DEFINIRAN OJP u podatcima dohvaćenog recepta
                    if(this.recept.oblikJacinaPakiranjeLijek){
                        //Provjeravam je li se dohvaćeni lijek nalazi u OSNOVNOJ LISTI LIJEKOVA
                        for(const lijek of podatci.lijekoviOsnovnaLista){
                            if(lijek.zasticenoImeLijek === this.recept.proizvod && lijek.oblikJacinaPakiranjeLijek === this.recept.oblikJacinaPakiranjeLijek){
                                //Postavljam vrijednost lijeka u dropdown OSNOVNE liste
                                this.osnovnaListaLijekDropdown.patchValue(this.recept.proizvod + " " + this.recept.oblikJacinaPakiranjeLijek,{emitEvent: false});
                                //Postavljam inicijalno izabrani proizvod
                                this.izabraniProizvod = this.recept.proizvod + " " + this.recept.oblikJacinaPakiranjeLijek;
                            }
                        }
                        //Ako dropdown osnovne liste lijekova NIJE POPUNJEN JOŠ, znači da se proizvod ne nalazi u njoj
                        if(!this.osnovnaListaLijekDropdown.value){
                            //Provjeravam u dopunskoj listi
                            for(const lijek of podatci.lijekoviDopunskaLista){
                                if(lijek.zasticenoImeLijek === this.recept.proizvod && lijek.oblikJacinaPakiranjeLijek === this.recept.oblikJacinaPakiranjeLijek){
                                    //Postavljam vrijednost lijeka u dropdown DOPUNSKE liste
                                    this.dopunskaListaLijekDropdown.patchValue(this.recept.proizvod + " " + this.recept.oblikJacinaPakiranjeLijek,{emitEvent: false});
                                    //Postavljam inicijalno izabrani proizvod
                                    this.izabraniProizvod = this.recept.proizvod + " " + this.recept.oblikJacinaPakiranjeLijek;
                                }
                            }
                            //Dohvaćam cijene ovog lijeka iz dopunske liste
                            this.receptService.getCijenaLijekDL(this.izabraniProizvod).pipe(
                                tap(cijene => {
                                    //Prikazivam cijene
                                    this.isCijene = true;
                                    //Postavljam dohvaćene cijene u formu
                                    this.cijenaUkupno.patchValue(`${cijene[0].cijenaLijek} kn`,{emitEvent: false});
                                    this.cijenaZavod.patchValue(`${cijene[0].cijenaZavod} kn`,{emitEvent: false});
                                    this.cijenaOsiguranik.patchValue(`${cijene[0].doplataLijek} kn`,{emitEvent: false});
                                })
                            ).subscribe();
                        }
                    }
                    //Ako NIJE DEFINIRAN OJP u mom modelu recepta, znači da se radi o MAG.PRIPRAVKU
                    else{
                        //Provjeram je li se mag.pripravak nalazi u OSNOVNOJ LISTI MAG.PRIPRAVAKA
                        for(const magPripravak of this.magPripravciOsnovnaLista){
                            if(magPripravak === this.recept.proizvod){
                                //Označavam da treba prebaciti na polja mag.pripravaka
                                this.isMagPripravak = true;
                                //Označavam da više nisam na lijekovima
                                this.isLijek = false;
                                this.tip.patchValue("magPripravak",{emitEvent: false});
                                //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                    this.isMagPripravak, this.isValidDijagnoze.bind(this));
                                //Postavljam vrijednost proizvoda u polje OSNOVNE LISTE MAG.PRIPRAVAKA
                                this.osnovnaListaMagPripravakDropdown.patchValue(this.recept.proizvod,{emitEvent: false});
                                //Postavljam inicijalno izabrani proizvod
                                this.izabraniProizvod = this.recept.proizvod;
                            }
                        }
                        //Ako osnovna lista mag. pripravka nije popunjena, tražim dalje u dopunskoj listi mag.pripravaka
                        if(!this.osnovnaListaMagPripravakDropdown.value){
                            //Provjeram je li se mag.pripravak nalazi u DOPUNSKOJ LISTI MAG.PRIPRAVAKA
                            for(const magPripravak of this.magPripravciDopunskaLista){
                                if(magPripravak === this.recept.proizvod){
                                    //Označavam da treba prebaciti na polja mag.pripravaka
                                    this.isMagPripravak = true;
                                    //Označavam da više nisam na lijekovima
                                    this.isLijek = false;
                                    this.tip.patchValue("magPripravak",{emitEvent: false});
                                    //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                    azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                        this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                        this.isMagPripravak, this.isValidDijagnoze.bind(this));
                                    //Postavljam vrijednost proizvoda u polje DOPUNSKE LISTE MAG.PRIPRAVAKA
                                    this.dopunskaListaMagPripravakDropdown.patchValue(this.recept.proizvod,{emitEvent: false});
                                    //Postavljam inicijalno izabrani proizvod
                                    this.izabraniProizvod = this.recept.proizvod;
                                }
                            }
                            //Dohvaćam cijene za ovaj izabrani mag.pripravak
                            this.receptService.getCijenaMagPripravakDL(this.izabraniProizvod).pipe(
                                tap(cijene => {
                                    //Prikazivam cijene
                                    this.isCijene = true;
                                    //Postavljam cijene magistralnog pripravka u formu
                                    this.cijenaUkupno.patchValue(`${cijene[0].cijenaMagPripravak} kn`,{emitEvent: false});
                                    this.cijenaZavod.patchValue(`${cijene[0].cijenaZavod} kn`,{emitEvent: false});
                                    this.cijenaOsiguranik.patchValue(`${cijene[0].doplataMagPripravak} kn`,{emitEvent: false});
                                })
                            ).subscribe();
                        }
                    }
                }

                //Dohvaćam inicijalne dijagnoze ako ih ovaj pacijent ima te ako je dodavanje recepta
                if(podatci.inicijalneDijagnoze !== null && !this.editMode){
                    //Omogućavam unos sekundarne dijagnoze koja je inicijalno disable
                    this.sekundarnaDijagnoza.enable({emitEvent: false});
                    this.sekundarnaDijagnoza.clear();
                    //Resetiram svoje polje sekundarnih dijagnoza
                    this.sekundarnaDijagnozaPovijestBolesti = [];
                    //Dodavam jedan form control u polje sekundarnih dijagnoza
                    this.onAddDiagnosis();
                    //Prolazim poljem odgovora servera
                    for(let dijagnoza of podatci.inicijalneDijagnoze){
                        console.log(dijagnoza);
                        //Spremam ID obrade liječnika koji šaljem backendu
                        this.poslaniIDObrada = dijagnoza.idObradaLijecnik;
                        //Spremam tip slučaja
                        this.poslaniTipSlucaj = dijagnoza.tipSlucaj;
                        //Spremam vrijeme
                        this.poslanoVrijeme = dijagnoza.vrijeme;
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
                    SharedHandler.nazivToMKB(this.primarnaDijagnozaPovijestBolesti,this.dijagnoze,this.forma);
                    //Prolazim kroz sve prikupljene nazive sekundarnih dijagnoza sa servera
                    this.sekundarnaDijagnozaPovijestBolesti.forEach((element,index) => {
                        //U polju naziva sekundarnih dijagnoza postavljam prikupljena imena sek. dijagnoza na određenom indexu
                        (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('nazivSekundarna').patchValue(element,{emitEvent: false});
                        //Postavljam MKB šifre sek.dijagnoza
                        SharedHandler.nazivToMKBSekundarna(element,this.dijagnoze,this.forma,index);
                    });
                }
            }),
            switchMap(podatci => {
                //Ako se u Resolveru NALAZE podatci recepta (MOD AŽURIRANJA RECEPTA)
                if(podatci.recept){
                    return forkJoin([
                        this.receptService.getDatumDostatnost(podatci.recept[0].dostatnost),
                        this.prikazService.getSekundarneDijagnoze(podatci.recept[0].mkbSifraSekundarna),
                        //Ako je definirana šifra specijalista u dohvaćenom receptu, dohvati tip specijalista, inače postavi null
                        this.isSpecijalist ? this.prikazService.getTipSpecijalist(this.recept.sifraSpecijalist) : of(null)
                    ]).pipe(
                        tap(podatci => {
                            console.log(podatci);
                            //Postavljam dohvaćeni datum u polje datuma "Vrijedi do":
                            this.vrijediDo.patchValue(podatci[0],{emitEvent: false});
                            //Ako sekundarne dijagnoze nisu prazne
                            if(podatci[1].length !== 0){
                                //Omogućavam unos sekundarne dijagnoze koja je inicijalno disable
                                this.sekundarnaDijagnoza.enable({emitEvent: false});
                                this.sekundarnaDijagnoza.clear();
                                //Resetiram svoje polje sekundarnih dijagnoza
                                this.sekundarnaDijagnozaPovijestBolesti = [];
                                //Dodavam jedan form control u polje sekundarnih dijagnoza
                                this.onAddDiagnosis();
                                //Prolazim poljem odgovora servera
                                for(let dijagnoza of podatci[1]){
                                    //U polje sekundarnih dijagnoza spremam sve sekundarne dijagnoze povezane povijesti bolesti
                                    this.sekundarnaDijagnozaPovijestBolesti.push(dijagnoza.imeDijagnoza);
                                    //Za svaku sekundarnu dijagnozu sa servera NADODAVAM JEDAN FORM CONTROL
                                    this.onAddDiagnosis();
                                }
                                //BRIŠEM ZADNJI FORM CONTROL da ne bude jedan viška
                                this.onDeleteDiagnosis(-1);
                                //Prolazim kroz sve prikupljene nazive sekundarnih dijagnoza sa servera
                                this.sekundarnaDijagnozaPovijestBolesti.forEach((element,index) => {
                                    //U polju naziva sekundarnih dijagnoza postavljam prikupljena imena sek. dijagnoza na određenom indexu
                                    (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('nazivSekundarna').patchValue(element,{emitEvent: false});
                                    //Postavljam MKB šifre sek.dijagnoza
                                    SharedHandler.nazivToMKBSekundarna(element,this.dijagnoze,this.forma,index);
                                });
                            }
                            //Ako je definiran specijalist
                            if(this.isSpecijalist && podatci[2] !== null){
                                //Postavi tip specijalista u njegovo polje
                                this.tipSpecijalist.patchValue(podatci[2],{emitEvent: false});
                            }
                        })
                    );
                }
                //Ako se u Resolveru NE NALAZE podatci recepta (MOD DODAVANJA RECEPTA)
                else{
                    return of(null);
                }
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();

        //Pretplaćujem se na promjene u pojedinim dijelovima forme
        const prviDio = merge(
            //Pretplaćivam se na dohvat ID-a liječnika
            this.headerService.getIDLijecnik().pipe(
                tap(idLijecnik => {
                    //Spremam ID liječnika
                    this.idLijecnik = idLijecnik[0].idLijecnik;
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa primarne dijagnoze
            this.primarnaDijagnoza.valueChanges.pipe(
                tap(value => {
                    console.log("U promjenama primarne dijagnoze sam!");
                    //Ako je taj unos ispravan
                    if(this.primarnaDijagnoza.valid){
                        //Pozivam metodu da popuni polje MKB šifre te dijagnoze
                        SharedHandler.nazivToMKB(value,this.dijagnoze,this.forma);
                        //Omogućavam unos sekundarnih dijagnoza
                        this.sekundarnaDijagnoza.enable({emitEvent: false});
                    }
                    //Ako je polje naziva primarne dijagnoze prazno
                    if(!this.primarnaDijagnoza.value || !this.primarnaDijagnoza.valid){
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
                        SharedHandler.MKBtoNaziv(this.mkbPrimarnaDijagnoza.value,this.dijagnoze,this.forma);
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
                        this.izabraniProizvod = value;
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
                        //Resetiram checkbox "Svjesno prekoračenje" da liječnik ponovno mora kliknut da je svjestan prekoračenja doze
                        this.svjesnoPrekoracenje.reset();
                    }
                }),
                concatMap(value => {
                    return forkJoin([
                        receptHandler.azuriranjeDostatnosti(this.forma,this.receptService,this.isPonovljiv),
                        this.receptService.getOznakaLijek(value),
                        receptHandler.dohvatiDefiniranaDoza(this.forma,this.receptService)
                    ]).pipe(
                        tap(value => {
                            //Ako je server vratio da ima oznake "RS" na izabranom lijeku
                            if(value[1]["success"] === "true"){
                                //Označavam da treba prikazati polje unosa šifre specijalista
                                this.isSpecijalist = true;
                                //Dodaj validatore šifri specijalista
                                SharedHandler.setValidatorsSifraSpecijalist(this.forma,this.zdravstveniRadnici,this.isSpecijalist);
                                //Ažuriram ponovno sve validatore
                                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                                this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                                this.isMagPripravak, this.isValidDijagnoze.bind(this));
                            }
                            //Ako je server vratio da NEMA oznake "RS" na izabranom lijeku
                            else if(value[1]["success"] === "false"){
                                //Označavam da treba sakriti polje unosa šifre specijalista
                                this.isSpecijalist = false;
                                //Resetiram polje šifre specijalista
                                this.sifraSpecijalist.patchValue("",{emitEvent: false});
                                //Digni validatore šifri specijalista
                                receptHandler.clearValidatorsSifraSpecijalist(this.forma);
                                //Resetiram polje tipa specijalista
                                this.tipSpecijalist.patchValue("",{emitEvent: false});
                                //Ažuriram ponovno sve validatore
                                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                                this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                                this.isMagPripravak, this.isValidDijagnoze.bind(this));
                            }
                            //Ako server nije vratio null za prekoračenje doze (vratio je null ako lijek ne završava na mg ili g)
                            if(value[2] !== null){
                                //Ako je server vratio da je doziranje prekoračilo dnevno definiranu dozu
                                if(value[2]["success"] === "false"){
                                    //U polje unosa definirane doze postavljam vrijednost sa servera
                                    this.dddLijek.patchValue(value[2]["maxDoza"],{emitEvent: false});
                                    //Označavam da se prikaže svjesno prekoračenje doze
                                    this.isValidatorDDD = true;
                                    //Pozivam validator za prekoračenje doze
                                    this.doziranje.setValidators(Validacija.prekoracenjeDoze(value[2]));
                                    this.doziranje.updateValueAndValidity({emitEvent: false});
                                }
                            }
                            //Ako je server vratio null ILI je vratio da je success === true, tj. da doziranje ne prelazi dnevno definiranu dozu
                            if(value[2] === null || value[2]["success"] === "true"){
                                //Dižem redak svjesnog prekoračenja
                                this.isValidatorDDD = false;
                                receptHandler.resetirajSvjesnoPrekoracenje(this.forma);
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
                                    })
                                );
                            }
                            //Ako je server vratio null za dostatnost (uključuje da je odabran mag.pripravak ili je prazno doziranje, lijek ili količina)
                            if(value[0] === null){
                                return of(null).pipe(
                                    tap(() => {
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
                                    concatMap(() => {
                                        return this.receptService.getDatumDostatnost(this.trajanjeTerapije.toString()).pipe(
                                            tap(datum => {
                                                //Postavi datum
                                                this.vrijediDo.patchValue(datum,{emitEvent: false});
                                            })
                                        );
                                    })
                                );
                            }
                        })
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
                        //Spremam izabrani proizvod
                        this.izabraniProizvod = value;
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
                        //Resetiram checkbox "Svjesno prekoračenje" da liječnik ponovno mora kliknut da je svjestan prekoračenja doze
                        this.svjesnoPrekoracenje.reset();
                    }
                }),
                //Unese se lijek sa dopunske liste, uzmem tu vrijednost i pošaljem je serveru da dohvatim cijenu tog lijeka
                concatMap(value => {
                    return forkJoin([
                        this.receptService.getCijenaLijekDL(value),
                        this.receptService.getOznakaLijek(value),
                        receptHandler.azuriranjeDostatnosti(this.forma,this.receptService,this.isPonovljiv),
                        receptHandler.dohvatiDefiniranaDoza(this.forma,this.receptService)
                    ]).pipe(
                        tap(value => {
                            console.log(value);
                            //Ako je server vratio da ovaj lijek IMA oznaku "RS":
                            if(value[1].success === "true"){
                                //Označavam da treba prikazati polje unosa šifre specijalista
                                this.isSpecijalist = true;
                                //Dodaj validatore šifri specijalista
                                SharedHandler.setValidatorsSifraSpecijalist(this.forma,this.zdravstveniRadnici,this.isSpecijalist);
                                //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                                this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                                this.isMagPripravak, this.isValidDijagnoze.bind(this));
                            }
                            //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                            else{
                                this.isSpecijalist = false;
                                //Resetiram polje šifre specijalista
                                this.sifraSpecijalist.patchValue("",{emitEvent: false});
                                //Resetiram polje tipa specijalista
                                this.tipSpecijalist.patchValue("",{emitEvent: false});
                                //Digni validatore šifri specijalista
                                receptHandler.clearValidatorsSifraSpecijalist(this.forma);
                                //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                                this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                                this.isMagPripravak, this.isValidDijagnoze.bind(this));
                            }
                            //Postavljam vrijednosti cijena u formu
                            this.cijenaUkupno.patchValue(`${value[0][0].cijenaLijek} kn`,{emitEvent: false});
                            this.cijenaZavod.patchValue(`${value[0][0].cijenaZavod} kn`,{emitEvent: false});
                            this.cijenaOsiguranik.patchValue(`${value[0][0].doplataLijek} kn`,{emitEvent: false});
                            //Ako server nije vratio null za prekoračenje doze (vratio je null ako lijek ne završava na mg ili g)
                            if(value[3] !== null){
                                //Ako je server vratio da je doziranje prekoračilo dnevno definiranu dozu
                                if(value[3]["success"] === "false"){
                                    //U polje unosa definirane doze postavljam vrijednost sa servera
                                    this.dddLijek.patchValue(value[3]["maxDoza"],{emitEvent: false});
                                    //Označavam da se prikaže svjesno prekoračenje doze
                                    this.isValidatorDDD = true;
                                    //Pozivam validator za prekoračenje doze
                                    this.doziranje.setValidators(Validacija.prekoracenjeDoze(value[3]));
                                    this.doziranje.updateValueAndValidity({emitEvent: false});
                                }
                            }
                            //Ako je server vratio null ILI je vratio da je success === true, tj. da doziranje ne prelazi dnevno definiranu dozu
                            if(value[3] === null || value[3]["success"] === "true"){
                                //Dižem redak svjesnog prekoračenja
                                this.isValidatorDDD = false;
                                receptHandler.resetirajSvjesnoPrekoracenje(this.forma);
                            }
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
                                    })
                                );
                            }
                            //Ako je server vratio null za dostatnost (uključuje da je odabran mag.pripravak ili je prazno doziranje, lijek ili količina)
                            else if(value[2] === null){
                                //Nastavi niz podataka
                                return of(null).pipe(
                                    tap(() => {
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
                                    concatMap(() => {
                                        return this.receptService.getDatumDostatnost(this.trajanjeTerapije.toString()).pipe(
                                            tap(datum => {
                                                //Postavi datum
                                                this.vrijediDo.patchValue(datum,{emitEvent: false});
                                            })
                                        );
                                    })
                                );
                            }
                        })
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
                        //Spremam izabrani proizvod
                        this.izabraniProizvod = value;
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
                        this.trajanjeTerapije = 30 * +this.kolicinaDropdown.value;
                        //Ako je postavljen broj ponavljanja
                        if(this.brojPonavljanja.value){
                            this.trajanjeTerapije = this.trajanjeTerapije * (+this.brojPonavljanja.value + 1);
                        }
                        //U polje dostatnosti postavi 30 dana
                        this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
                        //Dižem redak svjesnog prekoračenja
                        this.isValidatorDDD = false;
                        receptHandler.resetirajSvjesnoPrekoracenje(this.forma);
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
                                //Dodaj validatore šifri specijalista
                                SharedHandler.setValidatorsSifraSpecijalist(this.forma,this.zdravstveniRadnici,this.isSpecijalist);
                                //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                                this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                                this.isMagPripravak, this.isValidDijagnoze.bind(this));
                            }
                            //Ako je server vratio da NEMA oznake "RS" na izabranom lijeku
                            else{
                                //Označavam da treba sakriti polje unosa šifre specijalista
                                this.isSpecijalist = false;
                                //Resetiram polje šifre specijalista
                                this.sifraSpecijalist.patchValue("",{emitEvent: false});
                                //Digni validatore šifri specijalista
                                receptHandler.clearValidatorsSifraSpecijalist(this.forma);
                                //Resetiram polje tipa specijalista
                                this.tipSpecijalist.patchValue("",{emitEvent: false});
                                //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                                this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                                this.isMagPripravak, this.isValidDijagnoze.bind(this));
                            }
                            //U polje datuma postavljam datum
                            this.vrijediDo.patchValue(value[1],{emitEvent: false});
                        })
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
                        //Spremam izabrani proizvod
                        this.izabraniProizvod = value;
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
                        this.trajanjeTerapije = 30 * +this.kolicinaDropdown.value;
                        //Ako je postavljen broj ponavljanja
                        if(this.brojPonavljanja.value){
                            this.trajanjeTerapije = this.trajanjeTerapije * (+this.brojPonavljanja.value + 1);
                        }
                        //U polje dostatnosti postavi 30 dana
                        this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
                        //Dižem redak svjesnog prekoračenja
                        this.isValidatorDDD = false;
                        //Resetiram svjesno prekoračenje te dižem validatore ddd-a
                        receptHandler.resetirajSvjesnoPrekoracenje(this.forma);
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
                                //Dodaj validatore šifri specijalista
                                SharedHandler.setValidatorsSifraSpecijalist(this.forma,this.zdravstveniRadnici,this.isSpecijalist);
                                //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                                this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                                this.isMagPripravak, this.isValidDijagnoze.bind(this));
                            }
                            //Ako je server vratio da NEMA oznake "RS" na izabranom lijeku
                            else{
                                //Označavam da treba sakriti polje unosa šifre specijalista
                                this.isSpecijalist = false;
                                //Resetiram polje šifre specijalista
                                this.sifraSpecijalist.patchValue("",{emitEvent: false});
                                //Digni validatore šifri specijalista
                                receptHandler.clearValidatorsSifraSpecijalist(this.forma);
                                //Resetiram polje tipa specijalista
                                this.tipSpecijalist.patchValue("",{emitEvent: false});
                                //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                                this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                                this.isMagPripravak, this.isValidDijagnoze.bind(this));
                            }
                            //U polje datuma postavljam vrijednost datuma
                            this.vrijediDo.patchValue(value[2],{emitEvent: false});
                        })
                    )
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na promjene u polju unosa količine
            this.kolicinaDropdown.valueChanges.pipe(
                //Za svaku promjenu u vrijednosti količine, izvršava se unutarnji Observable koji dohvaća dostatnost
                switchMap(() => {
                    return forkJoin([
                        receptHandler.azuriranjeDostatnostiHandler(this.forma,this.receptService,
                            this.pretplateSubject,this.trajanjeTerapije,this.isPonovljiv),
                        receptHandler.doziranjePresloDDD(this.forma,this.receptService)
                    ]).pipe(
                        tap((value) => {
                            //Ako server nije vratio null tj. ako lijek završava na mg ili g
                            if(value[1] !== null){
                                //Te ako je server vratio informaciju da je trenutno doziranje PREŠLO definiranu dnevnu dozu
                                if(value[1]["success"] === "false"){
                                    //Prikaži redak svjesnog prekoračenja
                                    this.isValidatorDDD = true;
                                }
                            }
                            //Ako je server vratio null ILI informaciju da doziranje NIJE PREŠLO dnevno definiranu dozu
                            if(value[1] === null || value[1]["success"] === "true"){
                                //Digni redak svjesnog prekoračenja
                                this.isValidatorDDD = false;
                            }
                        })
                    )
                })
            ),
            //Pretplaćujem se na promjene u polju FREKVENCIJE DOZIRANJA i PERIODA DOZIRANJA
            this.doziranje.valueChanges.pipe(
                //Za svaku promjenu u vrijednosti doziranja, izvršava se unutarnji Observable koji dohvaća dostatnost
                switchMap(() => {
                    return forkJoin([
                        receptHandler.azuriranjeDostatnostiHandler(this.forma,this.receptService,
                            this.pretplateSubject,this.trajanjeTerapije,this.isPonovljiv),
                        receptHandler.doziranjePresloDDD(this.forma,this.receptService)
                    ]).pipe(
                        tap((value) => {
                            //Ako server nije vratio null tj. ako lijek završava na mg ili g
                            if(value[1] !== null){
                                //Te ako je server vratio informaciju da je trenutno doziranje PREŠLO definiranu dnevnu dozu
                                if(value[1]["success"] === "false"){
                                    //Prikaži redak svjesnog prekoračenja
                                    this.isValidatorDDD = true;
                                }
                            }
                            //Ako je server vratio null ILI informaciju da doziranje NIJE PREŠLO dnevno definiranu dozu
                            if(value[1] === null || value[1]["success"] === "true"){
                                //Digni redak svjesnog prekoračenja
                                this.isValidatorDDD = false;
                            }
                        })
                    )
                })
            ),
            //Pretplaćivam se na promjene u polju DOSTATNOSTI
            this.dostatnost.valueChanges.pipe(
                //Uzimam vrijednost dostatnosti i prosljeđivam je funkciji koja računa datum "Vrijedi do:" na osnovu te dostatnosti
                switchMap(dostatnost => {
                    //Ako dostatnost NIJE NULL
                    if(dostatnost){
                        //Ako je unos dostatnosti ispravan (samo cjelobrojne vrijednosti)
                        if(this.dostatnost.valid){
                            return this.receptService.getDatumDostatnost(dostatnost.toString()).pipe(
                                tap(datum => {
                                    //Postavi datum u njegovo polje
                                    this.vrijediDo.patchValue(datum,{emitEvent: false});
                                })
                            );
                        }
                        //Ako unos dostatnosti nije valjan (slova, specijalni znakovi itd..)
                        else{
                            //Resetiram vrijednost datuma
                            this.vrijediDo.patchValue(null,{emitEvent: false});
                            return of(null);
                        }
                    }
                    //Ako je dostatnost null
                    else{
                        return of(null).pipe(
                            tap(() => {
                                //Postavi datum na null
                                this.vrijediDo.patchValue(null,{emitEvent: false});
                            })
                        );
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćivam se na promjene u polju BROJA PONAVLJANJA
            this.brojPonavljanja.valueChanges.pipe(
                tap(() => console.log("U promjenama sam broja ponavljanja!")),
                switchMap(() => {
                    return forkJoin([
                        receptHandler.azuriranjeDostatnostiHandler(this.forma,this.receptService,
                            this.pretplateSubject,this.trajanjeTerapije,this.isPonovljiv),
                        receptHandler.doziranjePresloDDD(this.forma,this.receptService)
                    ]).pipe(
                        tap((value) => {
                            //Ako server nije vratio null tj. ako lijek završava na mg ili g
                            if(value[1] !== null){
                                //Te ako je server vratio informaciju da je trenutno doziranje PREŠLO definiranu dnevnu dozu
                                if(value[1]["success"] === "false"){
                                    //Prikaži redak svjesnog prekoračenja
                                    this.isValidatorDDD = true;
                                }
                            }
                            //Ako je server vratio null ILI informaciju da doziranje NIJE PREŠLO dnevno definiranu dozu
                            if(value[1] === null || value[1]["success"] === "true"){
                                //Digni redak svjesnog prekoračenja
                                this.isValidatorDDD = false;
                            }
                        })
                    )
                })
            ),
            //Pretplaćujem se na promjene u polju unosa šifre specijalista
            this.sifraSpecijalist.valueChanges.pipe(
                tap(value => {
                    //Ako šifra specijalista nije unesena
                    if(this.sifraSpecijalist.value.length === 0){
                        //Praznim polje tipa specijalista
                        this.tipSpecijalist.patchValue(null, {emitEvent: false});
                    }
                    //Pozivam funkciju koja puni polje tipa specijalista na osnovu unesene šifre specijalista
                    SharedHandler.sifraSpecijalistToTip(value,this.zdravstveniRadnici,this.forma,this.isSpecijalist);
                }),
                takeUntil(this.pretplateSubject)
            ),
        ).subscribe();
        //Pretplaćujem se na promjene u tekstualnim poljima lijekova i mag.pripravaka
        const drugiDio = merge(
            //Slušam promjene u polju unosa lijeka sa osnovne liste pomoću pretrage
            this.osnovnaListaLijekText.valueChanges.pipe(
                debounceTime(100),
                distinctUntilChanged(),
                tap(() => {
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
                        tap(odgovor => {
                            //Ako liječnik pretražuje LIJEKOVE sa OSNOVNE LISTE
                            if(this.isPretragaLijekOsnovnaLista){
                              //Ako je polje unosa prazno
                              if(this.osnovnaListaLijekText.value.length === 0){
                                  //Digni ul tag
                                  this.isPretragaLijekOsnovnaLista = false;
                                  //Ažuriraj validaciju cijele forme
                                  this.forma.updateValueAndValidity({emitEvent: false});
                                  //Ako je prikazano polje unosa šifre specijalista
                                  if(this.isSpecijalist){
                                      this.isSpecijalist = false;
                                      //Resetiram polje šifre specijalista
                                      this.sifraSpecijalist.patchValue("",{emitEvent: false});
                                      //Resetiram polje tipa specijalista
                                      this.tipSpecijalist.patchValue("",{emitEvent: false});
                                      //Digni validatore šifri specijalista
                                      receptHandler.clearValidatorsSifraSpecijalist(this.forma);
                                      //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                      azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                                      this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                                      this.isMagPripravak, this.isValidDijagnoze.bind(this));
                                  }
                              }
                              //Ako je server vratio uspješnu poruku
                              if(odgovor["success"] !== "false"){
                                  //Prolazim kroz LIJEKOVE OSNOVNE LISTE
                                  for(const lijek of this.lijekoviOsnovnaListaOJP){
                                      //Ako je neki lijek (malim slovima) jednak lijeku (malim slovima) koji je liječnik upisao u pretragu
                                      if(lijek.toLowerCase() === this.osnovnaListaLijekText.value.toLowerCase()){
                                          //Postavljam lijek iz polja u polje pretrage automatski
                                          this.osnovnaListaLijekText.patchValue(lijek,{emitEvent: false});
                                          //Spremam izabrani proizvod
                                          this.izabraniProizvod = lijek;
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
                        })
                    );
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa lijeka sa dopunske liste pomoću pretrage
            this.dopunskaListaLijekText.valueChanges.pipe(
                debounceTime(100),
                distinctUntilChanged(),
                tap(() => {
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
                        tap(odgovor => {
                            //Ako liječnik pretražuje LIJEKOVE sa DOPUNSKE LISTE
                            if(this.isPretragaLijekDopunskaLista){
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
                                    //Ako je prikazano polje unosa šifre specijalista
                                    if(this.isSpecijalist){
                                        this.isSpecijalist = false;
                                        //Resetiram polje šifre specijalista
                                        this.sifraSpecijalist.patchValue("",{emitEvent: false});
                                        //Resetiram polje tipa specijalista
                                        this.tipSpecijalist.patchValue("",{emitEvent: false});
                                        //Digni validatore šifri specijalista
                                        receptHandler.clearValidatorsSifraSpecijalist(this.forma);
                                        //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                        azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                                        this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                                        this.isMagPripravak, this.isValidDijagnoze.bind(this));
                                    }
                                }
                                //Ako je server vratio uspješnu poruku (tj. da ima rezultata)
                                if(odgovor["success"] !== "false"){
                                    //Prolazim kroz lijekove dopunske liste
                                    for(const lijek of this.lijekoviDopunskaListaOJP){
                                        //Ako je lijek iz polja (malim slovima) jednak unesenome lijeku (malim slovima)
                                        if(lijek.toLowerCase() === this.dopunskaListaLijekText.value.toLowerCase()){
                                            //Spremam izabrani proizvod
                                            this.izabraniProizvod = lijek;
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
                        })
                    );
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa mag. pripravka sa osnovne liste pomoću pretrage
            this.osnovnaListaMagPripravakText.valueChanges.pipe(
                debounceTime(100),
                distinctUntilChanged(),
                tap(() => {
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
                        tap(odgovor => {
                            //Ako liječnik pretražuje MAGISTRALNE PRIPRAVKE sa OSNOVNE LISTE
                            if(this.isPretragaMagPripravakOsnovnaLista){
                              //Ako je polje unosa prazno
                              if(this.osnovnaListaMagPripravakText.value.length === 0){
                                  //Ažuriram validaciju cijele forme
                                  this.forma.updateValueAndValidity({emitEvent: false});
                                  //Digni ul tag
                                  this.isPretragaMagPripravakOsnovnaLista = false;
                                  //Ako je prikazano polje unosa šifre specijalista
                                  if(this.isSpecijalist){
                                      this.isSpecijalist = false;
                                      //Resetiram polje šifre specijalista
                                      this.sifraSpecijalist.patchValue("",{emitEvent: false});
                                      //Resetiram polje tipa specijalista
                                      this.tipSpecijalist.patchValue("",{emitEvent: false});
                                      //Digni validatore šifri specijalista
                                      receptHandler.clearValidatorsSifraSpecijalist(this.forma);
                                      //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                      azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                                    this.isMagPripravak, this.isValidDijagnoze.bind(this));
                                  }
                              }
                              //Ako JE server vratio neke rezultate
                              if(odgovor["success"] !== "false"){
                                  //Prolazim polje mag.pripravaka osnovne liste
                                  for(const magPripravak of this.magPripravciOsnovnaLista){
                                      //Ako je mag.pripravak iz polja (malim slovima) JEDNAK mag. pripravku iz polja pretrage (malim slovima)
                                      if(magPripravak.toLowerCase() === this.osnovnaListaMagPripravakText.value.toLowerCase()){
                                          //Spremam izabrani proizvod
                                          this.izabraniProizvod = magPripravak;
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
                        })
                    );
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa mag. pripravka sa dopunske liste pomoću pretrage
            this.dopunskaListaMagPripravakText.valueChanges.pipe(
                debounceTime(100),
                distinctUntilChanged(),
                tap(() => {
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
                        tap(odgovor => {
                            //Ako liječnik pretražuje MAGISTRALNE PRIPRAVKE sa DOPUNSKE LISTE
                            if(this.isPretragaMagPripravakDopunskaLista){
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
                                  //Ako je prikazano polje unosa šifre specijalista
                                  if(this.isSpecijalist){
                                      this.isSpecijalist = false;
                                      //Resetiram polje šifre specijalista
                                      this.sifraSpecijalist.patchValue("",{emitEvent: false});
                                      //Resetiram polje tipa specijalista
                                      this.tipSpecijalist.patchValue("",{emitEvent: false});
                                      //Digni validatore šifri specijalista
                                      receptHandler.clearValidatorsSifraSpecijalist(this.forma);
                                      //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                                      azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                                    this.isMagPripravak, this.isValidDijagnoze.bind(this));
                                  }
                              }
                              //Ako JE server vratio neke rezultate
                              if(odgovor["success"] !== "false"){
                                  //Prolazim kroz polje mag. pripravaka dopunske liste
                                  for(const magPripravak of this.magPripravciDopunskaLista){
                                      //Ako je mag. pripravak iz polja (malim slovima) JEDNAK mag. pripravku iz polja pretrage (malim slovima)
                                      if(magPripravak.toLowerCase() === this.dopunskaListaMagPripravakText.value.toLowerCase()){
                                          //Spremam izabrani proizvod
                                          this.izabraniProizvod = magPripravak;
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
                        })
                    );
                }),
                takeUntil(this.pretplateSubject)
            )
        ).subscribe();
    }

    //Metoda koja se pokreće kada korisnik unese pravu vrijednost u polje pretrage OSNOVNE LISTE LIJEKOVA
    ispravanUnosLijekOL(lijek: string){
        //Spremam izabrani proizvod
        this.izabraniProizvod = lijek;
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
        //Resetiram checkbox "Svjesno prekoračenje" da liječnik ponovno mora kliknut da je svjestan prekoračenja doze
        this.svjesnoPrekoracenje.reset();
        //Pretplaćujem se na informaciju ima li izabrani lijek oznaku "RS"
        const combined = forkJoin([
            this.receptService.getOznakaLijek(lijek),
            receptHandler.azuriranjeDostatnosti(this.forma,this.receptService,this.isPonovljiv),
            receptHandler.dohvatiDefiniranaDoza(this.forma,this.receptService)
        ]).pipe(
            //Dohvaćam odgovor
            tap((odgovor) => {
                console.log(odgovor);
                //Ako je server vratio da ovaj lijek IMA oznaku "RS":
                if(odgovor[0].success === "true"){
                    //Označavam da treba prikazati polje unosa šifre specijalista
                    this.isSpecijalist = true;
                    //Dodaj validatore šifri specijalista
                    SharedHandler.setValidatorsSifraSpecijalist(this.forma,this.zdravstveniRadnici,this.isSpecijalist);
                    //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                    this.isMagPripravak, this.isValidDijagnoze.bind(this));
                }
                //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                else{
                    this.isSpecijalist = false;
                    //Resetiram polje šifre specijalista
                    this.sifraSpecijalist.patchValue("",{emitEvent: false});
                    //Digni validatore šifri specijalista
                    receptHandler.clearValidatorsSifraSpecijalist(this.forma);
                    //Resetiram polje tipa specijalista
                    this.tipSpecijalist.patchValue("",{emitEvent: false});
                    //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                    this.isMagPripravak, this.isValidDijagnoze.bind(this));
                }
                //Ako server nije vratio null za prekoračenje doze (vratio je null ako lijek ne završava na mg ili g)
                if(odgovor[2] !== null){
                    //Ako je server vratio da je doziranje prekoračilo dnevno definiranu dozu
                    if(odgovor[2]["success"] === "false"){
                        //U polje unosa definirane doze postavljam vrijednost sa servera
                        this.dddLijek.patchValue(odgovor[2]["maxDoza"],{emitEvent: false});
                        //Označavam da se prikaže svjesno prekoračenje doze
                        this.isValidatorDDD = true;
                        //Pozivam validator za prekoračenje doze
                        this.doziranje.setValidators(Validacija.prekoracenjeDoze(odgovor[2]));
                        this.doziranje.updateValueAndValidity({emitEvent: false});
                    }
                }
                //Ako je server vratio null ILI je vratio da je success === true, tj. da doziranje ne prelazi dnevno definiranu dozu
                if(odgovor[2] === null || odgovor[2]["success"] === "true"){
                    //Dižem redak svjesnog prekoračenja
                    this.isValidatorDDD = false;
                    receptHandler.resetirajSvjesnoPrekoracenje(this.forma);
                }
            }),
            switchMap(value => {
                //Ako vrijednost dostatnosti NIJE NULL
                if(value[1] !== null){
                    //Ažuriram polje trajanja terapije
                    this.dostatnost.patchValue(value[1].toString(),{emitEvent: false});
                    return this.receptService.getDatumDostatnost(value[1].toString()).pipe(
                        tap(datum => {
                            //Postavljam datum
                            this.vrijediDo.patchValue(datum,{emitEvent: false});
                        })
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
                        tap(() => {
                            //Računam dostatnost pa ga postavljam u polje
                            this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
                        }),
                        //Kada server vrati null za dostatnost, pozovi funkciju koja ažurira datum "vrijediDo"
                        concatMap(() => {
                            return this.receptService.getDatumDostatnost(this.trajanjeTerapije.toString()).pipe(
                                tap(datum => {
                                    //Postavi datum
                                    this.vrijediDo.patchValue(datum,{emitEvent: false});
                                })
                            );
                        })
                    );
                }
            })
        ).subscribe();
    }
    //Metoda koja se poziva kada liječnik unese pravu vrijednost lijeka sa DOPUNSKE LISTE LIJEKOVA
    ispravanUnosLijekDL(lijek: string){
        //Spremam izabrani proizvod
        this.izabraniProizvod = lijek;
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
        //Resetiram checkbox "Svjesno prekoračenje" da liječnik ponovno mora kliknut da je svjestan prekoračenja doze
        this.svjesnoPrekoracenje.reset();
        //Pretplaćujem se na Observable u kojemu se nalaze cijene i informacija je li lijek ima oznaku "RS"
        const combined = forkJoin([
            this.receptService.getCijenaLijekDL(lijek),
            this.receptService.getOznakaLijek(lijek),
            receptHandler.azuriranjeDostatnosti(this.forma,this.receptService,this.isPonovljiv),
            receptHandler.dohvatiDefiniranaDoza(this.forma,this.receptService)
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
                    //Dodaj validatore šifri specijalista
                    SharedHandler.setValidatorsSifraSpecijalist(this.forma,this.zdravstveniRadnici,this.isSpecijalist);
                    //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                    this.isMagPripravak, this.isValidDijagnoze.bind(this));
                }
                //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                else{
                    this.isSpecijalist = false;
                    //Resetiram polje šifre specijalista
                    this.sifraSpecijalist.patchValue("",{emitEvent: false});
                    //Digni validatore šifri specijalista
                    receptHandler.clearValidatorsSifraSpecijalist(this.forma);
                    //Resetiram polje tipa specijalista
                    this.tipSpecijalist.patchValue("",{emitEvent: false});
                    //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                    this.isMagPripravak, this.isValidDijagnoze.bind(this));
                }
                //Ako server nije vratio null za prekoračenje doze (vratio je null ako lijek ne završava na mg ili g)
                if(odgovor[3] !== null){
                    //Ako je server vratio da je doziranje prekoračilo dnevno definiranu dozu
                    if(odgovor[3]["success"] === "false"){
                        //U polje unosa definirane doze postavljam vrijednost sa servera
                        this.dddLijek.patchValue(odgovor[3]["maxDoza"],{emitEvent: false});
                        //Označavam da se prikaže svjesno prekoračenje doze
                        this.isValidatorDDD = true;
                        //Pozivam validator za prekoračenje doze
                        this.doziranje.setValidators(Validacija.prekoracenjeDoze(odgovor[3]));
                        this.doziranje.updateValueAndValidity({emitEvent: false});
                    }
                }
                //Ako je server vratio null ILI je vratio da je success === true, tj. da doziranje ne prelazi dnevno definiranu dozu
                if(odgovor[3] === null || odgovor[3]["success"] === "true"){
                    //Dižem redak svjesnog prekoračenja
                    this.isValidatorDDD = false;
                    receptHandler.resetirajSvjesnoPrekoracenje(this.forma);
                }
            }),
            switchMap(odgovor => {
                //Ako vrijednost dostatnosti NIJE NULL
                if(odgovor[2] !== null){
                    //Ažuriram polje trajanja terapije
                    this.dostatnost.patchValue(odgovor[2].toString(),{emitEvent: false});
                    //Prosljeđivam dostatnost u danima funkciji za računanje datuma
                    return this.receptService.getDatumDostatnost(odgovor[2].toString()).pipe(
                        tap(datum => {
                            //Postavljam datum
                            this.vrijediDo.patchValue(datum,{emitEvent: false});
                        })
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
                        tap(() => {
                            //Računam dostatnost pa ga postavljam u polje
                            this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
                        }),
                        //Kada server vrati null za dostatnost, pozovi funkciju koja ažurira datum "vrijediDo"
                        switchMap(() => {
                            return this.receptService.getDatumDostatnost(this.trajanjeTerapije.toString()).pipe(
                                tap(datum => {
                                    //Postavi datum
                                    this.vrijediDo.patchValue(datum,{emitEvent: false});
                                })
                            );
                        })
                    );
                }
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }
    //Metoda koja se poziva kada liječnik unese ispravan unos MAG.PRIPRAVKA iz OSNOVNE LISTE
    ispravanUnosMagPripravakOL(magPripravak: string){
        //Spremam izabrani proizvod
        this.izabraniProizvod = magPripravak;
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
        this.trajanjeTerapije = 30 * +this.kolicinaDropdown.value;
        //Ako je postavljen broj ponavljanja
        if(this.brojPonavljanja.value){
            this.trajanjeTerapije = this.trajanjeTerapije * (+this.brojPonavljanja.value + 1);
        }
        //Postavi dane dostatnosti inicijalno na 30 dana
        this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
        //Dižem redak svjesnog prekoračenja
        this.isValidatorDDD = false;
        //Resetiram svjesno prekoračenje te dižem validatore ddd-a
        receptHandler.resetirajSvjesnoPrekoracenje(this.forma);
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
                    //Dodaj validatore šifri specijalista
                    SharedHandler.setValidatorsSifraSpecijalist(this.forma,this.zdravstveniRadnici,this.isSpecijalist);
                    //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                    this.isMagPripravak, this.isValidDijagnoze.bind(this));
                }
                //Ako je server vratio da ovaj mag.pripravak NEMA oznaku "RS":
                else{
                    this.isSpecijalist = false;
                    //Resetiram polje šifre specijalista
                    this.sifraSpecijalist.patchValue("",{emitEvent: false});
                    //Digni validatore šifri specijalista
                    receptHandler.clearValidatorsSifraSpecijalist(this.forma);
                    //Resetiram polje tipa specijalista
                    this.tipSpecijalist.patchValue("",{emitEvent: false});
                    //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                    this.isMagPripravak, this.isValidDijagnoze.bind(this));
                }
                //Postavljam datum
                this.vrijediDo.patchValue(odgovor[1],{emitEvent: false});
            })
        ).subscribe();
    }
    //Metoda koja se poziva kada liječnik unese ispravan unos MAG. PRIPRAVKA sa DOPUNSKE LISTE
    ispravanUnosMagPripravakDL(magPripravak: string){
        //Spremam izabrani proizvod
        this.izabraniProizvod = magPripravak;
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
        this.trajanjeTerapije = 30 * +this.kolicinaDropdown.value;
        //Ako je postavljen broj ponavljanja
        if(this.brojPonavljanja.value){
            this.trajanjeTerapije = this.trajanjeTerapije * (+this.brojPonavljanja.value + 1);
        }
        //Postavi dostatnost inicijalno na 30 dana
        this.dostatnost.patchValue(this.trajanjeTerapije.toString(),{emitEvent: false});
        //Dižem redak svjesnog prekoračenja
        this.isValidatorDDD = false;
        //Resetiram svjesno prekoračenje te dižem validatore ddd-a
        receptHandler.resetirajSvjesnoPrekoracenje(this.forma);
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
                    //Dodaj validatore šifri specijalista
                    SharedHandler.setValidatorsSifraSpecijalist(this.forma,this.zdravstveniRadnici,this.isSpecijalist);
                    //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                    this.isMagPripravak, this.isValidDijagnoze.bind(this));
                }
                //Ako je server vratio da ovaj lijek NEMA oznaku "RS":
                else{
                    this.isSpecijalist = false;
                    //Resetiram polje šifre specijalista
                    this.sifraSpecijalist.patchValue("",{emitEvent: false});
                    //Digni validatore šifri specijalista
                    receptHandler.clearValidatorsSifraSpecijalist(this.forma);
                    //Resetiram polje tipa specijalista
                    this.tipSpecijalist.patchValue("",{emitEvent: false});
                    //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
                    azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                                    this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                                    this.isMagPripravak, this.isValidDijagnoze.bind(this));
                }
                //Postavljam datum
                this.vrijediDo.patchValue(value[2],{emitEvent: false});
            })
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
            //Dižem polje unosa šifre specijalista
            this.isSpecijalist = false;
            //Digni validatore šifre specijalista
            receptHandler.clearValidatorsSifraSpecijalist(this.forma);
            //Resetiram polje tipa specijalista
            this.tipSpecijalist.patchValue("",{emitEvent: false});
            //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
            azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                            this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                            this.isMagPripravak, this.isValidDijagnoze.bind(this));
            //Sakrij cijene
            this.isCijene = false;
            //Resetiram sva polja vezana za magistralne pripravke
            this.osnovnaListaMagPripravakDropdown.patchValue(null,{emitEvent: false});
            this.osnovnaListaMagPripravakText.patchValue("",{emitEvent: false});
            this.dopunskaListaMagPripravakDropdown.patchValue(null,{emitEvent: false});
            this.dopunskaListaMagPripravakText.patchValue("",{emitEvent: false});
            //Resetiram polje šifre specijalista
            this.sifraSpecijalist.patchValue("",{emitEvent: false});
            //Dižem redak svjesnog prekoračenja
            this.isValidatorDDD = false;
            //Resetiram svjesno prekoračenje te dižem validatore ddd-a
            receptHandler.resetirajSvjesnoPrekoracenje(this.forma);
        }
        else if($event.target.value === "magPripravak"){
            //Resetiram poruku koja objavljuje da nema rezultata
            this.porukaNemaRezultata = null;
            //Označavam da liječnik želi unijeti mag.pripravak
            this.isMagPripravak = true;
            //Označavam da liječnik ne želi unijeti lijek
            this.isLijek = false;
            //Dižem polje unosa šifre specijalista
            this.isSpecijalist = false;
            //Digni validatore šifre specijalista
            receptHandler.clearValidatorsSifraSpecijalist(this.forma);
            //Resetiram polje tipa specijalista
            this.tipSpecijalist.patchValue("",{emitEvent: false});
            //Dinamički postavljam validatore na cijelu formu (automatski uklanja prethodne validatore)
            azurirajValidatore(this.forma,this.lijekoviOsnovnaListaOJP,this.lijekoviDopunskaListaOJP,
                            this.magPripravciOsnovnaLista, this.magPripravciDopunskaLista, this.isLijek,
                            this.isMagPripravak, this.isValidDijagnoze.bind(this));
            //Sakrij cijene
            this.isCijene = false;
            //Resetiram sva polja vezana uz lijekove
            this.osnovnaListaLijekDropdown.patchValue(null,{emitEvent: false});
            this.osnovnaListaLijekText.patchValue("",{emitEvent: false});
            this.dopunskaListaLijekDropdown.patchValue(null,{emitEvent: false});
            this.dopunskaListaLijekText.patchValue("",{emitEvent: false});
            //Resetiram polje šifre specijalista
            this.sifraSpecijalist.patchValue("",{emitEvent: false});
            //Dižem redak svjesnog prekoračenja
            this.isValidatorDDD = false;
            //Resetiram svjesno prekoračenje te dižem validatore ddd-a
            receptHandler.resetirajSvjesnoPrekoracenje(this.forma);
        }
    }

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na ažuriranje recepta
    azurirajRecept(
        mkbPolje: string[],
        isDopunsko: string,
        doplata: number,
        oznaka: string){
        return this.receptService.azurirajRecept(
            this.idLijecnik,
            this.mkbPrimarnaDijagnoza.value,
            mkbPolje,
            this.osnovnaListaLijekDropdown.value,
            this.osnovnaListaLijekText.value,
            this.dopunskaListaLijekDropdown.value,
            this.dopunskaListaLijekText.value,
            this.osnovnaListaMagPripravakDropdown.value,
            this.osnovnaListaMagPripravakText.value,
            this.dopunskaListaMagPripravakDropdown.value,
            this.dopunskaListaMagPripravakText.value,
            this.kolicinaDropdown.value,
            this.doziranjeFrekvencija.value + "x" + this.doziranjePeriod.value,
            this.dostatnost.value,
            this.hitnost.value ? "hitno": "nijehitno",
            this.ponovljivost.value ? "ponovljiv": "obican",
            this.brojPonavljanja.value,
            this.sifraSpecijalist.value,
            this.idPacijent,
            this.recept.datumRecept,
            this.recept.vrijemeRecept,
            this.recept.mkbSifraPrimarna,
            this.recept.oznaka,
            isDopunsko ? doplata : oznaka === 'DL' ? 30 + doplata : 30).pipe(
            concatMap(odgovor => {
                let dialogRef = this.dialog.open(DialogComponent, {data: {message: odgovor.message}});
                //Ako je server vratio uspješan odgovor
                if(odgovor.success === "true"){
                    return dialogRef.afterClosed().pipe(
                        tap(result => {
                            if(!result){
                                //Emitiraj event Subjectom prema komponenti pacijenata (lijevoj tablici)
                                this.receptService.messenger.next(true);
                                //Preusmjeri se nazad na tablicu pacijenata i listu recepata
                                this.router.navigate(['../'],{relativeTo: this.route});
                            }
                        })
                    );
                }
                //Ako je server vratio neuspješan odgovor
                else{
                    return dialogRef.afterClosed();
                }
            })
        );
    }

    //Metoda koja se poziva kada liječnik klikne "Unesi novi recept":
    onSubmit(){
        //Ako je forma neispravna
        if(!this.forma.valid){
            return;
        }
        //Pomoćno polje u koje spremam samo MKB šifre sek. dijagnoza
        let mkbPolje: string[] = [];
        //Prolazim kroz polje sekundarnih dijagnoza i uzimam samo MKB šifre
        for(const el of this.getControlsSekundarna()){
            if(el.value.mkbSifraSekundarna !== null){
                mkbPolje.push(el.value.mkbSifraSekundarna);
            }
        }
        //Tražim izabrani proizvod u dopunskoj listi lijekova (vraća element ako ga nađe)
        const lijekDL = this.lijekoviDopunskaListaOJP.find(lijek => lijek === this.izabraniProizvod);
        //Tražim ga u dopunskoj listi magistralnih pripravaka (vraća element ako ga nađe)
        const magPripravakDL = this.magPripravciDopunskaLista.find(magPripravak => magPripravak === this.izabraniProizvod);
        //Ako je komponenta u modu ažuriranja recepta
        if(this.editMode){
            //Definiram varijable
            let isDopunsko: string;
            let doplata: number;
            //Ako je liječnik izabrao lijek iz dopunske liste lijekova
            if(lijekDL){
                const combined = forkJoin([
                    this.receptService.getCijenaLijekDL(lijekDL),
                    this.sharedService.getDopunsko(+this.idPacijent)
                ]).pipe(
                    switchMap(cijenaDopunsko => {
                        //Dohvaćam doplatu sa servera
                        let doplataServer = cijenaDopunsko[0][0].doplataLijek;
                        //Mijenjam zarez za točku
                        doplataServer = doplataServer.replace(/,/g, '.');
                        //Pretvaram u float
                        doplata = parseFloat(doplataServer);
                        //Spremam informaciju je li pacijent ima dopunsko osiguranje
                        isDopunsko = cijenaDopunsko[1];
                        return this.azurirajRecept(mkbPolje, isDopunsko, doplata,'DL');
                    })
                ).subscribe();
            }
            //Ako je liječnik izabrao mag.pripravak iz dopunske liste
            else if(magPripravakDL){
                const combined = forkJoin([
                    this.receptService.getCijenaMagPripravakDL(magPripravakDL),
                    this.sharedService.getDopunsko(+this.idPacijent)
                ]).pipe(
                    switchMap(cijenaDopunsko => {
                        console.log(cijenaDopunsko);
                        //Dohvaćam doplatu sa servera
                        let doplataServer = cijenaDopunsko[0][0].doplataMagPripravak;
                        //Mijenjam zarez za točku
                        doplataServer = doplataServer.replace(/,/g, '.');
                        //Pretvaram u float
                        doplata = parseFloat(doplataServer);
                        //Spremam informaciju je li pacijent ima dopunsko osiguranje
                        isDopunsko = cijenaDopunsko[1];
                        return this.azurirajRecept(mkbPolje, isDopunsko, doplata,'DL');
                    })
                ).subscribe();
            }
            else{
                //Pretplaćivam se na informaciju ima li ovaj pacijent dopunsko osiguranje
                this.sharedService.getDopunsko(+this.idPacijent).pipe(
                    switchMap(dopunsko => {
                        //Spremam informaciju je li pacijent ima dopunsko osiguranje
                        isDopunsko = dopunsko;
                        //Ako ima dopunsko, pošalji 0kn, ako nema pošalji 30kn
                        return this.azurirajRecept(mkbPolje, isDopunsko, isDopunsko ? null : 30,'OL');
                    })
                ).subscribe();
            }
        }
        //Ako je komponenta u modu dodavanja recepta
        else{
            //Definiram MKB šifru tražene dijagnoze
            let poslanaMKBSifra="";
            //Tražim MKB šifru prethodne dijagnoze prije nego što je liječnik ažurirao dijagnoze
            for(const dijagnoza of this.dijagnoze){
                if(this.primarnaDijagnozaPovijestBolesti === dijagnoza.imeDijagnoza){
                    poslanaMKBSifra = dijagnoza.mkbSifra;
                }
            }

            //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na dodavanje novog recepta
            this.receptService.dodajRecept(
                this.mkbPrimarnaDijagnoza.value,
                mkbPolje,
                this.osnovnaListaLijekDropdown.value,
                this.osnovnaListaLijekText.value,
                this.dopunskaListaLijekDropdown.value,
                this.dopunskaListaLijekText.value,
                this.osnovnaListaMagPripravakDropdown.value,
                this.osnovnaListaMagPripravakText.value,
                this.dopunskaListaMagPripravakDropdown.value,
                this.dopunskaListaMagPripravakText.value,
                this.kolicinaDropdown.value,
                this.doziranjeFrekvencija.value + "x" + this.doziranjePeriod.value,
                this.dostatnost.value,
                this.hitnost.value ? "hitno": "nijehitno",
                this.ponovljivost.value ? "ponovljiv": "obican",
                this.brojPonavljanja.value,
                this.sifraSpecijalist.value,
                this.idPacijent,
                this.idLijecnik,
                poslanaMKBSifra,
                this.poslaniIDObrada,
                this.poslaniTipSlucaj,
                this.poslanoVrijeme).pipe(
                concatMap(odgovor => {
                    let dialogRef = this.dialog.open(DialogComponent, {data: {message: odgovor.message}});
                    //Ako je odgovor uspješan
                    if(odgovor.success === "true"){
                        //Pretplaćivam se na zatvaranje dialoga
                        return dialogRef.afterClosed().pipe(
                            concatMap(result => {
                                //Ako je korisnik kliknuo "Izađi" (jedina opcija)
                                if(!result){
                                    //Emitiraj event Subjectom prema komponenti pacijenata (lijevoj tablici)
                                    this.receptService.messenger.next(true);
                                    //Pretplaćivam se na informaciju je li pacijent aktivan ili nije
                                    return this.obradaService.getPatientProcessing('lijecnik').pipe(
                                        tap(podatci => {
                                            //Ako pacijent NIJE AKTIVAN
                                            if(podatci.success === "false"){
                                                //Filtriram polje ID-eva pacijenata
                                                this.sharedService.filterPacijentiIDs(this.idPacijent);
                                            }
                                        }),
                                        mergeMap(() => {
                                            //Kreiram JS objekt koji sadrži sve usluge koje se naplaćivaju
                                            const usluge = {
                                                idRecept: +odgovor.idRecept,
                                                idUputnica: null,
                                                idBMI: null,
                                                idUzorak: null
                                            };
                                            //Ako je izabran lijek iz dopunske liste
                                            if(lijekDL){
                                                return forkJoin([
                                                    this.receptService.getCijenaLijekDL(lijekDL),
                                                    this.sharedService.getDopunsko(+this.idPacijent)
                                                ]).pipe(
                                                    tap(cijenaDopunsko => {
                                                        console.log(cijenaDopunsko);
                                                        //Dohvaćam doplatu sa servera
                                                        let doplata = cijenaDopunsko[0][0].doplataLijek;
                                                        //Mijenjam zarez za točku
                                                        doplata = doplata.replace(/,/g, '.');
                                                        //Spremam novu cijenu + doplatu ako treba
                                                        this.sharedService.postaviNovuCijenu(
                                                            this.poslaniIDObrada,
                                                            //Ako pacijent IMA dopunsko, šaljem samo doplatu, a ako pacijent NEMA dopunsko, šaljem doplatu + cijenu proizvoda
                                                            cijenaDopunsko[1] ? parseFloat(doplata) : 30 + parseFloat(doplata),
                                                            'lijecnik',
                                                            usluge,
                                                            +this.idPacijent);
                                                    })
                                                );
                                            }
                                            //Ako je izabran mag. pripravak iz dopunske liste
                                            else if(magPripravakDL){
                                                return forkJoin([
                                                    this.receptService.getCijenaMagPripravakDL(magPripravakDL),
                                                    this.sharedService.getDopunsko(+this.idPacijent)
                                                ]).pipe(
                                                    tap(cijenaDopunsko => {
                                                        //Dohvaćam doplatu sa servera
                                                        let doplata = cijenaDopunsko[0][0].doplataMagPripravak;
                                                        //Mijenjam zarez za točku
                                                        doplata = doplata.replace(/,/g, '.');
                                                        //Spremam doplatu u tablicu "obrada_lijecnik"
                                                        this.sharedService.postaviNovuCijenu(
                                                            this.poslaniIDObrada,
                                                            cijenaDopunsko[1] ? parseFloat(doplata) : 30 + parseFloat(doplata),
                                                            'lijecnik',
                                                            usluge,
                                                            +this.idPacijent);
                                                    })
                                                );
                                            }
                                            //Ako je izabran proizvod iz osnovne liste, a pacijent NEMA dopunsko osiguranje
                                            else{
                                                //Pretplaćivam se na informaciju ima li ovaj pacijent dopunsko osiguranje
                                                return this.sharedService.getDopunsko(+this.idPacijent).pipe(
                                                    tap(dopunsko => {
                                                        //Naplaćujem dodani recept
                                                        this.sharedService.postaviNovuCijenu(
                                                            this.poslaniIDObrada,
                                                            dopunsko ? null : 30,
                                                            'lijecnik',
                                                            usluge,
                                                            +this.idPacijent);
                                                    })
                                                );
                                            }
                                        }),
                                        tap(() => {
                                            //Preusmjeri se nazad na tablicu pacijenata i listu recepata
                                            this.router.navigate(['../'],{relativeTo: this.route});
                                        })
                                    );
                                }
                                //Ako je kliknuo nešto drugo
                                else{
                                    return of(null);
                                }
                            })
                        );
                    }
                    //Ako je odgovor servera error
                    else{
                        return dialogRef.afterClosed();
                    }
                })
            ).subscribe();
        }
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
    //Metoda koja se poziva kada je liječnik mijenja vrijednosti checkboxa "Svjesno prekoračenje"
    onChangeSvjesnoPrekoracenje($event: any){
        //Ako je checkbox checked
        if($event.target.checked){
            //Dižem validator dnevno definirane doze
            this.doziranje.clearValidators();
            this.doziranje.updateValueAndValidity({emitEvent: false});
        }
        //Ako je checkbox "unchecked":
        else{
            //Dohvaćam dnevno definiranu dozu i dostatnost
            const pretplata = forkJoin([
                receptHandler.azuriranjeDostatnostiHandler(this.forma,this.receptService,
                    this.pretplateSubject,this.trajanjeTerapije,this.isPonovljiv),
                receptHandler.doziranjePresloDDD(this.forma,this.receptService)
            ]).pipe(
                tap((value) => {
                    //Ako server nije vratio null tj. ako lijek završava na mg ili g
                    if(value[1] !== null){
                        //Te ako je server vratio informaciju da je trenutno doziranje PREŠLO definiranu dnevnu dozu
                        if(value[1]["success"] === "false"){
                            //Prikaži redak svjesnog prekoračenja
                            this.isValidatorDDD = true;
                        }
                    }
                    //Ako je server vratio null ILI informaciju da doziranje NIJE PREŠLO dnevno definiranu dozu
                    if(value[1] === null || value[1]["success"] === "true"){
                        //Digni redak svjesnog prekoračenja
                        this.isValidatorDDD = false;
                    }
                })
            ).subscribe();
        }
    }

    //Metoda koja označava hoće li se prikazati dio forme za unos ponavljanja recepta
    onChangePonovljiv($event){
        //Ako je "ponovljiv" checked
        if($event.target.checked){
            //Označi da je recept PONOVLJIV
            this.isPonovljiv = true;
            //Postavljam broj ponavljanja na 1
            this.brojPonavljanja.patchValue("1",{emitEvent: false});
            //Postavljam riječima broj ponavljanja na "jedan put"
            this.rijecimaBrojPonavljanja.patchValue("jedan put", {emitEvent: false});
            //Pretplaćivam se na Observable ažuriranja trajanje terapije
            const pretplataTrajanjeTerapije = forkJoin([
                receptHandler.azuriranjeDostatnostiHandler(this.forma,this.receptService,
                    this.pretplateSubject,this.trajanjeTerapije,this.isPonovljiv),
                receptHandler.doziranjePresloDDD(this.forma,this.receptService)
            ]).pipe(
                tap((value) => {
                    console.log(value);
                    //Postavljam validatore na polje dostatnosti
                    this.dostatnost.setValidators([Validacija.provjeriDostatnost(this.isPonovljiv,this.brojPonavljanja.value),Validators.pattern("^[0-9]*$"),Validators.required]);
                    //Ažuriram validaciju
                    this.dostatnost.updateValueAndValidity({emitEvent: false});
                    //Ako server nije vratio null tj. ako lijek završava na mg ili g
                    if(value[1] !== null){
                        //Te ako je server vratio informaciju da je trenutno doziranje PREŠLO definiranu dnevnu dozu
                        if(value[1]["success"] === "false"){
                            //Ako već nije prikazano polje svjesnog prekoračenja
                            if(!this.isValidatorDDD){
                                //Prikaži redak svjesnog prekoračenja
                                this.isValidatorDDD = true;
                            }
                        }
                    }
                    //Ako je server vratio null ILI informaciju da doziranje NIJE PREŠLO dnevno definiranu dozu
                    if(value[1] === null || value[1]["success"] === "true"){
                        //Digni redak svjesnog prekoračenja
                        this.isValidatorDDD = false;
                    }
                })
            ).subscribe();
        }
        //Ako "ponovljiv" NIJE CHECKED
        else{
            //Označi da recept NIJE PONOVLJIV
            this.isPonovljiv = false;
            //Postavljam broj ponavljanja na 1
            this.brojPonavljanja.patchValue("1",{emitEvent: false});
            //Postavljam riječima broj ponavljanja na "jedan put"
            this.rijecimaBrojPonavljanja.patchValue("jedan put", {emitEvent: false});
            //Pretplaćivam se na Observable ažuriranja trajanje terapije
            const pretplataTrajanjeTerapije = forkJoin([
                receptHandler.azuriranjeDostatnostiHandler(this.forma,this.receptService,
                    this.pretplateSubject,this.trajanjeTerapije,this.isPonovljiv),
                receptHandler.doziranjePresloDDD(this.forma,this.receptService)
            ]).pipe(
                tap((value) => {
                    //Postavljam validatore na polje dostatnosti
                    this.dostatnost.setValidators([Validacija.provjeriDostatnost(this.isPonovljiv,this.brojPonavljanja.value),Validators.pattern("^[0-9]*$"),Validators.required]);
                    //Ažuriram validaciju
                    this.dostatnost.updateValueAndValidity({emitEvent: false});
                    //Ako server nije vratio null tj. ako lijek završava na mg ili g
                    if(value[1] !== null){
                        //Te ako je server vratio informaciju da je trenutno doziranje PREŠLO definiranu dnevnu dozu
                        if(value[1]["success"] === "false"){
                            //Prikaži redak svjesnog prekoračenja
                            this.isValidatorDDD = true;
                        }
                    }
                    //Ako je server vratio null ILI informaciju da doziranje NIJE PREŠLO dnevno definiranu dozu
                    if(value[1] === null || value[1]["success"] === "true"){
                        //Digni redak svjesnog prekoračenja
                        this.isValidatorDDD = false;
                    }
                })
            ).subscribe();
        }
    }

    //Ova metoda se poziva kada korisnik klikne "Izađi" ili negdje izvan prozora
    onClose(){
        this.router.navigate(['../'],{relativeTo: this.route});
    }

    //Ova metoda se poziva kada se promijeni naziv sekundarne dijagnoze
    onChangeNazivSekundarna(nazivSekundarna: string, index: number){
        //Pozivam metodu koja će automatski unijeti MKB šifru sekundarne dijagnoze
        SharedHandler.nazivToMKBSekundarna(nazivSekundarna,this.dijagnoze,this.forma,index);
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
        },{validators: [SharedValidations.requiredMKBSifraSekundarna(),SharedValidations.provjeriMKBSifraSekundarna(this.mkbSifre)]});
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
            SharedHandler.MKBtoNazivSekundarna(mkbSifra,this.dijagnoze,this.forma,index);
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
        //Restartiram Subject
        this.receptService.messenger.next(false);
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
    get tip(): FormControl{
        return this.forma.get('tip') as FormControl;
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
    get dddLijek(): FormControl{
        return this.forma.get('doziranje.dddLijek') as FormControl;
    }
    get svjesnoPrekoracenje(): FormControl{
        return this.forma.get('svjesnoPrekoracenje') as FormControl;
    }
    get dostatnost(): FormControl{
        return this.forma.get('trajanje.dostatnost') as FormControl;
    }
    get vrijediDo(): FormControl{
        return this.forma.get('trajanje.vrijediDo') as FormControl;
    }
    get specijalist(): FormGroup{
        return this.forma.get('specijalist') as FormGroup;
    }
    get sifraSpecijalist(): FormControl{
        return this.forma.get('specijalist.sifraSpecijalist') as FormControl;
    }
    get tipSpecijalist(): FormControl{
        return this.forma.get('specijalist.tipSpecijalist') as FormControl;
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
