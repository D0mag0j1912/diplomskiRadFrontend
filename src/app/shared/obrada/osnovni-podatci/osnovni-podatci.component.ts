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
import * as Handler from './osnovni-podatci-handler';

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
    //Polje za bračna stanja
    bracnaStanja: BracnoStanje[] = [];
    //Polje za radne statuse
    radniStatusi: RadniStatus[] = [];
    //Polje za statuse pacijenta
    statusiPacijenta: StatusPacijent[] = [];
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
              //Kreiram svoju formu:
              this.forma = new FormGroup({
                'ime': new FormControl(this.isPodatciAktivni ? this.pacijent.ime : null, this.isPodatciAktivni ? [Validators.required,Handler.validacijaImePrezime(this.abeceda)] : []),
                'prezime': new FormControl(this.isPodatciAktivni ? this.pacijent.prezime : null, this.isPodatciAktivni ? [Validators.required,Handler.validacijaImePrezime(this.abeceda)] : []),
                'datRod': new FormControl(this.isPodatciAktivni ? this.pacijent.datRod: null, this.isPodatciAktivni ? [Validators.required,Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)] : []),
                'adresa': new FormControl(this.isPodatciAktivni ? this.pacijent.adresa: null, this.isPodatciAktivni ? [Validators.required] : []),
                'oib': new FormControl(this.isPodatciAktivni ? this.pacijent.oib: null, this.isPodatciAktivni ? [Validators.required, Validators.pattern("^\\d{11}$")] : []),
                'email': new FormControl(this.isPodatciAktivni ? this.pacijent.email: null, this.isPodatciAktivni ? [Validators.required, Validators.email] : []),
                'spol': new FormControl(this.isPodatciAktivni ? this.pacijent.spol: null,this.isPodatciAktivni ? [Validators.required] : []),
                'pbr': new FormControl(this.isPodatciAktivni ? this.pacijentMjesto.pbrMjesto: null, this.isPodatciAktivni ? [Validators.required, Handler.isValidPostanskiBroj(this.mjesta)] : []),
                'mjesto': new FormControl(this.isPodatciAktivni ? this.pacijentMjesto.nazivMjesto: null, this.isPodatciAktivni ? [Handler.isValidMjesto(this.mjesta)] : []),
                'mobitel': new FormControl(this.isPodatciAktivni ? this.pacijent.mobitel: null, this.isPodatciAktivni ? [Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)] : []),
                'bracnoStanje': new FormControl(this.isPodatciAktivni ? this.pacijent.bracnoStanje: null, this.isPodatciAktivni ? Handler.isValidBracnoStanje(this.bracnaStanja) : null),
                'radniStatus': new FormControl(this.isPodatciAktivni ? this.pacijent.radniStatus: null,this.isPodatciAktivni ? Handler.isValidRadniStatus(this.radniStatusi) : null),
                'status': new FormControl(this.isPodatciAktivni ? this.pacijent.status: null, this.isPodatciAktivni ? [Validators.required, Handler.isValidStatusPacijent(this.statusiPacijenta)] : null)
              }, {validators: this.isPodatciAktivni ? Handler.isValidKombinacija(this.mjesta) : null});
          }),
          takeUntil(this.pretplateSubject)
      ).subscribe();


      //Ako je pacijent aktivan
      if(this.isPodatciAktivni){

          const combined = merge(
              //Pretplaćivam se na promjene u poštanskom broju
              this.pbr.valueChanges.pipe(
                  tap(
                      (value: number) => {
                          console.log(value);
                          //Ako je form control ispravan
                          if(this.forma.get('pbr').valid){
                              //Pozivam metodu
                              Handler.pbrToNazivMjesto(value, this.mjesta, this.forma);
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
              //Pretplaćivam se na promjene u nazivu mjesta
              this.mjesto.valueChanges.pipe(
                  tap(value => {
                      if(this.mjesto.valid){
                          Handler.nazivMjestoToPbr(this.forma,this.mjesta,value);
                      }
                  }),
                  takeUntil(this.pretplateSubject)
              ),
              //Pretplaćivam se na završetak pregleda
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


    //Metoda koja se poziva kada korisnik klikne "Potvrdi osnovne podatke"
    onSubmit(){

        //Ako forma nije valjana
        if(!this.forma.valid){
          return;
        }
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
