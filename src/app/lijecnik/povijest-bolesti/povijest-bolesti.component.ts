import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PovezaniPovijestBolestiService} from '../povezani-povijest-bolesti/povezani-povijest-bolesti.service';
import { combineLatest, merge, Subject } from 'rxjs';
import { HeaderService } from 'src/app/shared/header/header.service';
import { Obrada } from 'src/app/shared/modeli/obrada.model';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
import { OtvoreniSlucajService } from 'src/app/shared/otvoreni-slucaj/otvoreni-slucaj.service';
import { PovijestBolestiService } from './povijest-bolesti.service';
import { takeUntil, tap } from 'rxjs/operators';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
import * as Validacija from '../recept/recept-validations';

@Component({
  selector: 'app-povijest-bolesti',
  templateUrl: './povijest-bolesti.component.html',
  styleUrls: ['./povijest-bolesti.component.css']
})
export class PovijestBolestiComponent implements OnInit, OnDestroy {

      //Kreiram Subject
      pretplateSubject = new Subject<boolean>();
      //Oznaka je li gumb za poništavanje povezanog slučaja aktivan
      ponistiPovezaniSlucaj: boolean = false;
      //Oznaka je li otvoren prozor sa povijestima bolesti
      otvorenPovijestBolesti: boolean = false;
      //Oznaka je li ima odgovora servera 
      response: boolean = false;
      //Spremam odgovor servera
      responsePoruka: string = null;
      //Kreiram formu 
      forma: FormGroup;
      //Spremam dijagnoze
      dijagnoze: Dijagnoza[] = [];
      //Spremam trenutno aktivnog pacijenta
      trenutnoAktivniPacijent: Obrada;
      //Oznaka je li pacijent aktivan u obradi
      isAktivan: boolean = false;
      //Spremam ID trenutno aktivnog pacijenta
      idPacijent: number;
      //Spremam ID obrade
      idObrada: number;
      //Spremam trenutno izabranu sekundarnu dijagnozu zbog validacije duplikata
      sekDijagnoza: string;
      //Spremam dijagnozu koja je ista kod primarne i kod sekundarne dijagnoze
      dijagnoza: string;
      //Spremam ID trenutno aktivnog liječnika
      idLijecnik: number;
      //Spremam sve MKB šifre dijagnoza
      mkbSifre: string[] = [];
      //Oznaka je li liječnik izabrao brzi unos
      isBrziUnos: boolean = true;
      //Spremam dijagnoze povezane povijesti bolesti
      primarnaDijagnozaPovijestBolesti: string;
      sekundarnaDijagnozaPovijestBolesti: string[] = [];
      //Spremam podatke povijesti bolesti koju povezujem u svoje varijablu
      poslaniIDObrada:string = "";
      constructor(
          //Dohvaćam trenutni route da dohvatim podatke iz Resolvera
          private route: ActivatedRoute,
          //Dohvaćam servis headera
          private headerService: HeaderService,
          //Dohvaćam servis obrade
          private obradaService: ObradaService,
          //Dohvaćam servis povijesti bolesti
          private povijestBolestiService: PovijestBolestiService,
          //Dohvaćam servis povezane povijesti bolesti
          private povezaniPovijestBolestiService: PovezaniPovijestBolestiService
      ) { }

