import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PovezaniPovijestBolestiService} from '../povezani-povijest-bolesti/povezani-povijest-bolesti.service';
import { Subscription } from 'rxjs';
import { HeaderService } from 'src/app/shared/header/header.service';
import { Obrada } from 'src/app/shared/modeli/obrada.model';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
import { OtvoreniSlucajService } from 'src/app/shared/otvoreni-slucaj/otvoreni-slucaj.service';
import { PovijestBolestiService } from './povijest-bolesti.service';

@Component({
  selector: 'app-povijest-bolesti',
  templateUrl: './povijest-bolesti.component.html',
  styleUrls: ['./povijest-bolesti.component.css']
})
export class PovijestBolestiComponent implements OnInit, OnDestroy {

      //Spremam pretplate
      subsResolver: Subscription;
      subsOtvoreniSlucaj: Subscription;
      subsPovezanaPovijestBolesti: Subscription;
      subsPrimarnaDijagnoza: Subscription;
      subsAktivniLijecnik: Subscription;
      subsZavrsenPregled: Subscription;
      subsSubmit: Subscription;
      //Oznaka je li gumb za poništavanje povezanog slučaja aktivan
      ponistiPovezaniSlucaj: boolean = false;
      //Oznaka je li otvoren prozor sa povijestima bolesti
      otvorenPovijestBolesti: boolean = false;
      //Oznaka je su li otvoreni slučajevi
      otvoren: boolean = false;
      //Oznaka je li ima odgovora servera 
      response: boolean = false;
      //Spremam odgovor servera
      responsePoruka: string = null;
      //Kreiram formu 
      forma: FormGroup;
      //Spremam dijagnoze
      dijagnoze: any;
      //Spremam trenutno aktivnog pacijenta
      trenutnoAktivniPacijent: Obrada;
      //Oznaka je li pacijent aktivan u obradi
      isAktivan: boolean = false;
      //Spremam ID trenutno aktivnog pacijenta
      idPacijent: number;
      //Spremam trenutno izabranu sekundarnu dijagnozu zbog validacije duplikata
      sekDijagnoza: string;
      //Spremam dijagnozu koja je ista kod primarne i kod sekundarne dijagnoze
      dijagnoza: string;
      //Spremam ID trenutno aktivnog liječnika
      idLijecnik: number;
      
      //Spremam dijagnoze otvorenog slučaja
      primarnaDijagnozaOtvoreniSlucaj: string;
      sekundarnaDijagnozaOtvoreniSlucaj: string[] = [];

      //Spremam dijagnoze povezane povijesti bolesti
      primarnaDijagnozaPovijestBolesti: string;
      sekundarnaDijagnozaPovijestBolesti: string[] = [];

