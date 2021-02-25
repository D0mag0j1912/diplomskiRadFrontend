import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, merge, Subject } from 'rxjs';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
import { DrzavaOsiguranja } from 'src/app/shared/modeli/drzavaOsiguranja.model';
import { HeaderService } from 'src/app/shared/header/header.service';
import { KategorijaOsiguranja } from 'src/app/shared/modeli/kategorijaOsiguranja.model';
import { Obrada } from 'src/app/shared/modeli/obrada.model';
import { OtvoreniSlucajService } from 'src/app/shared/otvoreni-slucaj/otvoreni-slucaj.service';
import { PodrucniUred } from 'src/app/shared/modeli/podrucniUred.model';
import { MedSestraService } from '../med-sestra.service';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
import { takeUntil, tap } from 'rxjs/operators';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';
import * as Validacija from '../../lijecnik/recept/recept-validations';

@Component({
  selector: 'app-opci-podatci-pregleda',
  templateUrl: './opci-podatci-pregleda.component.html',
  styleUrls: ['./opci-podatci-pregleda.component.css']
})
export class OpciPodatciPregledaComponent implements OnInit,OnDestroy{

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
    //Oznaka je li ima odgovora servera
    response: boolean = false;
    //Spremam odgovor servera
    responsePoruka: string = null;
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
    //Spremam nazive svih dijagnoza zbog validacije
    naziviDijagnoze: string[] = [];
    //Spremam sve države osiguranja
    drzave: DrzavaOsiguranja[] = [];
    //Spremam sve nazive država zbog validacije
    naziviDrzave: string[] = [];
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
    zdravstveniPodatci: any;
    //Spremam sve MKB šifre
    mkbSifre: string[] = [];

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
      private obradaService: ObradaService
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
                if(response.pacijent.pacijent["success"] !== "false"){
                  //Označavam da je pacijent aktivan u obradi
                  this.isAktivan = true;
                  //Spremam podatke obrade trenutno aktivnog pacijenta
                  this.trenutnoAktivniPacijent = new Obrada(response.pacijent.pacijent[0]);
                  //Spremam osobne podatke trenutno aktivnog pacijenta
                  this.pacijent = new Pacijent(response.pacijent.pacijent[0]);
                  //Spremam ID pacijenta
                  this.idPacijent = this.trenutnoAktivniPacijent.idPacijent;
                  //Spremam ID obrade
                  this.idObrada = this.trenutnoAktivniPacijent.idObrada;
                  //Spremam zdravstvene podatke trenutno aktivnog pacijenta
                  this.zdravstveniPodatci = response.pacijent.podatci;
                }
                //Punim polja za validaciju
                for(let ured of this.podrucniUredi){
                  this.naziviPodrucnihUreda.push(ured["nazivSluzbe"]);
                }
                for(let opis of this.katOsiguranja){
                  this.opisiOsiguranika.push(opis["opisOsiguranika"]);
                }
                for(let dijagnoza of this.dijagnoze){
                  this.naziviDijagnoze.push(dijagnoza["imeDijagnoza"]);
                }
                for(let drzava of this.drzave){
                  this.naziviDrzave.push(drzava["nazivDrzave"]);
                }

