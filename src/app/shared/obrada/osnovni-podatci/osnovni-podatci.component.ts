import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { BracnoStanje } from 'src/app/shared/modeli/bracnoStanje.model';
import { Mjesto } from 'src/app/shared/modeli/mjesto.model';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';
import { RadniStatus } from 'src/app/shared/modeli/radniStatus.model';
import { StatusPacijent } from 'src/app/shared/modeli/statusPacijent.model';
import { ObradaService } from '../obrada.service';
import { OsnovniPodatciService } from './osnovni-podatci.service';
@Component({
  selector: 'app-osnovni-podatci',
  templateUrl: './osnovni-podatci.component.html',
  styleUrls: ['./osnovni-podatci.component.css']
})
export class OsnovniPodatciComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Kreiram svoje polje abecede
    abeceda: string[] = ["A","B","C","Č","Ć","D","Dž","Đ","E","F","G","H","I","J","K","L","Lj","M","N","Nj","O","P","R","S","Š","T","U","V","Z","Ž",
                        "a","b","c","č","ć","d","dž","đ","e","f","g","h","i","j","k","l","lj","m","n","nj","o","p","r","s","š","t","u","v","z","ž"];
    //Oznaka jesu li osnovni podatci aktivni
    isPodatciAktivni: boolean = false;
    //Označavam je li ima odgovora servera
    response: boolean = false;
    //Spremam odgovor servera
    responsePoruka: string = null;
    //Kreiram svoju formu
    forma: FormGroup;
    //Polje za mjesta
    mjesta: Mjesto[] = [];
    naziviMjesta: string[] = [];
    pbrMjesta: number[] = [];
    //Polje za bračna stanja
    bracnaStanja: BracnoStanje[] = [];
    naziviBracnihStanja: string[] = [];
    //Polje za radne statuse
    radniStatusi: RadniStatus[] = [];
    naziviRadniStatusi: string[] = [];
    //Polje za statuse pacijenta
    statusiPacijenta: StatusPacijent[] = [];
    naziviStatusaPacijenata: string[] = [];
    //Objekt tipa Pacijent u kojega ću spremati osnovne podatke pacijenta
    pacijent: Pacijent;
    //Spremam pbr i naziv mjesta u objekt tipa "Mjesto"
    pacijentMjesto: Mjesto;
    //Spremam ID pacijenta
    idPacijent: number;

    constructor(
      //Dohvaćam trenutni route
      private route: ActivatedRoute,
      //Dohvaćam servis osnovnih podataka
      private osnovniPodatciService: OsnovniPodatciService,
      //Dohvaćam servis obrade
      private obradaService: ObradaService
    ) { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit(){

      //Dohvaćam podatke od Resolvera te se pretplaćujem na njega
      this.route.data.pipe(
        tap(
          //Dohvaćam podatke
          (response : {podatci: any, pacijenti: Pacijent | any}) => {
            //Inicijaliziram praznu varijablu koja služi za pohranu objekata tipa "Bracno stanje"
            let brStanje;
            //Prolazim JS objektom bračnih stanja 
            for(const stanje of response.podatci.bracnaStanja){
                //Kreiram objekte tipa "BracnoStanje"
                brStanje = new BracnoStanje(stanje);
                //Dodavam objekte u polje bračnih stanja
                this.bracnaStanja.push(brStanje);
            }
            //Inicijaliziram praznu varijablu koja služi za pohranu objekata tipa "Mjesto"
            let objektMjesto;
            //Prolazim JS objektom mjesta
            for(const mj of response.podatci.mjesta){
                //Kreiram objekte tipa "Mjesto"
                objektMjesto = new Mjesto(mj);
                //Nadodavam ih u polje
                this.mjesta.push(objektMjesto);
            }
            //Kreiram praznu varijablu u koju ću spremati objekte tipa "RadniStatus"
            let objektRadniStatus;
            for(const status of response.podatci.radniStatusi){
                //Za svaki odgovor servera kreiram jedan JS objekt
                objektRadniStatus = new RadniStatus(status);
                //Nadodavam ih u polje
                this.radniStatusi.push(objektRadniStatus);
            }
            //Kreiram praznu varijablu u koju ću spremiti objekte tipa "StatusPacijent"
            let objektStatusPacijent;
            //Prolazim kroz sve odgovore servera
            for(const status of response.podatci.statusiPacijent){
                //Kreiram objekte tipa "StatusPacijent"
                objektStatusPacijent = new StatusPacijent(status);
                //Nadodavam ih u polje
                this.statusiPacijenta.push(objektStatusPacijent);
            }
            //Ako je server uspješno vratio pacijenta, a ne grešku
            if(response.pacijenti["success"] !== "false"){
                //Označavam da su podatci aktivni
                this.isPodatciAktivni = true;
                //Podatke iz Resolvera za pacijenta spremam u svoje polje za podatke pacijenta
                this.pacijent = new Pacijent(response.pacijenti[0]);
                this.pacijentMjesto = new Mjesto(response.pacijenti[0]);
                //Spremam ID pacijenta
                this.idPacijent = this.pacijent.id;
            }
            console.log(this.isPodatciAktivni);
            //Sve nazive mjesta stavljam u posebno polje zbog validacije
            for(let mjesto of this.mjesta){
              this.naziviMjesta.push(mjesto["nazivMjesto"]);
            }
            //Sve poštanske brojeve stavljam u posebno polje zbog validacije
            for(let pbr of this.mjesta){
              this.pbrMjesta.push(pbr["pbrMjesto"]);
            }
            //Sve nazive bračnih stanja stavljam u posebno polje zbog validacije
            for(let stanje of this.bracnaStanja){
              this.naziviBracnihStanja.push(stanje["nazivBracnoStanje"]);
            }
            //Sve nazive radnih statusa stavljam u posebno polje zbog validacije
            for(let status of this.radniStatusi){
              this.naziviRadniStatusi.push(status["nazivRadniStatus"]);
            }
            //Sve nazive statusa pacijenata stavljam u posebno polje zbog validacije
            for(let status of this.statusiPacijenta){
              this.naziviStatusaPacijenata.push(status["nazivStatusPacijent"]);
            }
            console.log(this.isPodatciAktivni);
            //Kreiram svoju formu:
            this.forma = new FormGroup({
              'ime': new FormControl(this.isPodatciAktivni ? this.pacijent.ime : null, this.isPodatciAktivni ? [Validators.required,this.validacijaImePrezime.bind(this)] : []),
              'prezime': new FormControl(this.isPodatciAktivni ? this.pacijent.prezime : null, this.isPodatciAktivni ? [Validators.required,this.validacijaImePrezime.bind(this)] : []),
              'datRod': new FormControl(this.isPodatciAktivni ? this.pacijent.datRod: null, this.isPodatciAktivni ? [Validators.required,Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)] : []),
              'adresa': new FormControl(this.isPodatciAktivni ? this.pacijent.adresa: null, this.isPodatciAktivni ? [Validators.required] : []),
              'oib': new FormControl(this.isPodatciAktivni ? this.pacijent.oib: null, this.isPodatciAktivni ? [Validators.required, Validators.pattern("^\\d{11}$")] : []),
              'email': new FormControl(this.isPodatciAktivni ? this.pacijent.email: null, this.isPodatciAktivni ? [Validators.required, Validators.email] : []),
              'spol': new FormControl(this.isPodatciAktivni ? this.pacijent.spol: null,this.isPodatciAktivni ? [Validators.required] : []),
              'pbr': new FormControl(this.isPodatciAktivni ? this.pacijentMjesto.pbrMjesto: null, this.isPodatciAktivni ? [Validators.required, this.isValidPostanskiBroj.bind(this)] : []),
              'mjesto': new FormControl(this.isPodatciAktivni ? this.pacijentMjesto.nazivMjesto: null, this.isPodatciAktivni ? [this.isValidMjesto.bind(this)] : []),
              'mobitel': new FormControl(this.isPodatciAktivni ? this.pacijent.mobitel: null, this.isPodatciAktivni ? [Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)] : []),
              'bracnoStanje': new FormControl(this.isPodatciAktivni ? this.pacijent.bracnoStanje: null, this.isPodatciAktivni ? this.isValidBracnoStanje.bind(this) : null),
              'radniStatus': new FormControl(this.isPodatciAktivni ? this.pacijent.radniStatus: null,this.isPodatciAktivni ? this.isValidRadniStatus.bind(this) : null),
              'status': new FormControl(this.isPodatciAktivni ? this.pacijent.status: null, this.isPodatciAktivni ? [Validators.required, this.isValidStatusPacijent.bind(this)] : null)
            }, {validators: this.isPodatciAktivni ? this.isValidKombinacija.bind(this) : null});
          }
        ),
        takeUntil(this.pretplateSubject)
      ).subscribe(); 


      //Ako je pacijent aktivan
      if(this.isPodatciAktivni){ 

          const combined = merge(
              this.forma.get('pbr').valueChanges.pipe(
                  tap(
                      (value: number) => {
                          console.log(value);
                          //Ako je form control ispravan
                          if(this.forma.get('pbr').valid){
                              //Pozivam metodu
                              this.pbrToNazivMjesto(value);
                          }
                          //Ako nije ispravan
                          else{
                            //Treba pisati "Odaberite mjesto stanovanja"
                            this.forma.get('mjesto').patchValue(null,{emitEvent: false});
                          }
                      }
                  ),
                  takeUntil(this.pretplateSubject)
              ),
              this.obradaService.obsZavrsenPregled.pipe(
                  tap(
                      (podatci) => {
                        //Ako je pregled završen
                        if(podatci){
                          //Označavam da pacijent više nije aktivan
                          this.isPodatciAktivni = false;
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
                  ),
                  takeUntil(this.pretplateSubject)
              )
          ).subscribe();
        } 
      
    }

    //Metoda koja automatski upisuje naziv mjesta koji odgovara upisanom poštanskom broju
    pbrToNazivMjesto(value: number){
      //Prolazim kroz polje sa poštanskim brojevima i nazivima mjesta
      for(let pbr of this.mjesta){
        //Ako je vrijednost polja poštanskog broja jednaka vrijednost poštanskog broja u polju
        if(value === pbr["pbrMjesto"]){
          //Postavi naziv mjesta na naziv koji odgovora tom poštanskom broju
          this.forma.get('mjesto').setValue(pbr["nazivMjesto"]);
        }
      }
      this.forma.get('mjesto').updateValueAndValidity();
    }

    //Metoda koja provjerava je li mjesto ispravno uneseno tj. je li unesena vrijednost koja nije dio polja mjesta
    isValidMjesto(control: FormControl): {[key: string]: boolean}{
      //Ako vrijednost mjesta koje je korisnik unio nije dio polja naziva mjesta (znači vraća -1 ako nije dio polja)
      if(this.naziviMjesta.indexOf(control.value) === -1){
        return {'mjestaIsForbidden': true};
      }
      //Ako je vrijednost naziva mjesta ok, vraćam null
      return null;
    }
    //Metoda koja provjerava je li bračno stanje ispravno uneseno tj. je li unesena vrijednost koja nije dio polja bračnog stanja
    isValidBracnoStanje(control: FormControl): {[key: string]: boolean}{
      //Ako vrijednost bračnog stanja koje je korisnik unio nije dio polja naziva bračnih stanja (znači vraća -1 ako nije dio polja)
      if(this.naziviBracnihStanja.indexOf(control.value) === -1){
        return {'bracnaStanjaIsForbidden': true};
      }
      //Ako je vrijednost naziva mjesta ok, vraćam null
      return null;
    }
    //Metoda koja provjerava je li radni status ispravno unesen tj. je li unesena vrijednost koja nije dio polja radnih statusa
    isValidRadniStatus(control: FormControl): {[key: string]: boolean}{
      //Ako vrijednost radnog statusa koje je korisnik unio nije dio polja naziva radnih statusa (znači vraća -1 ako nije dio polja)
      if(this.naziviRadniStatusi.indexOf(control.value) === -1){
        return {'radniStatusIsForbidden': true};
      }
      //Ako je vrijednost naziva mjesta ok, vraćam null
      return null;
    }
    //Metoda koja provjerava je li status pacijenta ispravno unesen tj. je li unesena vrijednost koja nije dio polja statusa pacijenata
    isValidStatusPacijent(control: FormControl): {[key: string]: boolean}{
      //Ako vrijednost statusa pacijenta koje je korisnik unio nije dio polja naziva statusa pacijenata (znači vraća -1 ako nije dio polja)
      if(this.naziviStatusaPacijenata.indexOf(control.value) === -1){
        return {'statusPacijentIsForbidden': true};
      }
      //Ako je vrijednost naziva mjesta ok, vraćam null
      return null;
    }
    //Metoda koja provjerava je li poštanski broj mjesta ispravno unesen tj. je li unesena vrijednost koja nije dio polja poštanskih brojeva
    isValidPostanskiBroj(control: FormControl): {[key: string]: boolean}{
      //Ako vrijednost poštanskog broja koje je korisnik unio nije dio polja poštanskih brojeva (znači vraća -1 ako nije dio polja)
      if(this.pbrMjesta.indexOf(control.value) === -1){
        return {'pbrIsForbidden': true};
      }
      //Ako je vrijednost naziva mjesta ok, vraćam null
      return null;
    }

    //Metoda koja provjerava točnost kombinacije poštanskog broja i naziva mjesta
    isValidKombinacija(form: FormGroup): {[key: string]: boolean}{
      //Prolazim kroz polje mjesta
      for(let mjesto of this.mjesta){
        //Ako je uneseni poštanski broj jednak onome u polju
        if(form.get('pbr').value === mjesto["pbrMjesto"]){
          //Ako uneseni naziv mjesta nije jednak nazivu mjesta za taj poštanski broj
          if(form.get('mjesto').value !== mjesto["nazivMjesto"]){
            return {'krivaKombinacija': true};
          }
        }
      }
      //Ako je kombinacija u redu, vraća null
      return null;
    }

    //Metoda koja provjerava je li ime i prezime ispravno uneseno
    validacijaImePrezime(control: FormControl): {[key: string]: boolean}{
      //Ako se vrijednost polja imena ili prezimena ne nalazi u polju abecede
      for(let i in control.value){
        if(this.abeceda.indexOf(control.value.charAt(i)) === -1){
          return {'neispravanZnak':true};
        }
      }
      return null;
    }


    //Metoda koja se poziva kada korisnik klikne "Potvrdi osnovne podatke"
    onSubmit(){
      
        //Ako forma nije valjana
        if(!this.forma.valid){
          return;
        }
        console.log(this.isPodatciAktivni);
        //Ako su podatci aktivni
        if(this.isPodatciAktivni){
            //Pretplaćujem se na odgovor servera 
            this.osnovniPodatciService.potvrdiOsnovnePodatke(this.idPacijent,this.ime.value,this.prezime.value,
              this.datRod.value,this.adresa.value,this.oib.value,
              this.email.value,this.spol.value,this.pbr.value,
              this.mobitel.value, this.bracnoStanje.value, 
              this.radniStatus.value,this.status.value).pipe(
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
        //Ako podatci nisu aktivni
        else{
            //Označavam da ima odgovora servera
            this.response = true;
            //Spremam odgovor servera
            this.responsePoruka = "Nema aktivnog pacijenta u obradi!";
        }
    }


    //Metoda koja se pokreće kada se zatvori prozor poruke
    onClose(){
      //Zatvori prozor
      this.response = false;
    }

    
    //Metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
      this.pretplateSubject.next(true);
      this.pretplateSubject.complete();
      //Praznim Subject da mi se ulazi u Subscription i dobiva informaciju da je pregled završen iako nije
      this.obradaService.zavrsenPregled.next(false);
    }

    //Definiram gettere za pojedine form controlove
    get ime(): FormControl{
      return this.forma.get('ime') as FormControl;
    }
    get prezime(): FormControl{
      return this.forma.get('prezime') as FormControl;
    }
    get datRod(): FormControl{
      return this.forma.get('datRod') as FormControl;
    }
    get adresa(): FormControl{
      return this.forma.get('adresa') as FormControl;
    }
    get oib(): FormControl{
      return this.forma.get('oib') as FormControl;
    }
    get email(): FormControl{
      return this.forma.get('email') as FormControl;
    }
    get spol(): FormControl{
      return this.forma.get('spol') as FormControl;
    }
    get pbr(): FormControl{
      return this.forma.get('pbr') as FormControl;
    }
    get mjesto(): FormControl{
      return this.forma.get('mjesto') as FormControl;
    }
    get mobitel(): FormControl{
      return this.forma.get('mobitel') as FormControl;
    }
    get bracnoStanje(): FormControl{
      return this.forma.get('bracnoStanje') as FormControl;
    }
    get radniStatus(): FormControl{
      return this.forma.get('radniStatus') as FormControl;
    }
    get status(): FormControl{
      return this.forma.get('status') as FormControl;
    }
}
