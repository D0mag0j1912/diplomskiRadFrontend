import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
import { DrzavaOsiguranja } from 'src/app/shared/modeli/drzavaOsiguranja.model';
import { HeaderService } from 'src/app/shared/header/header.service';
import { KategorijaOsiguranja } from 'src/app/shared/modeli/kategorijaOsiguranja.model';
import { Obrada } from 'src/app/shared/modeli/obrada.model';
import { OtvoreniSlucajService } from 'src/app/med-sestra/otvoreni-slucaj/otvoreni-slucaj.service';
import { PodrucniUred } from 'src/app/shared/modeli/podrucniUred.model';
import { MedSestraService } from '../med-sestra.service';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
import { concatMap, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';
import { PreglediService } from 'src/app/shared/obrada/pregledi/pregledi.service';
import * as SharedHandler from '../../shared/shared-handler';
import * as SharedValidations from '../../shared/shared-validations';
import * as OpciPodatciValidations from './opci-podatci-validations';
import * as OpciPodatciHandler from './opci-podatci-handler';
import { ZdravstveniPodatci } from 'src/app/shared/modeli/zdravstveniPodatci.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { OtvoreniSlucaj } from '../otvoreni-slucaj/otvoreniSlucaj.model';

@Component({
  selector: 'app-opci-podatci-pregleda',
  templateUrl: './opci-podatci-pregleda.component.html',
  styleUrls: ['./opci-podatci-pregleda.component.css']
})
export class OpciPodatciPregledaComponent implements OnInit,OnDestroy{

    //Oznaka je li forma submit
    isSubmitted: boolean = false;
    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li gumb za poništavanje povezanog slučaja aktivan
    ponistiPovezaniSlucaj: boolean = false;
    //Oznaka je su li otvoreni slučajevi
    otvoren: boolean = false;
    //Oznaka postoji li aktivan pacijent u obradi trenutno
    isAktivan: boolean = false;
    //Spremam ID pacijenta koji je trenutno aktivan
    idPacijent: number;
    //Spremam ID aktivne medicinske sestre
    idMedSestra: number;
    //Spremam ID obrade
    idObrada: number;
    //Kreiram formu
    forma: FormGroup;
    //Spremam područne urede
    podrucniUredi: PodrucniUred[] = [];
    //Spremam nazive područnih ureda zbog validacije
    naziviPodrucnihUreda: string[] = [];
    //Spremam kategorije osiguranja
    katOsiguranja: KategorijaOsiguranja[] = [];
    //Spremam opise osiguranika zbog validacije
    opisiOsiguranika: string[] = [];
    //Spremam sve dijagnoze
    dijagnoze: Dijagnoza[] = [];
    //Spremam sve države osiguranja
    drzave: DrzavaOsiguranja[] = [];
    //Spremam podatke trenutno aktivnog pacijenta
    trenutnoAktivniPacijent: Obrada;
    //Spremam osobne podatke pacijenta
    pacijent: Pacijent;
    //Spremam trenutno izabranu sekundarnu dijagnozu zbog validacije duplikata
    sekDijagnoza: string;
    //Spremam dijagnozu koja je ista kod primarne i kod sekundarne dijagnoze
    dijagnoza: string;
    //Spremam dijagnoze otvorenog slučaja
    primarnaDijagnozaOtvoreniSlucaj: string;
    sekundarnaDijagnozaOtvoreniSlucaj: string[] = [];
    //Spremam zdravstvene podatke pacijenta da ih mogu INICIJALNO postaviti u formu
    zdravstveniPodatci: ZdravstveniPodatci[] = [];
    //Spremam sve MKB šifre
    mkbSifre: string[] = [];
    //Spremam ID povijesti bolesti pregleda kojega povezujem
    prosliPregled: string = "";
    //Spremam boju prošlog pregleda
    proslaBoja: string = "";
    //Spremam oznaku je li pacijent ima inicijalno dopunsko osiguranje
    isDopunskoInicijalno: boolean = false;
    //Spremam sve podatke otvorenog slučaja osim sek. dijagnoza
    otvoreniSlucaji: OtvoreniSlucaj[] = [];
    //Spremam sve sek. dijagnoze otvorenog slučaja
    sekDijagnoze: OtvoreniSlucaj[] = [];

    constructor(
        //Dohvaćam route da mogu dohvatiti podatke koje je Resolver poslao
        private route: ActivatedRoute,
        //Dohvaćam servis medicinske sestre
        private medSestraService: MedSestraService,
        //Dohvaćam header servis
        private headerService: HeaderService,
        //Dohvaćam servis otvorenog slučaja
        private otvoreniSlucajService: OtvoreniSlucajService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis prethodnih pregleda
        private preglediService: PreglediService,
        //Dohvaćam servis dialoga
        private dialog: MatDialog
    ) {}

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Pretplaćujem se na route da mogu dohvatiti podatke od njega
        this.route.data.pipe(
            tap((response: {podatci: any, pacijent: Obrada | any}) => {
                //Kreiram praznu varijablu u kojoj spremam objekte tipa "PodrucniUred"
                let objektPodrucniUred;
                //Prolazim kroz JS objekte područnih ureda
                for(const ured of response.podatci.uredi){
                    //Za svaki odgovor sa servera, kreiraj novi objekt tipa "PodrucniUred"
                    objektPodrucniUred = new PodrucniUred(ured);
                    //Dodaj taj objekt u polje
                    this.podrucniUredi.push(objektPodrucniUred);
                }
                //Inicijaliziram varijablu u koju spremam objekte tipa "KategorijaOsiguranja"
                let objektKatOsiguranja;
                //Prolazim poljem dijagnoza sa servera
                for(const kat of response.podatci.kategorijeOsiguranja){
                    objektKatOsiguranja = new KategorijaOsiguranja(kat);
                    this.katOsiguranja.push(objektKatOsiguranja);
                }
                //Podatke iz Resolver dohvaćam i spremam u svoje polje kategorija osiguranja
                this.katOsiguranja = response.podatci["kategorijeOsiguranja"];
                //Inicijaliziram varijablu u koju spremam objekte tipa "Dijagnoza"
                let objektDijagnoza;
                //Prolazim poljem dijagnoza sa servera
                for(const d of response.podatci["dijagnoze"]){
                    objektDijagnoza = new Dijagnoza(d);
                    this.dijagnoze.push(objektDijagnoza);
                    this.mkbSifre.push(d.mkbSifra);
                }
                let objektDrzava;
                //Prolazim kroz odgovor servera
                for(const drzava of response.podatci.drzave){
                    objektDrzava = new DrzavaOsiguranja(drzava);
                    this.drzave.push(objektDrzava);
                }
                //Ako je Resolver vratio aktivnog pacijenta
                if(response.pacijent.obrada.success !== "false"){
                    //Označavam da je pacijent aktivan u obradi
                    this.isAktivan = true;
                    //Spremam podatke obrade trenutno aktivnog pacijenta
                    this.trenutnoAktivniPacijent = new Obrada(response.pacijent.obrada[0]);
                    //Spremam osobne podatke trenutno aktivnog pacijenta
                    this.pacijent = new Pacijent(response.pacijent.obrada[0]);
                    //Spremam ID pacijenta
                    this.idPacijent = this.trenutnoAktivniPacijent.idPacijent;
                    //Spremam ID obrade
                    this.idObrada = this.trenutnoAktivniPacijent.idObrada;
                    //Definiram objekt zdr. podataka
                    let objektZdrPodatci;
                    //Prolazim kroz odgovor servera
                    for(const podatci of response.pacijent.zdravstveniPodatci){
                        objektZdrPodatci = new ZdravstveniPodatci(podatci);
                        this.zdravstveniPodatci.push(objektZdrPodatci);
                    }
                }
                //Kreiram formu
                this.forma = new FormGroup({
                  'nacinPlacanja': new FormControl(null, this.isAktivan ? [Validators.required] : []),
                  'podrucniUred': new FormControl(null),
                  'sifUred': new FormControl(null),
                  'ozljeda': new FormControl(null),
                  'sifUredOzljeda': new FormControl(null),
                  'poduzece': new FormControl(null),
                  'kategorijaOsiguranja': new FormControl(null, this.isAktivan ?
                        [Validators.required,
                        OpciPodatciValidations.isValidKategorijaOsiguranja(this.katOsiguranja)] : []),
                  'oznakaOsiguranika': new FormControl(null),
                  'drzavaOsiguranja': new FormControl(null, this.isAktivan ?
                        [Validators.required,
                        OpciPodatciValidations.isValidDrzavaOsiguranja(this.drzave)] : []),
                  //Ako je pacijent aktivan u obradi, POSTAVLJAM MU VALIDATOR NA MBO, inače NE POSTAVLJAM
                  'mbrPacijent': new FormControl(null,
                      this.isAktivan ?
                      [Validators.required,
                      Validators.pattern("^\\d{9}$"),
                      OpciPodatciValidations.isValidMBO(this.pacijent)] : []),
                  'brIskDopunsko': new FormControl(null),
                  'primarnaDijagnoza': new FormControl(null),
                  'mkbPrimarnaDijagnoza': new FormControl(null),
                  'sekundarnaDijagnoza': new FormArray([
                      new FormGroup({
                        'nazivSekundarna': new FormControl(null),
                        'mkbSifraSekundarna': new FormControl(null)
                      },{validators: this.isAktivan ?
                        [SharedValidations.requiredMKBSifraSekundarna(),
                        SharedValidations.provjeriMKBSifraSekundarna(this.mkbSifre)] : []})
                  ],{validators: this.isAktivan ? this.isValidSekundarnaDijagnoza.bind(this) : null}),
                  'tipSlucaj': new FormGroup({
                    'noviSlucaj': new FormControl(null),
                    'povezanSlucaj': new FormControl(null)
                  }, {validators: this.isAktivan ? OpciPodatciValidations.atLeastOneRequiredTipSlucaj() : null}),
                }, {validators: this.isAktivan ? this.isValidDijagnoze.bind(this) : null});
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();

        this.forma.get('sekundarnaDijagnoza').disable({emitEvent: false});
        //AKO JE PACIJENT AKTIVAN
        if(this.isAktivan){
            //Inicijalno onemogućavam unos nekih polja u formi
            this.forma.get('sifUred').disable({emitEvent: false});
            this.forma.get('sifUredOzljeda').disable({emitEvent: false});
            this.forma.get('podrucniUred').disable({emitEvent: false});
            this.forma.get('ozljeda').disable({emitEvent: false});
            this.forma.get('poduzece').disable({emitEvent: false});
            this.forma.get('oznakaOsiguranika').disable({emitEvent: false});

            //Prolazim poljem zdravstvenih podataka
            for(let podatci of this.zdravstveniPodatci){
                //Inicijalno popunjam polja zdravstvenih podataka trenutno aktivnog pacijenta
                this.kategorijaOsiguranja.patchValue(podatci.opisOsiguranika,{emitEvent: false});
                //Pozivam metodu koja će popuniti oznaku osiguranika
                OpciPodatciHandler.opisOsiguranikaToOznaka(podatci.opisOsiguranika, this.katOsiguranja, this.forma);
                this.drzavaOsiguranja.patchValue(podatci.drzavaOsiguranja,{emitEvent: false});
                this.mbrPacijent.patchValue(podatci.mboPacijent,{emitEvent: false});
                //Ako pacijent ima broj iskaznice dopunskog
                if(podatci.brojIskazniceDopunsko){
                    //Označavam da pacijent ima dopunsko osiguranje
                    this.isDopunskoInicijalno = true;
                    //Postavljam validatore na broj iskaznice dopunskog
                    this.brIskDopunsko.setValidators(
                        [Validators.required,
                        Validators.pattern("^\\d{8}$"),
                        OpciPodatciValidations.isValidDopunsko(this.pacijent)]);
                    this.brIskDopunsko.patchValue(podatci.brojIskazniceDopunsko,{emitEvent: false});
                    this.brIskDopunsko.updateValueAndValidity({emitEvent: false});
                }
            }

            //Kreiram jedan Observable koji će emitirati jednu vrijednost kada bilo koji form control promjeni svoju vrijednost
            const combined = merge(
                this.headerService.getIDMedSestra().pipe(
                    tap((idMedSestra) => {
                        //Spremam ID med.sestre
                        this.idMedSestra = +idMedSestra[0].idMedSestra;
                    }),
                    takeUntil(this.pretplateSubject)
                ),
                this.obradaService.obsZavrsenPregled.pipe(
                    tap(() => {
                        //Poništavam povezani slučaj
                        this.ponistiPovezaniSlucajHandler();
                        //Postavljam da pacijent više nije aktivan
                        this.isAktivan = false;
                        //Resetiram formu osnovnih podataka pacijenta
                        this.forma.reset();
                        //Uklanjam validatore sa forme
                        this.forma.clearValidators();
                        this.forma.updateValueAndValidity({emitEvent: false});
                        //Za svaki form control u formi
                        for(let field in this.forma.controls){
                            //Ukloni mu validator i ažuriraj stanje forme
                            this.forma.get(field).clearValidators();
                            this.forma.get(field).updateValueAndValidity({emitEvent: false});
                        }
                        //Uklanjam validatore iz sekundarnih dijagnoza
                        for(const group of this.getControlsSekundarna()){
                            //Digni validatore
                            group.clearValidators();
                            group.updateValueAndValidity({emitEvent: false});
                        }
                    }),
                    takeUntil(this.pretplateSubject)
                ),
                this.brIskDopunsko.valueChanges.pipe(
                    tap(() => {
                        //Ako je pacijent aktivan
                        if(this.isAktivan){
                            //Ako nije inicijalno upisano dopunsko
                            if(!this.isDopunskoInicijalno){
                                //Ako je upisana vrijednost u polje dopunskog osiguranja
                                if(this.brIskDopunsko.value){
                                    //Postavljam validatore na broj iskaznice dopunskog
                                    this.brIskDopunsko.setValidators([Validators.required,Validators.pattern("^\\d{8}$")]);
                                    this.brIskDopunsko.updateValueAndValidity({emitEvent: false});
                                }
                                //Ako nije upisana vrijednost u polje dopunskog osiguranja
                                else{
                                    this.brIskDopunsko.clearValidators();
                                    this.brIskDopunsko.updateValueAndValidity({emitEvent: false});
                                }
                            }
                        }
                    }),
                    takeUntil(this.pretplateSubject)
                ),
                this.nacinPlacanja.valueChanges.pipe(
                    tap(
                        (value) => {
                            //Ako je pacijent aktivan
                            if(this.isAktivan){
                                //Pozivam metodu koja pokreće validacije za načine plaćanja
                                this.validacijaNacinPlacanja(value);
                            }
                        }
                    ),
                    takeUntil(this.pretplateSubject)
                ),
                this.kategorijaOsiguranja.valueChanges.pipe(
                    tap(
                        (value) => {
                            //Ako je pacijent aktivan
                            if(this.isAktivan){
                                //Ako je form control ispravan
                                if(this.kategorijaOsiguranja.valid){
                                    //Pozivam metodu
                                    OpciPodatciHandler.opisOsiguranikaToOznaka(value, this.katOsiguranja, this.forma);
                                }
                                //Ako nije ispravan
                                else{
                                    //Treba biti prazno
                                    this.oznakaOsiguranika.patchValue(null,{emitEvent: false});
                                }
                            }
                        }
                    ),
                    takeUntil(this.pretplateSubject)
                ),
                this.podrucniUred.valueChanges.pipe(
                    tap(
                        (value) => {
                            //Ako je pacijent aktivan
                            if(this.isAktivan){
                                //Ako je form control ispravan
                                if(this.podrucniUred.valid){
                                    //Pozivam metodu
                                    OpciPodatciHandler.nazivSluzbeToSif(value, this.podrucniUredi, this.forma);
                                }
                                //Ako nije ispravan
                                else{
                                    //Treba biti prazno
                                    this.sifUred.patchValue(null,{emitEvent: false});
                                }
                            }
                        }
                    ),
                    takeUntil(this.pretplateSubject)
                ),
                this.ozljeda.valueChanges.pipe(
                    tap(
                        (value) => {
                            //Ako je pacijent aktivan
                            if(this.isAktivan){
                                //Ako je form control ispravan
                                if(this.ozljeda.valid){
                                  //Pozivam metodu
                                  OpciPodatciHandler.nazivSluzbeToSifOzljeda(value, this.podrucniUredi, this.forma);
                                }
                                //Ako nije ispravan
                                else{
                                    //Treba biti prazno
                                    this.sifUredOzljeda.patchValue(null,{emitEvent: false});
                                }
                            }
                        }
                    ),
                    takeUntil(this.pretplateSubject)
                ),
                //Slušam promjene u polju unosa primarne dijagnoze
                this.primarnaDijagnoza.valueChanges.pipe(
                    tap(value => {
                        //Ako je pacijent aktivan
                        if(this.isAktivan){
                            //Ako je upisana vrijednost naziva primarne dijagnoze
                            if(this.primarnaDijagnoza.value){
                                this.primarnaDijagnoza.setValidators([SharedValidations.provjeriNazivDijagnoza(this.dijagnoze)]);
                                this.primarnaDijagnoza.updateValueAndValidity({emitEvent: false});
                            }
                            //Ako nema naziva primarne dijagnoze
                            else if(!this.primarnaDijagnoza.value){
                                this.primarnaDijagnoza.clearValidators();
                                this.primarnaDijagnoza.updateValueAndValidity({emitEvent: false});
                            }
                            //Na početku postavljam da nisam pronašao naziv primarne dijagnoze
                            let pronasao = false;
                            //Prolazim kroz sve nazive primarnih dijagnoza
                            for(const dijagnoza of this.dijagnoze){
                                //Ako su jednaki
                                if(value === dijagnoza.imeDijagnoza){
                                    //Označavam da se poklapaju nazivi
                                    pronasao = true;
                                }
                            }
                            //Ako je unos primarne dijagnoze ispravan
                            if(pronasao){
                                if(this.primarnaDijagnoza.valid){
                                    //Pozivam metodu da popuni polje MKB šifre te dijagnoze
                                    SharedHandler.nazivToMKB(value,this.dijagnoze,this.forma);
                                    //Omogućavam unos sekundarnih dijagnoza
                                    this.sekundarnaDijagnoza.enable({emitEvent: false});
                                }
                            }
                            //Ako unos primarne dijagnoze nije ispravan ili je null
                            if(!pronasao || !this.primarnaDijagnoza.value){
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
                        }
                  }),
                  takeUntil(this.pretplateSubject)
                ),
                //Slušam promjene u polju unosa MKB šifre primarne dijagnoze
                this.mkbPrimarnaDijagnoza.valueChanges.pipe(
                    tap(value => {
                        //Ako je pacijent aktivan
                        if(this.isAktivan){
                            //Ako MKB šifra ima vrijednost
                            if(this.mkbPrimarnaDijagnoza.value){
                                //Postavi validatore
                                this.mkbPrimarnaDijagnoza.setValidators([SharedValidations.provjeriMKB(this.mkbSifre)]);
                                this.mkbPrimarnaDijagnoza.updateValueAndValidity({emitEvent: false});
                            }
                            //Ako MKB šifra nema vrijednost
                            else if(!this.mkbPrimarnaDijagnoza.value){
                                //Digni validatore
                                this.mkbPrimarnaDijagnoza.clearValidators();
                                this.mkbPrimarnaDijagnoza.updateValueAndValidity({emitEvent: false});
                                this.primarnaDijagnoza.clearValidators();
                                this.primarnaDijagnoza.updateValueAndValidity({emitEvent: false});
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
                        }
                    }),
                    takeUntil(this.pretplateSubject)
                )
            ).subscribe();
        }

    }
    //Ova metoda se poziva kada se med.sestra krene upisivati vrijednosti u polja MKB šifri sek. dijagnoze
    onChangeMKB(mkbSifra: string,index:number){
        //Ako je pacijent aktivan
        if(this.isAktivan){
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
    }

    //Ova metoda se poziva kada se promijeni naziv sekundarne dijagnoze
    onChangeNazivSekundarna(nazivSekundarna: string, index: number){
        //Ako je pacijent aktivan
        if(this.isAktivan){
            //Pozivam metodu koja će automatski unijeti MKB šifru sekundarne dijagnoze
            SharedHandler.nazivToMKBSekundarna(nazivSekundarna,this.dijagnoze,this.forma,index);
        }
    }

    //Metoda koja dinamički postavlja i gasi validatore u formi
    validacijaNacinPlacanja(value: string){
        //Ako je pacijent aktivan u obradi
        if(this.isAktivan){
            //Ako je trenutna vrijednost načina plaćanja "hzzo"
            if(value === 'hzzo'){
                //Resetiram šifre područnih ureda ozljede
                this.sifUredOzljeda.reset();
                //Omogućavam unos područnog ureda HZZO
                this.podrucniUred.enable({emitEvent: false});
                //Područni ured mora biti unesen
                this.podrucniUred.setValidators([Validators.required, OpciPodatciValidations.isValidPodrucniUred(this.podrucniUredi)]);
                //Resetiram polja područnog ureda ozljede na radu i poduzeća
                this.ozljeda.reset();
                this.poduzece.reset();
                //Odbaci validatore
                this.ozljeda.clearValidators();
                //Odbaci validatore
                this.poduzece.clearValidators();
                //Onemogućavam unos područnog ureda ozljede na radu te naziva poduzeća
                this.ozljeda.disable({emitEvent: false});
                this.poduzece.disable({emitEvent: false});
            }
            //Ako je trenutna vrijednost načina plaćanja "ozljeda"
            else if(value === 'ozljeda'){
                //Resetiram šifre područnih ureda
                this.sifUred.reset();
                //Omogućavam unos područnog ureda ozljede na radu
                this.ozljeda.enable({emitEvent: false});
                //Područni ured ozljede mora biti unesen
                this.ozljeda.setValidators([Validators.required, OpciPodatciValidations.isValidPodrucniUred(this.podrucniUredi)]);
                //Resetiram polja područnog ureda HZZO-a i poduzeća
                this.podrucniUred.reset();
                this.poduzece.reset();
                //Odbaci validatore
                this.podrucniUred.clearValidators();
                //Odbaci validatore
                this.poduzece.clearValidators();
                //Onemogućavam unos područnog ureda i poduzeća
                this.podrucniUred.disable({emitEvent: false});
                this.poduzece.disable({emitEvent: false});
            }
            else if(value === 'poduzece'){
                //Odbaci validatore
                this.podrucniUred.clearValidators();
                //Odbaci validatore
                this.ozljeda.clearValidators();
                //Omogućavam unos poduzeća
                this.poduzece.enable({emitEvent: false});
                //Naziv poduzeća mora biti unesen
                this.poduzece.setValidators(Validators.required);
                //Restiram polja područnih ureda
                this.podrucniUred.reset();
                this.ozljeda.reset();
                //Resetiram šifre područnih ureda
                this.sifUred.reset();
                this.sifUredOzljeda.reset();
                //Disablam područne urede
                this.podrucniUred.disable({emitEvent: false});
                this.ozljeda.disable({emitEvent: false});
            }
            else if(value === 'osobno'){
                //Odbaci validatore
                this.podrucniUred.clearValidators();
                //Odbaci validatore
                this.ozljeda.clearValidators();
                //Odbaci validatore
                this.poduzece.clearValidators();
                //Resetiram šifre područnih ureda
                this.sifUred.reset();
                this.sifUredOzljeda.reset();
                //Resetiram polja područnim uredima i poduzeću
                this.podrucniUred.reset();
                this.ozljeda.reset();
                this.poduzece.reset();
                //Onemogućavam unos područnim uredima i poduzeću
                this.podrucniUred.disable({emitEvent: false});
                this.ozljeda.disable({emitEvent: false});
                this.poduzece.disable({emitEvent: false});
            }
            //Omogućava promjene na poljima tj. stavljanje i dizanje validatora
            this.poduzece.updateValueAndValidity({emitEvent: false});
            this.podrucniUred.updateValueAndValidity({emitEvent: false});
            this.sifUred.updateValueAndValidity({emitEvent: false});
            this.ozljeda.updateValueAndValidity({emitEvent: false});
            this.sifUredOzljeda.updateValueAndValidity({emitEvent: false});
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
    isValidDijagnoze(group: FormGroup): {[key: string]: boolean} {
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

    //Kada korisnik klikne "Potvrdi opće podatke"
    onSubmit(){
        //Označavam da je forma submittana
        this.isSubmitted = true;
        //Ako forma nije ispravna
        if(!this.forma.valid){
            //Prikazivam prozor sa odgovarajućom porukom
            this.dialog.open(DialogComponent, {data: {message: 'Morate unijeti sva obvezna polja!'}});
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
        //Ako je pacijent aktivan
        if(this.isAktivan){
            //Ako je slučaj novi
            if(this.noviSlucaj.value === true){
                //Postavljam ID povijesti bolesti pregleda kojega povezujem na null
                this.prosliPregled = "";
                //Restartam boju prethodnog pregleda kada je novi slučaj
                this.proslaBoja = "";
                //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na zahtjev dodavanja općih podataka pregleda
                this.medSestraService.sendVisitData(
                    this.idMedSestra,
                    this.idPacijent,
                    this.nacinPlacanja.value,
                    this.podrucniUred.value,
                    this.ozljeda.value,
                    this.poduzece.value,
                    this.oznakaOsiguranika.value,
                    this.drzavaOsiguranja.value,
                    this.mbrPacijent.value,
                    this.brIskDopunsko.value,
                    this.mkbPrimarnaDijagnoza.value,
                    mkbPolje,
                    this.noviSlucaj.value === true ? 'noviSlucaj' : 'povezanSlucaj',
                    this.idObrada,
                    this.prosliPregled,
                    this.proslaBoja).pipe(
                        //Dohvaćam odgovor servera
                        concatMap((response) => {
                            //Ako je server vratio uspješan odgovor (spremio opće podatke)
                            if(response.success !== "false"){
                                let dialogRef = this.dialog.open(DialogComponent, {data: {message: response.message}});
                                return dialogRef.afterClosed().pipe(
                                    tap(result => {
                                        //Ako je korisnik kliknuo "Izađi" (jedina opcija)
                                        if(!result){
                                            //Kreiram objekt u kojemu će se nalaziti podatci prošlog pregleda koje stavljam u LocalStorage
                                            const podatciProslogPregleda = {
                                                idObrada: this.idObrada,
                                                mkbPrimarnaDijagnoza: this.mkbPrimarnaDijagnoza.value
                                            };
                                            //U Local Storage postavljam trenutno unesenu podatke da je kasnije mogu dohvatiti kada povežem više puta zaredom
                                            localStorage.setItem("podatciProslogPregleda",JSON.stringify(podatciProslogPregleda));
                                            //Emitiraj vrijednost prema komponenti "SekundarniHeaderComponent" da je header dodan
                                            this.preglediService.pregledDodan.next({isDodan: true, tipKorisnik: "sestra"});
                                            //Resetiram formu
                                            this.ponistiPovezaniSlucajHandler();
                                        }
                                    })
                                );
                            }
                            //Ako je server vratio error
                            else{
                                this.dialog.open(DialogComponent, {data: {message: response.message}});
                                return of(null);
                            }
                        })
                ).subscribe();
            }
            //Ako je slučaj povezan
            else if(this.povezanSlucaj.value === true){
                //Dohvaćam podatke prošlog pregleda
                const podatci: {
                   idObrada: number,
                   mkbPrimarnaDijagnoza: string
                } = JSON.parse(localStorage.getItem("podatciProslogPregleda"));
                let proslaMKBSifra = podatci.mkbPrimarnaDijagnoza;
                let proslaIDObrada = +podatci.idObrada;
                this.medSestraService.getIDPregled(this.mbrPacijent.value,proslaIDObrada,proslaMKBSifra).pipe(
                    switchMap((podatci) => {
                        //Spremam podatke prošlog pregleda
                        this.proslaBoja = podatci[0].bojaPregled;
                        this.prosliPregled = podatci[0].idPregled;
                        return this.medSestraService.sendVisitData(
                        this.idMedSestra,
                        this.idPacijent,
                        this.nacinPlacanja.value,
                        this.podrucniUred.value,
                        this.ozljeda.value,
                        this.poduzece.value,
                        this.oznakaOsiguranika.value,
                        this.drzavaOsiguranja.value,
                        this.mbrPacijent.value,
                        this.brIskDopunsko.value,
                        this.mkbPrimarnaDijagnoza.value,
                        mkbPolje,
                        this.noviSlucaj.value === true ? 'noviSlucaj' : 'povezanSlucaj',
                        this.idObrada,
                        this.prosliPregled,
                        this.proslaBoja).pipe(
                            //Dohvaćam odgovor servera
                            concatMap((response) => {
                                //Ako je server vratio uspješan odgovor (spremio opće podatke)
                                if(response.success !== "false"){
                                    let dialogRef = this.dialog.open(DialogComponent, {data: {message: response.message}});
                                    return dialogRef.afterClosed().pipe(
                                        tap(result => {
                                            //Ako je korisnik kliknuo "Izađi"
                                            if(!result){
                                                //Kreiram objekt u kojemu će se nalaziti podatci prošlog pregleda koje stavljam u LocalStorage
                                                const podatciProslogPregleda = {
                                                    idObrada: this.idObrada,
                                                    mkbPrimarnaDijagnoza: this.mkbPrimarnaDijagnoza.value
                                                };
                                                //U Local Storage postavljam trenutno unesenu podatke da je kasnije mogu dohvatiti kada povežem više puta zaredom
                                                localStorage.setItem("podatciProslogPregleda",JSON.stringify(podatciProslogPregleda));
                                                //Emitiraj vrijednost prema komponenti "SekundarniHeaderComponent" da je header dodan
                                                this.preglediService.pregledDodan.next({isDodan: true, tipKorisnik: "sestra"});
                                                //Resetiram formu
                                                this.ponistiPovezaniSlucajHandler();
                                            }
                                        })
                                    );
                                }
                                //Ako je server vratio error
                                else{
                                    this.dialog.open(DialogComponent, {data: {message: response.message}});
                                    return of(null);
                                }
                            })
                        );
                    })
                ).subscribe();
            }
        }
        else{
            //Otvaram dialog
            this.dialog.open(DialogComponent, {data: {message: 'Nema aktivnog pacijenta u obradi!'}});
        }
    }

    //Metoda koja se aktivira kada komponenta primi informaciju da se EVENT AKTIVIRAO ($event je šifra primarne dijagnoze pojedinog retka otvorenog slučaja)
    onPoveziOtvoreniSlucaj($event){
        //Ako je pacijent aktivan
        if(this.isAktivan){
            //Pretplaćujem se na Observable u kojemu se nalaze NAZIV PRIMARNE DIJAGNOZE i NAZIVI NJEZINIH SEKUNDARNIH DIJAGNOZA
            this.otvoreniSlucajService.getDijagnozePovezanSlucaj($event,this.idPacijent).pipe(
                //Dohvaćam podatke
                tap((podatci) => {
                    //Spremam podatke kada povežem slučaj (treba će kada prelazim iz korisnika ovamo da mi ne ostanu njegovi podatci)
                    this.prosliPregled = podatci[0].idPregled;
                    this.proslaBoja = podatci[0].bojaPregled;
                    //Kreiram objekt u kojemu će se nalaziti podatci prošlog pregleda koje stavljam u LocalStorage
                    const podatciProslogPregleda = {
                        idObrada: podatci[0].idObradaMedSestra,
                        mkbPrimarnaDijagnoza: podatci[0].mkbSifraPrimarna
                    };
                    //U Local Storage postavljam trenutno unesenu podatke da je kasnije mogu dohvatiti kada povežem više puta zaredom
                    localStorage.setItem("podatciProslogPregleda",JSON.stringify(podatciProslogPregleda));
                    //Resetiram formu sekundarnih dijagnoza
                    this.sekundarnaDijagnoza.clear();
                    //Resetiram svoje polje sekundarnih dijagnoza
                    this.sekundarnaDijagnozaOtvoreniSlucaj = [];
                    //Dodaj jedan form control da inicijalno bude 1
                    this.onAddDiagnosis();
                    //Prolazim poljem odgovora servera
                    for(let dijagnoza of podatci){
                        //Spremam naziv primarne dijagnoze otvorenog slučaja
                        this.primarnaDijagnozaOtvoreniSlucaj = dijagnoza.NazivPrimarna;
                        //U polje sekundarnih dijagnoza spremam sve sekundarne dijagnoze otvorenog slučaja
                        this.sekundarnaDijagnozaOtvoreniSlucaj.push(dijagnoza.NazivSekundarna);
                        //Za svaku sekundarnu dijagnozu sa servera NADODAVAM JEDAN FORM CONTROL
                        this.onAddDiagnosis();
                    }
                    //BRIŠEM ZADNJI FORM CONTROL da ne bude jedan viška
                    this.onDeleteDiagnosis(-1);
                    //Prolazim kroz sve prikupljene nazive sekundarnih dijagnoza sa servera
                    this.sekundarnaDijagnozaOtvoreniSlucaj.forEach((element,index) => {
                        //U polju naziva sekundarnih dijagnoza postavljam prikupljena imena sek. dijagnoza na određenom indexu
                        (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('nazivSekundarna').patchValue(element,{emitEvent: false});
                        //Postavljam MKB šifre sek.dijagnoza
                        SharedHandler.nazivToMKBSekundarna(element,this.dijagnoze,this.forma,index);
                    });
                    //Postavljam vrijednost naziva primarne dijagnoze na vrijednost koju sam dobio sa servera
                    this.primarnaDijagnoza.patchValue(this.primarnaDijagnozaOtvoreniSlucaj,{emitEvent: false});
                    //Postavljam MKB šifru primarne dijagnoze
                    SharedHandler.nazivToMKB(this.primarnaDijagnozaOtvoreniSlucaj,this.dijagnoze,this.forma);
                    //Zatvaram prozor otvorenog slučaja
                    this.otvoren = false;
                    //Omogućavam vidljivost gumba za poništavanje povezanog slučaja
                    this.ponistiPovezaniSlucaj = true;
                    //Postavljam vrijednost checkboxa "PovezanSlucaj" na true
                    this.povezanSlucaj.patchValue(true,{emitEvent: false});
                    //Onemogućavam mijenjanje stanja checkboxa "Povezan slučaj"
                    this.povezanSlucaj.disable({emitEvent: false});
                    //Resetiram checkbox novog slučaja da ne ostane da su oba true
                    this.noviSlucaj.reset();
                })
            ).subscribe();
        }
    }

    //Metoda koja poništava povezani slučaj
    ponistiPovezaniSlucajHandler(){
        //Resetiram i čistim polja dijagnoza
        //Dok ne ostane jedna sekundarna dijagnoza u arrayu
        while(this.getControlsSekundarna().length !== 1){
            //Briši mu prvi element
            (<FormArray>this.sekundarnaDijagnoza).removeAt(0);
        }
        //Kada je ostala jedna vrijednost sek. dijagnoze, resetiraj joj vrijednost i onemogući unos
        this.sekundarnaDijagnoza.reset();
        this.sekundarnaDijagnoza.disable({emitEvent: false});
        this.sekundarnaDijagnozaOtvoreniSlucaj = [];
        this.primarnaDijagnoza.patchValue(null,{emitEvent: false});
        //Resetiram validatore primarne dijagnoze
        this.primarnaDijagnoza.clearValidators();
        this.primarnaDijagnoza.updateValueAndValidity();
        //Resetiraj MKB šifru
        this.mkbPrimarnaDijagnoza.patchValue(null,{emitEvent: false});
        //Skrivam button "Poništi povezani slučaj"
        this.ponistiPovezaniSlucaj = false;
        //Resetiram checkbox povezanog slučaja
        this.povezanSlucaj.reset();
    }

    //Metoda koja se aktivira kada korisnik klikne "Poništi povezani slučaj"
    onPonistiPovezaniSlucaj(){
        //Ako je pacijent aktivan
        if(this.isAktivan){
            this.ponistiPovezaniSlucajHandler();
        }
    }


    //Metoda koja se pokreće kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
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

    //Kada se klikne button "X"
    onDeleteDiagnosis(index: number){
      (<FormArray>this.forma.get('sekundarnaDijagnoza')).removeAt(index);
    }

    //Kada se klikne button "Otvoreni slučaj"
    onOpenCase(){
        //Ako je pacijent AKTIVAN
        if(this.isAktivan){
            //Pretplaćivam se na evidentirane dijagnoze trenutno aktivnog pacijenta
            const combined = forkJoin([
                this.otvoreniSlucajService.getOtvoreniSlucaj(this.idPacijent),
                this.otvoreniSlucajService.getSekundarneDijagnoze(this.idPacijent)
            ]).pipe(
                tap(podatci => {
                    //Ako pacijent IMA aktivnih dijagnoza
                    if(podatci[0].success !== "false"){
                        //Resetiram polje otvorenih slučajeva
                        this.otvoreniSlucaji = [];
                        //Resetiram polje sek. dijagnoza
                        this.sekDijagnoze = [];
                        //Definiram objekt tipa "OtvoreniSlucaj"
                        let objektOtvoreniSlucaj;
                        //Prolazim odgovorom servera
                        for(const slucaj of podatci[0]){
                          //Za svaki objekt u odgovoru servera, kreiram svoj objekt tipa "OtvoreniSlucaj"
                          objektOtvoreniSlucaj = new OtvoreniSlucaj(slucaj);
                          //Dodavam novostvoreni objekt u svoje polje otvorenih slučaja
                          this.otvoreniSlucaji.push(objektOtvoreniSlucaj);
                        }
                        //Definiram objekt tipa "OtvoreniSlucaj"
                        let objektSekDijagnoza;
                        //Prolazim kroz odgovor servera tj. sek dijagnoze sa servera
                        for(const dijagnoza of podatci[1]){
                            //Za svaki objekt u odgovoru servera, kreiram svoj objekt tipa "OtvoreniSlucaj"
                            objektSekDijagnoza = new OtvoreniSlucaj(dijagnoza);
                            //Dodavam novostvoreni objekt u svoje polje otvorenih slučaja
                            this.sekDijagnoze.push(objektSekDijagnoza);
                        }
                        //Otvaram prozor otvorenih slučajeva
                        this.otvoren = true;
                    }
                    //Ako pacijent NEMA aktivnih dijagnoza
                    else{
                        this.dialog.open(DialogComponent, {data: {message: 'Aktivni pacijent nema evidentiranih dijagnoza!'}});
                    }
                })
            ).subscribe();
        }
        //Ako pacijent NIJE AKTIVAN
        else{
            this.dialog.open(DialogComponent, {data: {message: 'Pacijent nije aktivan!'}});
        }
    }

    //Kada se klikne button "Izađi"
    onCloseCase(){
        //Zatvori prozor sa otvorenim slučajevima
        this.otvoren = false;
    }

    //Kreiram gettere za sva polja u formi
    get nacinPlacanja(): FormControl{
      return this.forma.get('nacinPlacanja') as FormControl;
    }
    get podrucniUred(): FormControl{
      return this.forma.get('podrucniUred') as FormControl;
    }
    get sifUred(): FormControl{
        return this.forma.get('sifUred') as FormControl;
    }
    get ozljeda(): FormControl{
      return this.forma.get('ozljeda') as FormControl;
    }
    get sifUredOzljeda(): FormControl{
      return this.forma.get('sifUredOzljeda') as FormControl;
  }
    get poduzece(): FormControl{
      return this.forma.get('poduzece') as FormControl;
    }
    get oznakaOsiguranika(): FormControl {
      return this.forma.get('oznakaOsiguranika') as FormControl;
    }
    get kategorijaOsiguranja(): FormControl{
      return this.forma.get('kategorijaOsiguranja') as FormControl;
    }
    get ucesceOsiguranja(): FormControl{
      return this.forma.get('ucesceOsiguranja') as FormControl;
    }
    get drzavaOsiguranja(): FormControl{
      return this.forma.get('drzavaOsiguranja') as FormControl;
    }
    get mbrPacijent(): FormControl{
      return this.forma.get('mbrPacijent') as FormControl;
    }
    get brIskDopunsko(): FormControl{
      return this.forma.get('brIskDopunsko') as FormControl;
    }
    get primarnaDijagnoza(): FormControl{
      return this.forma.get('primarnaDijagnoza') as FormControl;
    }
    get mkbPrimarnaDijagnoza(): FormControl{
        return this.forma.get('mkbPrimarnaDijagnoza') as FormControl;
    }
    get sekundarnaDijagnoza(): FormArray{
      return this.forma.get('sekundarnaDijagnoza') as FormArray;
    }
    get tipSlucaj(): FormGroup{
      return this.forma.get('tipSlucaj') as FormGroup;
    }
    get noviSlucaj(): FormControl{
      return this.forma.get('tipSlucaj.noviSlucaj') as FormControl;
    }
    get povezanSlucaj(): FormControl{
      return this.forma.get('tipSlucaj.povezanSlucaj') as FormControl;
    }
}