                //Kreiram formu
                this.forma = new FormGroup({
                  'nacinPlacanja': new FormControl(null, this.isAktivan ? [Validators.required] : []),
                  'podrucniUred': new FormControl(null),
                  'sifUred': new FormControl(null),
                  'ozljeda': new FormControl(null),
                  'sifUredOzljeda': new FormControl(null),
                  'poduzece': new FormControl(null),
                  'kategorijaOsiguranja': new FormControl(null),
                  'oznakaOsiguranika': new FormControl(null),
                  'drzavaOsiguranja': new FormControl(null),
                  //Ako je pacijent aktivan u obradi, POSTAVLJAM MU VALIDATOR NA MBO, inače NE POSTAVLJAM
                  'mbrPacijent': new FormControl(null, this.isAktivan ? [Validators.required, Validators.pattern("^\\d{9}$"), this.isValidMBO.bind(this)] : []),
                  'brIskDopunsko': new FormControl(null),
                  'primarnaDijagnoza': new FormControl(null),
                  'mkbPrimarnaDijagnoza': new FormControl(null,this.isAktivan ? [Validacija.provjeriMKB(this.mkbSifre)] : []),
                  'sekundarnaDijagnoza': new FormArray([
                      new FormGroup({
                        'nazivSekundarna': new FormControl(null),
                        'mkbSifraSekundarna': new FormControl(null)
                      },{validators: this.isAktivan ? [Validacija.requiredMKBSifraSekundarna(),Validacija.provjeriMKBSifraSekundarna(this.mkbSifre)] : []}) 
                  ],{validators: this.isAktivan ? this.isValidSekundarnaDijagnoza.bind(this) : null}),
                  'tipSlucaj': new FormGroup({
                    'noviSlucaj': new FormControl(null),
                    'povezanSlucaj': new FormControl(null)
                  }, {validators: this.isAktivan ? this.atLeastOneRequiredTipSlucaj : null}),
                }, {validators: this.isAktivan ? this.isValidDijagnoze.bind(this) : null});
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe(); 