      //Metoda koja se izvodi kada se komponenta inicijalizira
      ngOnInit() {
          //Pretplaćujem se na podatke iz Resolvera
          this.route.data.pipe(
              tap(
                //Dohvaćam podatke iz Resolvera
                (podatci: {podatci: any,pacijent: Obrada | any}) => {
                    console.log(podatci.podatci);
                    //Inicijaliziram varijablu u koju spremam objekte tipa "Dijagnoza"
                    let objektDijagnoza;
                    //Prolazim poljem dijagnoza sa servera
                    for(const d of podatci.podatci["dijagnoze"]){
                        objektDijagnoza = new Dijagnoza(d);
                        this.dijagnoze.push(objektDijagnoza);
                        //Spremam jednu po jednu MKB šifru u svoje polje
                        this.mkbSifre.push(d.mkbSifra);
                    }
                    //Ako je Resolver vratio aktivnog pacijenta
                    if(podatci.pacijent["success"] !== "false"){
                      //Označavam da je pacijent aktivan u obradi
                      this.isAktivan = true;
                      //Spremam podatke obrade trenutno aktivnog pacijenta
                      this.trenutnoAktivniPacijent = new Obrada(podatci.pacijent[0]);
                      //Spremam ID trenutno aktivnog pacijenta
                      this.idPacijent = this.trenutnoAktivniPacijent.idPacijent;
                      //Spremam ID obrade
                      this.idObrada = this.trenutnoAktivniPacijent.idObrada;
                    }

                    this.forma = new FormGroup({
                      'brziUnos': new FormControl(true),
                      'razlogDolaska': new FormControl(null, this.isAktivan ? [Validators.required] : []),
                      'anamneza': new FormControl(null, this.isAktivan ? [Validators.required] : []),
                      'status': new FormControl(null),
                      'primarnaDijagnoza': new FormControl(null,this.isAktivan ? [Validators.required] : []),
                      'mkbPrimarnaDijagnoza': new FormControl(null,this.isAktivan ? [Validators.required,Validacija.provjeriMKB(this.mkbSifre)] : []),
                      'sekundarnaDijagnoza': new FormArray([
                          new FormGroup({
                            'nazivSekundarna': new FormControl(null),
                            'mkbSifraSekundarna': new FormControl(null)
                          },{validators: this.isAktivan ? [Validacija.requiredMKBSifraSekundarna(),Validacija.provjeriMKBSifraSekundarna(this.mkbSifre)] : []}) 
                      ],{validators: this.isAktivan ? this.isValidSekundarnaDijagnoza.bind(this) : null}),
                      'nalaz': new FormControl(null),
                      'terapija': new FormControl(null),
                      'preporukaLijecnik': new FormControl(null),
                      'napomena': new FormControl(null),
                      'tipSlucaj': new FormGroup({
                        'noviSlucaj': new FormControl(null),
                        'povezanSlucaj': new FormControl(null)
                      }, {validators: this.isAktivan ? this.atLeastOneRequiredTipSlucaj : null})
                    }, {validators: this.isAktivan ? this.isValidDijagnoze.bind(this) : null});
                    //Na početku onemogućavam unos sekundarne dijagnoze
                    this.forma.get('sekundarnaDijagnoza').disable({emitEvent: false});
                }
              ),
              takeUntil(this.pretplateSubject)
          ).subscribe();
          
          //Pretplaćujem se na promjene u poljima forme
          const promjeneForme = merge(
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
          

          const combined = combineLatest([
              this.headerService.getIDLijecnik(),
              this.obradaService.obsZavrsenPregled
          ]).pipe(
              tap(//Dohvaćam ID liječnika
                  (idLijecnik) => {
                      //Spremam ID liječnika
                      this.idLijecnik = idLijecnik[0][0].idLijecnik;
                  }
              ),
              takeUntil(this.pretplateSubject)
          ).subscribe(
              (podatci) => {
                  //Ako je pregled završen
                  if(podatci[1] === "zavrsenPregled"){
                      //Poništavam povezani slučaj ako je povezan
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
                  }
              }
          );
      }

      //Metoda koja se poziva kada liječnik promijeni checkbox "Brzi unos"
      onChangeBrziUnos(event: any){
        //Ako je checkbox "checked":
        if(event.target.checked){
            //Označavam da se prikaže brzi unos
            this.isBrziUnos = true;
        }
        //Ako checkbox nije "checked"
        else{
            //Označavam da se prikaže i opcionalna polja
            this.isBrziUnos = false;
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

      //Metoda koja INICIJALNO postavlja da bude required jedan od tipova slučaja
      atLeastOneRequiredTipSlucaj(group : FormGroup) : {[s:string ]: boolean} {
        if (group) {
            if(group.controls['noviSlucaj'].value || group.controls['povezanSlucaj'].value) {
                return null;
            }
        }
        return {'baremJedanTipSlucaj': true};
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

      //Metoda koja se izvodi kada korisnik klikne "Potvrdi povijest bolesti"
      onSubmit(){
          //Ako forma nije validna
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
          //Definiram MKB šifru tražene dijagnoze
          let mkbSifraPrethodna="";
          //Tražim MKB šifru prethodne dijagnoze prije nego što je liječnik ažurirao dijagnoze
          for(const dijagnoza of this.dijagnoze){
              if(this.primarnaDijagnozaPovijestBolesti === dijagnoza.imeDijagnoza){
                    mkbSifraPrethodna = dijagnoza.mkbSifra;
              }
          }
          //Ako je pacijent aktivan u obradi
          if(this.isAktivan){
              console.log(this.forma.getRawValue());
              //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na potvrdu povijesti bolesti
              this.povijestBolestiService.potvrdiPovijestBolesti(this.idLijecnik,this.idPacijent,this.razlogDolaska.value,
                  this.anamneza.value,this.status.value,this.nalaz.value,
                  this.mkbPrimarnaDijagnoza.value,mkbPolje,
                  this.noviSlucaj.value === true ? 'noviSlucaj' : 'povezanSlucaj',
                  this.terapija.value,this.preporukaLijecnik.value,
                  this.napomena.value,this.idObrada,mkbSifraPrethodna,this.poslaniIDObrada).pipe(
                  tap(
                    //Dohvaćam odgovor servera
                    (odgovor) => {
                      //Označavam da ima odgovora servera
                      this.response = true;
                      //Spremam odgovor servera
                      this.responsePoruka = odgovor["message"];
                    }
                  ),
                  takeUntil(this.pretplateSubject)
              ).subscribe(); 
          }
          //Ako pacijent nije aktivan u obradi
          else{
            //Označavam da se prozor aktivira
            this.response = true;
            this.responsePoruka = "Nema aktivnog pacijenta u obradi!";
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
        this.primarnaDijagnoza.patchValue(null,{emitEvent: false});
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

      //Metoda koja se izvodi kada se event aktivirao (Kada je komponenta "PovezaniPovijestBolesti" poslala podatke retka)
      onPoveziPodatciRetka($event){
          //Ako je pacijent aktivan
          if(this.isAktivan){
              this.povezaniPovijestBolestiService.getPovijestBolestiPovezanSlucaj($event,this.idPacijent).pipe(
                  tap(
                    //Dohvaćam odgovor
                    (odgovor) => {
                        //Spremam podatke povijesti bolesti u svoje varijable
                        this.poslaniIDObrada = odgovor[0].idObradaLijecnik;
                        //Popuni polja povijesti bolesti sa rezultatima sa servera
                        this.razlogDolaska.patchValue(odgovor[0].razlogDolaska,{emitEvent: false});
                        this.anamneza.patchValue(odgovor[0].anamneza,{emitEvent: false});
                        this.status.patchValue(odgovor[0].statusPacijent,{emitEvent: false});
                        this.nalaz.patchValue(odgovor[0].nalaz,{emitEvent: false});
                        this.terapija.patchValue(odgovor[0].terapija,{emitEvent: false});
                        this.preporukaLijecnik.patchValue(odgovor[0].preporukaLijecnik,{emitEvent: false});
                        this.napomena.patchValue(odgovor[0].napomena,{emitEvent: false});
                        //Resetiram formu sekundarnih dijagnoza
                        this.sekundarnaDijagnoza.clear();
                        //Resetiram svoje polje sekundarnih dijagnoza
                        this.sekundarnaDijagnozaPovijestBolesti = [];
                        //Dodaj jedan form control da inicijalno bude 1
                        this.onAddDiagnosis();
                        //Prolazim poljem odgovora servera
                        for(let dijagnoza of odgovor){
                          console.log(dijagnoza);
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
                        //Popunjavam polje MKB šifre primarne dijagnoze
                        Validacija.nazivToMKB(this.primarnaDijagnozaPovijestBolesti,this.dijagnoze,this.forma);
                        //Prolazim kroz sve prikupljene nazive sekundarnih dijagnoza sa servera
                        this.sekundarnaDijagnozaPovijestBolesti.forEach((element,index) => {
                            //U polju naziva sekundarnih dijagnoza postavljam prikupljena imena sek. dijagnoza na određenom indexu 
                            (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('nazivSekundarna').patchValue(element,{emitEvent: false});
                            //Postavljam MKB šifre sek.dijagnoza
                            Validacija.nazivToMKBSekundarna(element,this.dijagnoze,this.forma,index);
                        });
                        //Zatvaram prozor povijesti bolesti
                        this.otvorenPovijestBolesti = false;
                        //Omogućavam vidljivost gumba za poništavanje povezanog slučaja
                        this.ponistiPovezaniSlucaj = true;
                        //Postavljam vrijednost checkboxa "PovezanSlucaj" na true
                        this.povezanSlucaj.patchValue(true,{emitEvent: false});
                        //Onemogućavam mijenjanje stanja checkboxa "Povezan slučaj"
                        this.povezanSlucaj.disable({emitEvent: false});
                        //Resetiram checkbox novog slučaja da ne ostane da su oba true
                        this.noviSlucaj.reset();
                    }
                  ),
                  takeUntil(this.pretplateSubject)
              ).subscribe();
          }
      }

      //Metoda koja se izvodi kada korisnik klikne "Izađi"
      onClose(){
          //Zatvori prozor poruke
          this.response = false;
      }

      //Metoda koja se poziva kada korisnik klikne button "Poveži povijest bolesti"
      onPoveziPovijestBolesti(){
          //Označavam preko Subjecta da ulazim u ovu komponentu preko obrade
          this.povezaniPovijestBolestiService.isObrada.next(true);
          //Otvori prozor sa povijestima bolesti ovog pacijenta
          this.otvorenPovijestBolesti = true;
      }
      //Metoda koja se poziva kada korisnik klikne "Izađi" u prozoru povezanog povijesti bolesti
      onClosePovezanPovijestBolesti(){
          //Izađi iz prozora
          this.otvorenPovijestBolesti = false;
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

      //Ova metoda se poziva kada se komponenta uništi
      ngOnDestroy(){
          this.pretplateSubject.next(true);
          this.pretplateSubject.complete();
          //Praznim Subject završenog pregleda
          this.obradaService.zavrsenPregled.next(null);
      }

      //Kreiram gettere
      get brziUnos(): FormControl{
        return this.forma.get('brziUnos') as FormControl;
      }
      get razlogDolaska(): FormControl{
          return this.forma.get('razlogDolaska') as FormControl;
      }
      get anamneza(): FormControl{
          return this.forma.get('anamneza') as FormControl;
      }
      get status(): FormControl{
          return this.forma.get('status') as FormControl;
      }
      get primarnaDijagnoza(): FormControl{
          return this.forma.get('primarnaDijagnoza') as FormControl;
      }
      get sekundarnaDijagnoza(): FormArray{
          return this.forma.get('sekundarnaDijagnoza') as FormArray;
      }
      get mkbPrimarnaDijagnoza(): FormControl{
          return this.forma.get('mkbPrimarnaDijagnoza') as FormControl;
      }
      get nalaz(): FormControl{
          return this.forma.get('nalaz') as FormControl;
      }
      get terapija(): FormControl{
          return this.forma.get('terapija') as FormControl;
      }
      get preporukaLijecnik(): FormControl{
          return this.forma.get('preporukaLijecnik') as FormControl;
      }
      get napomena(): FormControl{
          return this.forma.get('napomena') as FormControl;
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