      constructor(
          //Dohvaćam trenutni route da dohvatim podatke iz Resolvera
          private route: ActivatedRoute,
          //Dohvaćam servis otvorenog slučaja
          private otvoreniSlucajService: OtvoreniSlucajService,
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
          this.subsResolver = this.route.data.subscribe(
              //Dohvaćam podatke iz Resolvera
              (podatci: {podatci: any,pacijent: Obrada | any}) => {
                  //Spremam dijagnoze iz Resolvera u svoje polje
                  this.dijagnoze = podatci.podatci["dijagnoze"];

                  //Ako je Resolver vratio aktivnog pacijenta
                  if(podatci.pacijent["success"] !== "false"){
                    //Označavam da je pacijent aktivan u obradi
                    this.isAktivan = true;
                    //Spremam mu podatke
                    this.trenutnoAktivniPacijent = podatci.pacijent;
                    //Spremam ID trenutno aktivnog pacijenta
                    this.idPacijent = this.trenutnoAktivniPacijent[0].idPacijent;
                    console.log(this.idPacijent);
                  }
                  this.forma = new FormGroup({
                    'razlogDolaska': new FormControl(null),
                    'anamneza': new FormControl(null),
                    'status': new FormControl(null),
                    'primarnaDijagnoza': new FormControl(null,this.isAktivan ? [Validators.required] : []),
                    'sekundarnaDijagnoza': new FormArray([
                      new FormControl(null)
                    ] , {validators: this.isAktivan ? this.isValidSekundarnaDijagnoza.bind(this) : null}),
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
                  this.forma.get('sekundarnaDijagnoza').disable();
              }
          );
          //Pretplaćujem se na promjene u primarnoj dijagnozi
          this.subsPrimarnaDijagnoza = this.forma.get('primarnaDijagnoza').valueChanges.subscribe(
              (dijagnoza) => {
                  if(dijagnoza){
                      //Kada je primarna dijagnoza unesena, unos sekundarne dijagnoze je omogućen
                      this.forma.get('sekundarnaDijagnoza').enable();
                  }
              }
          );

          //Pretplaćujem se na Observable da dobijem ID trenutno aktivnog liječnika
          this.subsAktivniLijecnik = this.headerService.getIDLijecnik().subscribe(
              //Dohvaćam ID liječnika
              (idLijecnik) => {
                  //Spremam ID liječnika
                  this.idLijecnik = idLijecnik[0].idLijecnik;
              }
          );
          //Pretplaćujem se na Subject koji označava je li pregled završen ili nije
          this.subsZavrsenPregled = this.obradaService.obsZavrsenPregled.subscribe(
            (podatci) => {
              //Ako je pregled završen
              if(podatci === "zavrsenPregled"){
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

      //Metoda koja se izvodi kada korisnik klikne "Potvrdi povijest bolesti"
      onSubmit(){
          //Ako forma nije validna
          if(!this.forma.valid){
              return;
          }
          //Ako je pacijent aktivan u obradi
          if(this.isAktivan){
              console.log(this.forma.getRawValue());
              //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na potvrdu povijesti bolesti
              this.subsSubmit = this.povijestBolestiService.potvrdiPovijestBolesti(this.idLijecnik,this.idPacijent,this.razlogDolaska.value,
                                                                                  this.anamneza.value,this.status.value,this.nalaz.value,
                                                                                  this.primarnaDijagnoza.value,this.sekundarnaDijagnoza.value,
                                                                                  this.noviSlucaj.value === true ? 'noviSlucaj' : 'povezanSlucaj',
                                                                                  this.terapija.value,this.preporukaLijecnik.value,
                                                                                  this.napomena.value).subscribe(
                  //Dohvaćam odgovor servera
                  (odgovor) => {
                      //Označavam da ima odgovora servera
                      this.response = true;
                      //Spremam odgovor servera
                      this.responsePoruka = odgovor["message"];
                  }
              );
          }
          //Ako pacijent nije aktivan u obradi
          else{
            //Označavam da se prozor aktivira
            this.response = true;
            this.responsePoruka = "Nema aktivnog pacijenta u obradi!";
          }
      }

      //Metoda koja se aktivira kada komponenta primi informaciju da se EVENT AKTIVIRAO ($event su podatci pojedinog retka otvorenog slučaja)
      onPoveziOtvoreniSlucaj($event){
        console.log($event);
        //Ako je pacijent aktivan
        if(this.isAktivan){
            //Pretplaćujem se na Observable u kojemu se nalaze NAZIV PRIMARNE DIJAGNOZE i NAZIVI NJEZINIH SEKUNDARNIH DIJAGNOZA
            this.subsOtvoreniSlucaj = this.otvoreniSlucajService.getDijagnozePovezanSlucaj($event,this.idPacijent).subscribe(
              //Dohvaćam podatke
              (podatci) => {
                  console.log(podatci);
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
                  //Postavljam vrijednost naziva primarne dijagnoze na vrijednost koju sam dobio sa servera
                  this.primarnaDijagnoza.setValue(this.primarnaDijagnozaOtvoreniSlucaj);
                  //Postavljam vrijednost naziva sekundarnih dijagnoza na vrijednosti koje sam dobio sa servera
                  this.sekundarnaDijagnoza.setValue(this.sekundarnaDijagnozaOtvoreniSlucaj);
                  //Zatvaram prozor otvorenog slučaja
                  this.otvoren = false;
                  //Omogućavam vidljivost gumba za poništavanje povezanog slučaja
                  this.ponistiPovezaniSlucaj = true;
                  //Postavljam vrijednost checkboxa "PovezanSlucaj" na true
                  this.povezanSlucaj.setValue(true);
                  //Onemogućavam mijenjanje stanja checkboxa "Povezan slučaj"
                  this.povezanSlucaj.disable();
                  //Resetiram checkbox novog slučaja da ne ostane da su oba true
                  this.noviSlucaj.reset();
              }
          );
        }
      }

      //Metoda koja se aktivira kada korisnik klikne "Poništi povezani slučaj"
      onPonistiPovezaniSlucaj(){
          //Ako je pacijent aktivan
          if(this.isAktivan){
              //Resetiram i čistim polja dijagnoza
              this.sekundarnaDijagnoza.clear();
              this.sekundarnaDijagnozaOtvoreniSlucaj = [];
              this.onAddDiagnosis();
              this.primarnaDijagnoza.setValue(null);
              //Skrivam button "Poništi povezani slučaj"
              this.ponistiPovezaniSlucaj = false;
              //Resetiram checkbox povezanog slučaja
              this.povezanSlucaj.reset();
          }
      }

      //Metoda koja se izvodi kada se event aktivirao (Kada je komponenta "PovezaniPovijestBolesti" poslala podatke retka)
      onPoveziPodatciRetka($event){
          //Ako je pacijent aktivan
          if(this.isAktivan){
              this.subsPovezanaPovijestBolesti = this.povezaniPovijestBolestiService.getPovijestBolestiPovezanSlucaj($event,this.idPacijent).subscribe(
                  //Dohvaćam odgovor
                  (odgovor) => {
                      console.log(odgovor);
                      //Popuni polja povijesti bolesti sa rezultatima sa servera
                      this.razlogDolaska.patchValue(odgovor[0].razlogDolaska);
                      this.anamneza.patchValue(odgovor[0].anamneza);
                      this.status.patchValue(odgovor[0].statusPacijent);
                      this.nalaz.patchValue(odgovor[0].nalaz);
                      this.terapija.patchValue(odgovor[0].terapija);
                      this.preporukaLijecnik.patchValue(odgovor[0].preporukaLijecnik);
                      this.napomena.patchValue(odgovor[0].napomena);
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
                      this.primarnaDijagnoza.setValue(this.primarnaDijagnozaPovijestBolesti);
                      //Postavljam vrijednost naziva sekundarnih dijagnoza na vrijednosti koje sam dobio sa servera
                      this.sekundarnaDijagnoza.setValue(this.sekundarnaDijagnozaPovijestBolesti);
                      //Zatvaram prozor povijesti bolesti
                      this.otvorenPovijestBolesti = false;
                      //Omogućavam vidljivost gumba za poništavanje povezanog slučaja
                      this.ponistiPovezaniSlucaj = true;
                      //Postavljam vrijednost checkboxa "PovezanSlucaj" na true
                      this.povezanSlucaj.setValue(true);
                      //Onemogućavam mijenjanje stanja checkboxa "Povezan slučaj"
                      this.povezanSlucaj.disable();
                      //Resetiram checkbox novog slučaja da ne ostane da su oba true
                      this.noviSlucaj.reset();
                  }
              );
          }
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

      //Metoda koja se izvodi kada korisnik klikne "Izađi"
      onClose(){
          //Zatvori prozor poruke
          this.response = false;
      }

      //Metoda koja se poziva kada korisnik klikne button "Poveži povijest bolesti"
      onPoveziPovijestBolesti(){
          //Otvori prozor sa povijestima bolesti ovog pacijenta
          this.otvorenPovijestBolesti = true;
      }
      //Metoda koja se poziva kada korisnik klikne "Izađi" u prozoru povezanog povijesti bolesti
      onClosePovezanPovijestBolesti(){
          //Izađi iz prozora
          this.otvorenPovijestBolesti = false;
      }

      onPoveziNalaz(){
          console.log("tu sam");
      }

      onPoveziTerapija(){
          console.log("tu sam terapija");
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

      //Ova metoda se poziva kada se komponenta uništi
      ngOnDestroy(){
          //Ako postoji pretplata
          if(this.subsResolver){
              //Izađi iz pretplate
              this.subsResolver.unsubscribe();
          }
          //Ako postoji pretplata
          if(this.subsOtvoreniSlucaj){
            //Izađi iz pretplate
            this.subsOtvoreniSlucaj.unsubscribe();
          }
          //Ako postoji pretplata
          if(this.subsPrimarnaDijagnoza){
            //Izađi iz pretplate
            this.subsPrimarnaDijagnoza.unsubscribe();
          }
          //Ako postoji pretplata
          if(this.subsAktivniLijecnik){
            //Izađi iz pretplate
            this.subsAktivniLijecnik.unsubscribe();
          }
          //Ako postoji pretplata
          if(this.subsZavrsenPregled){
            //Izađi iz pretplate
            this.subsZavrsenPregled.unsubscribe();
          }
          //Ako postoji pretplata
          if(this.subsSubmit){
            //Izađi iz pretplate
            this.subsSubmit.unsubscribe();
          }
          //Ako postoji pretplata
          if(this.subsPovezanaPovijestBolesti){
            //Izađi iz pretplate
            this.subsPovezanaPovijestBolesti.unsubscribe();
          }
          //Praznim Subject završenog pregleda
          this.obradaService.zavrsenPregled.next(null);
      }

      //Kreiram gettere
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