        //AKO JE PACIJENT AKTIVAN
        if(this.isAktivan){
            //Inicijalno onemogućavam unos nekih polja u formi
            this.forma.get('sifUred').disable({emitEvent: false});
            this.forma.get('sifUredOzljeda').disable({emitEvent: false});
            this.forma.get('podrucniUred').disable({emitEvent: false});
            this.forma.get('ozljeda').disable({emitEvent: false});
            this.forma.get('poduzece').disable({emitEvent: false});
            this.forma.get('oznakaOsiguranika').disable({emitEvent: false});
            this.forma.get('sekundarnaDijagnoza').disable({emitEvent: false});

            //Prolazim poljem zdravstvenih podataka
            for(let podatci of this.zdravstveniPodatci){
                //Inicijalno popunjam polja zdravstvenih podataka trenutno aktivnog pacijenta
                this.forma.get('kategorijaOsiguranja').patchValue(podatci.opisOsiguranika,{emitEvent: false});
                //Pozivam metodu koja će popuniti oznaku osiguranika
                this.opisOsiguranikaToOznaka(podatci.opisOsiguranika);
                this.forma.get('drzavaOsiguranja').patchValue(podatci.drzavaOsiguranja,{emitEvent: false});
                this.forma.get('mbrPacijent').patchValue(podatci.mboPacijent,{emitEvent: false});
                //Ako pacijent ima broj iskaznice dopunskog
                if(podatci.brojIskazniceDopunsko !== null){
                    //Postavljam validatore na broj iskaznice dopunskog
                    this.forma.get('brIskDopunsko').setValidators([Validators.required,Validators.pattern("^\\d{8}$"), this.isValidDopunsko.bind(this)])
                    this.forma.get('brIskDopunsko').patchValue(podatci.brojIskazniceDopunsko,{emitEvent: false});
                }
            }

            //Kreiram jedan Observable koji će emitirati jednu vrijednost kada bilo koji form control promjeni svoju vrijednost
            const combined = merge(
                this.nacinPlacanja.valueChanges.pipe(
                    tap(
                        (value) => {
                            //Pozivam metodu koja pokreće validacije za načine plaćanja
                            this.validacijaNacinPlacanja(value);
                        }
                    ),
                    takeUntil(this.pretplateSubject)
                ),
                this.kategorijaOsiguranja.valueChanges.pipe(
                    tap(
                        (value) => {
                            //Ako se unesena vrijednost u formi NALAZI u polju opisa osiguranika
                            if(this.opisiOsiguranika.indexOf(value) !== -1){
                                //Ako je form control ispravan
                                if(this.kategorijaOsiguranja.valid){
                                    //Pozivam metodu
                                    this.opisOsiguranikaToOznaka(value);
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
                            //Ako se unesena vrijednost u formi NALAZI u nazivima područnih ureda
                            if(this.naziviPodrucnihUreda.indexOf(value) !== -1){
                                //Ako je form control ispravan
                                if(this.podrucniUred.valid){
                                    //Pozivam metodu
                                    this.nazivSluzbeToSif(value);
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
                            //Ako je form control ispravan
                            if(this.ozljeda.valid){
                                //Pozivam metodu
                                this.nazivSluzbeToSifOzljeda(value);
                            }
                            //Ako nije ispravan
                            else{
                                //Treba biti prazno
                                this.sifUredOzljeda.patchValue(null,{emitEvent: false});
                            } 
                        }
                    ),
                    takeUntil(this.pretplateSubject)
                ),
                //Slušam promjene u polju unosa primarne dijagnoze
                this.primarnaDijagnoza.valueChanges.pipe(
                  tap(value => {
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
                              Validacija.nazivToMKB(value,this.dijagnoze,this.forma);
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
                  }),
                  takeUntil(this.pretplateSubject)
                ),
                //Slušam promjene u polju unosa MKB šifre primarne dijagnoze
                this.mkbPrimarnaDijagnoza.valueChanges.pipe(
                    tap(value => {
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
                )
            ).subscribe();

            const combined2 = combineLatest([
                this.headerService.getIDMedSestra(),
                this.obradaService.obsZavrsenPregled
            ]).pipe(
                takeUntil(this.pretplateSubject)
            ).subscribe(
                //Dohvaćam odgovor
                (response) => {
                    //Podatak iz Subjecta spremam u svoju varijablu
                    this.idMedSestra = response[0][0].idMedSestra;
                    console.log(this.idMedSestra);
                    //Ako je pregled završen
                    if(response[1] === "zavrsenPregled"){
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
                    }
                }
            ); 
        }
        
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

    //Ova metoda se poziva kada se promijeni naziv sekundarne dijagnoze
    onChangeNazivSekundarna(nazivSekundarna: string, index: number){
        //Pozivam metodu koja će automatski unijeti MKB šifru sekundarne dijagnoze
        Validacija.nazivToMKBSekundarna(nazivSekundarna,this.dijagnoze,this.forma,index);
    }

    //Metoda koja provjerava je li uneseni MBO jednak MBO-u koji ima trenutno aktivni pacijent
    isValidMBO(control: FormControl): {[key: string]: boolean}{
      //Ako uneseni MBO pacijenta nije jednak MBO-u pacijenta koji je trenutno aktivan u obradi
      if(control.value !== this.pacijent.mbo){
        return {'nePostojiMBO':true};
      }
      return null;
    } 

    //Metoda koja provjerava je li uneseni BROJ ISKAZNICE DOPUNSKOG OSIGURANJA jednak BROJU koji ima trenutno aktivni pacijent
    isValidDopunsko(control: FormControl): {[key: string]: boolean}{
      //Ako uneseni broj iskaznice  NIJE JEDNAK broju koji ima trenutno aktivni pacijent
      if(control.value !== this.pacijent.brIskDopunsko){
          return {'nePostojiBrojDopunsko':true};  
      }
      return null;
    }
     
    //Metoda koja provjerava je li država osiguranja ispravno unesena tj. je li unesena vrijednost koja nije dio polja država osiguranja
    isValidDrzavaOsiguranja(control: FormControl): {[key: string]: boolean}{
      //Ako vrijednost države osiguranja koje je korisnik unio nije dio polja država osiguranja (znači vraća -1 ako nije dio polja)
      if(this.naziviDrzave.indexOf(control.value) === -1){
        return {'drzaveIsForbidden': true};
      }
      //Ako je vrijednost naziva mjesta ok, vraćam null
      return null;
    }
    //Metoda koja provjerava je li kategorija osiguranja ispravno unesena tj. je li unesena vrijednost koja nije dio polja kategorija osiguranja
    isValidKategorijaOsiguranja(control: FormControl): {[key: string]: boolean}{
      //Ako vrijednost kategorije osiguranja koje je korisnik unio nije dio polja kategorija osiguranja (znači vraća -1 ako nije dio polja)
      if(this.opisiOsiguranika.indexOf(control.value) === -1){
        return {'opisIsForbidden': true};
      }
      //Ako je vrijednost naziva mjesta ok, vraćam null
      return null;
    }
    //Metoda koja provjerava je li područni ured ispravno unesen tj. je li unesena vrijednost koja nije dio polja područnih ureda
    isValidPodrucniUred(control: FormControl): {[key: string]: boolean}{
      //Ako vrijednost područnog ureda koje je korisnik unio nije dio polja područnih ureda (znači vraća -1 ako nije dio polja)
      if(this.naziviPodrucnihUreda.indexOf(control.value) === -1){
        return {'uredIsForbidden': true};
      }
      //Ako je vrijednost naziva mjesta ok, vraćam null
      return null;
    }

    //Metoda koja dinamički postavlja i gasi validatore u formi
    validacijaNacinPlacanja(value: string){
      //Ako je pacijent aktivan u obradi
      if(this.isAktivan){
          //Ako je trenutna vrijednost načina plaćanja "poduzeće"
          if(value === 'poduzece'){
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
          else{
            //Gasim validatore za poduzeće
            this.poduzece.clearValidators();
          }
          //Ako je trenutna vrijednost načina plaćanja "hzzo"
          if(value === 'hzzo'){
            //Resetiram šifre područnih ureda ozljede
            this.sifUredOzljeda.reset();
            //Omogućavam unos područnog ureda HZZO
            this.podrucniUred.enable({emitEvent: false});
            //Područni ured mora biti unesen
            this.podrucniUred.setValidators([Validators.required,this.isValidPodrucniUred.bind(this)]);
            //Broj iskaznice dopunskog mora biti unesen
            this.brIskDopunsko.setValidators([Validators.required,Validators.pattern("^\\d{8}$"), this.isValidDopunsko.bind(this)]);
            
            //Resetiram polja područnog ureda ozljede na radu i poduzeća
            this.ozljeda.reset();
            this.poduzece.reset();
            //Onemogućavam unos područnog ureda ozljede na radu te naziva poduzeća
            this.ozljeda.disable({emitEvent: false});
            this.poduzece.disable({emitEvent: false});
          }
          else{
            //Odbaci validatore
            this.podrucniUred.clearValidators();
            //Odbaci validatore
            this.brIskDopunsko.clearValidators();
          }
          //Ako je trenutna vrijednost načina plaćanja "ozljeda"
          if(value === 'ozljeda'){
            //Resetiram šifre područnih ureda
            this.sifUred.reset();
            //Omogućavam unos područnog ureda ozljede na radu
            this.ozljeda.enable({emitEvent: false});
            //Područni ured ozljede mora biti unesen
            this.ozljeda.setValidators([Validators.required, this.isValidPodrucniUred.bind(this)]);
            //Resetiram polja područnog ureda HZZO-a i poduzeća
            this.podrucniUred.reset();
            this.poduzece.reset();
            //Onemogućavam unos područnog ureda i poduzeća
            this.podrucniUred.disable({emitEvent: false});
            this.poduzece.disable({emitEvent: false});
          }
          else{
            //Odbaci validatore
            this.ozljeda.clearValidators();
          }
          //Ako je trenutna vrijednost načina plaćanja "osobno"
          if(value === "osobno"){
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
          //Ako je trenutna vrijednost načina plaćanja "ozljeda" ili "hzzo"
          if(value === 'hzzo' || value === 'ozljeda' || value === 'poduzece'){
            //Resetiram šifre područnih ureda
            this.sifUred.reset();
            this.sifUredOzljeda.reset();
            //Kategorija osiguranja mora biti unesena
            this.kategorijaOsiguranja.setValidators([Validators.required, this.isValidKategorijaOsiguranja.bind(this)]);
            //Država osiguranja mora biti unesena
            this.drzavaOsiguranja.setValidators([Validators.required, this.isValidDrzavaOsiguranja.bind(this)]);
          }
          else{
            //Odbaci validatore
            this.kategorijaOsiguranja.clearValidators();
            //Odbaci validatore
            this.drzavaOsiguranja.clearValidators();
          }
          //Omogućava promjene na poljima tj. stavljanje i dizanje validatora
          this.poduzece.updateValueAndValidity({emitEvent: false});
          this.podrucniUred.updateValueAndValidity({emitEvent: false});
          this.sifUred.updateValueAndValidity({emitEvent: false});
          this.ozljeda.updateValueAndValidity({emitEvent: false});
          this.sifUredOzljeda.updateValueAndValidity({emitEvent: false});
          this.kategorijaOsiguranja.updateValueAndValidity({emitEvent: false});
          this.drzavaOsiguranja.updateValueAndValidity({emitEvent: false});
          this.brIskDopunsko.updateValueAndValidity({emitEvent: false});
      }
    }

    //Metoda koja automatski upisuje šifru područnog ureda na osnovu upisanog naziva službe
    nazivSluzbeToSif(value: string){
      //Prolazim kroz polje područnih ureda
      for(let ured of this.podrucniUredi){
        //Ako je vrijednost polja naziva službe područnog ureda jednaka vrijednosti naziva službe područnog ureda u polju
        if(value === ured["nazivSluzbe"]){
          //Postavi šifru područnog ureda na onu šifru koja odgovara upisanom nazivu službe
          this.forma.get('sifUred').patchValue(ured["sifUred"],{emitEvent: false});
        }
      }
      this.forma.get('sifUred').updateValueAndValidity({emitEvent: false}); 
    }
    //Metoda koja automatski upisuje šifru područnog ureda na osnovu upisanog naziva službe
    nazivSluzbeToSifOzljeda(value: string){
      //Prolazim kroz polje područnih ureda
      for(let ured of this.podrucniUredi){
        //Ako je vrijednost polja naziva službe područnog ureda jednaka vrijednosti naziva službe područnog ureda u polju
        if(value === ured["nazivSluzbe"]){
          //Postavi šifru područnog ureda na onu šifru koja odgovara upisanom nazivu službe
          this.forma.get('sifUredOzljeda').patchValue(ured["sifUred"],{emitEvent: false});
        }
      }
      this.forma.get('sifUredOzljeda').updateValueAndValidity({emitEvent: false}); 
    }

    //Metoda koja automatski upisuje oznaku osiguranika na osnovu upisanog opisa osiguranja
    opisOsiguranikaToOznaka(value: string){
      //Prolazim kroz polje kategorija osiguranja
      for(let osiguranje of this.katOsiguranja){
        //Ako je vrijednost polja naziva službe područnog ureda jednaka vrijednosti naziva službe područnog ureda u polju
        if(value === osiguranje["opisOsiguranika"]){
          //Postavi oznaku osiguranika na onu oznaku koja odgovora odabranom opisu osiguranika
          this.forma.get('oznakaOsiguranika').patchValue(osiguranje["oznakaOsiguranika"],{emitEvent: false});
        }
      }
      this.forma.get('oznakaOsiguranika').updateValueAndValidity({emitEvent: false}); 
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

    //Metoda koja INICIJALNO postavlja da bude required jedan od tipova slučaja
    atLeastOneRequiredTipSlucaj(group : FormGroup) : {[s:string ]: boolean} {
      if (group) {
        if(group.controls['noviSlucaj'].value || group.controls['povezanSlucaj'].value) {
          return null;
        }
      }
      return {'baremJedanTipSlucaj': true};
    }

    //Kada korisnik klikne "Potvrdi opće podatke"
    onSubmit(){
        //Ako forma nije ispravna
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
        //Ako je pacijent aktivan
        if(this.isAktivan){
            //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na zahtjev dodavanja općih podataka pregleda
            this.medSestraService.sendVisitData(this.idMedSestra,this.idPacijent,this.nacinPlacanja.value,this.podrucniUred.value,
                this.ozljeda.value, this.poduzece.value, this.oznakaOsiguranika.value,
                this.drzavaOsiguranja.value, this.mbrPacijent.value, this.brIskDopunsko.value,
                this.mkbPrimarnaDijagnoza.value, mkbPolje,this.noviSlucaj.value === true ? 'noviSlucaj' : 'povezanSlucaj',this.idObrada).pipe(
                    //Dohvaćam odgovor servera
                    tap((response) => {
                        //Označavam da ima odgovora servera
                        this.response = true;
                        //Spremam odgovor servera
                        this.responsePoruka = response["success"] !== "false" ? "Opći podatci pregleda uspješno dodani!" : response["message"];
                    }),
                    takeUntil(this.pretplateSubject)  
            ).subscribe();
        }
        else{
          //Označavam da se prozor aktivira
          this.response = true;
          this.responsePoruka = "Nema aktivnog pacijenta u obradi!";
        }    
    }

    //Metoda koja se poziva kada se zatvori prozor poruke
    onClose(){
      //Zatvori prozor
      this.response = false;
    }

    //Metoda koja se aktivira kada komponenta primi informaciju da se EVENT AKTIVIRAO ($event je šifra primarne dijagnoze pojedinog retka otvorenog slučaja)
    onPoveziOtvoreniSlucaj($event){
      //Ako je pacijent aktivan
      if(this.isAktivan){
          //Pretplaćujem se na Observable u kojemu se nalaze NAZIV PRIMARNE DIJAGNOZE i NAZIVI NJEZINIH SEKUNDARNIH DIJAGNOZA
          this.otvoreniSlucajService.getDijagnozePovezanSlucaj($event,this.idPacijent).pipe(
              tap(//Dohvaćam podatke
                (podatci) => {
                    //Resetiram formu sekundarnih dijagnoza
                    this.sekundarnaDijagnoza.clear();
                    //Resetiram svoje polje sekundarnih dijagnoza
                    this.sekundarnaDijagnozaOtvoreniSlucaj = [];
                    //Dodaj jedan form control da inicijalno bude 1
                    this.onAddDiagnosis();
                    //Prolazim poljem odgovora servera
                    for(let dijagnoza of podatci){
                      console.log(dijagnoza);
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
                        Validacija.nazivToMKBSekundarna(element,this.dijagnoze,this.forma,index);
                    });
                    //Postavljam vrijednost naziva primarne dijagnoze na vrijednost koju sam dobio sa servera
                    this.primarnaDijagnoza.patchValue(this.primarnaDijagnozaOtvoreniSlucaj,{emitEvent: false});
                    //Postavljam MKB šifru primarne dijagnoze
                    Validacija.nazivToMKB(this.primarnaDijagnozaOtvoreniSlucaj,this.dijagnoze,this.forma);
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
                }),
                takeUntil(this.pretplateSubject)
          ).subscribe();
      }
    }

    //Metoda koja se aktivira kada korisnik klikne "Poništi povezani slučaj"
    onPonistiPovezaniSlucaj(){
        //Ako je pacijent aktivan
        if(this.isAktivan){
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
            //Skrivam button "Poništi povezani slučaj"
            this.ponistiPovezaniSlucaj = false;
            //Resetiram checkbox povezanog slučaja
            this.povezanSlucaj.reset();
        }
    }


    //Metoda koja se pokreće kada se komponenta uništi
    ngOnDestroy(){
      this.pretplateSubject.next(true);
      this.pretplateSubject.complete();
      //Praznim Subject da mi se ulazi u Subscription i dobiva informaciju da je pregled završen iako nije
      this.obradaService.zavrsenPregled.next(null);
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

    //Kada se klikne button "X"
    onDeleteDiagnosis(index: number){
      (<FormArray>this.forma.get('sekundarnaDijagnoza')).removeAt(index);
    }

    //Kada se klikne button "Otvoreni slučaj"
    onOpenCase(){
        //Otvori prozor sa otvorenim slučajevima
        this.otvoren = true;
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
