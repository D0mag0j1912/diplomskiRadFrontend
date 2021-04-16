import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, merge, of, Subject } from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { Obrada } from 'src/app/shared/modeli/obrada.model';
import { Pacijent } from '../modeli/pacijent.model';
import { ObradaService } from './obrada.service';
import * as ObradaValidations from './obrada-validations';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-obrada',
  templateUrl: './obrada.component.html',
  styleUrls: ['./obrada.component.css']
})
export class ObradaComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li postoji sljedeći pacijent koji čeka u čekaonici
    isSljedeciPacijent: boolean = false;
    //Oznaka je li prozor poruke aktivan
    response: boolean = false;
    //Spremam poruku prozora
    responsePoruka: string = null;
    //Oznaka je li prikazan prozor pretrage pacijenata
    isPretraga: boolean = false;
    //Oznaka je li ima aktivnog pacijenta
    isAktivan: boolean = false;
    //Kreiram svoju formu
    forma: FormGroup;
    //Kreiram svoju formu
    formaBMI: FormGroup;
    //Definiram broj trenutne stranice tablice 1
    stranica: number = 1;
    //Spremam podatke obrade trenutno aktivnog pacijenta
    trenutnoAktivniPacijent: Obrada;
    //Spremam osobne podatke trenutno aktivnog pacijenta
    pacijent: Pacijent;
    //Spremam sljedećeg pacijenta koji čeka na pregled
    sljedeciPacijent: string;
    //Spremam poruku sljedećeg pacijenta
    porukaSljedeciPacijent: string = null;
    //Oznaka je li pacijent naručen ili nije
    isNarucen: boolean = false;
    //Spremam vrijeme narudžbe
    narucenU: string = null;
    //Spremam poruku narudžbe
    porukaNarucen: string = null;
    //Spremam je li pacijent obrađen (u općim podatcima)
    isObradenOpciPodatci: boolean = false;
    //Spremam je li pacijent obrađen (povijest bolesti)
    isObradenPovijestBolesti: boolean = false;
    //Spremam je li korisnik prijavljen
    prijavljen: boolean = false;
    //Oznaka je li korisnik liječnik
    isLijecnik: boolean = false;
    //Oznaka je li korisnik medicinska sestra
    isMedSestra: boolean = false;
    //Spremam ID trenutno aktivnog pacijenta
    idTrenutnoAktivniPacijent: number;
    //Spremam vrijeme kada je liječnik/med.sestra obradio/la pacijenta
    vrijemeObradeLijecnik: string;
    vrijemeObradeMedSestra: string;
    //Spremam poruku da sam spremio BMI
    spremioBMI: string = null;

    constructor(
        //Dohvaćam trenutni route da dohvatim podatke
        private route: ActivatedRoute,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam login servis
        private loginService: LoginService,
        //Dohvaćam shared servis
        private sharedService: SharedService
    ) { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit() {

      //Kreiram svoju formu
      this.forma = new FormGroup({
        'ime': new FormControl(null),
        'prezime': new FormControl(null)
      }, {validators: this.atLeastOneRequired});

      //Pretplaćujem se na odgovore servera na traženje sljedećeg pacijenta koji čeka na pregled I na vrijeme narudžbe aktivnog pacijenta
      this.loginService.user.pipe(
          take(1),
          switchMap(user => {
              return combineLatest([
                this.obradaService.getSljedeciPacijent(user.tip),
                this.obradaService.getVrijemeNarudzbe(user.tip),
                this.loginService.user,
                this.route.data
              ]).pipe(
                  tap(podatci => {
                      console.log(podatci);
                      //Ako je server vratio uspješnu poruku
                      if(podatci[0]["success"] != "false"){
                        //Označavam da ima sljedećeg pacijenta
                        this.isSljedeciPacijent = true;
                        //Spremam sljedećeg pacijenta
                        this.sljedeciPacijent = podatci[0][0].imePacijent + " " + podatci[0][0].prezPacijent;
                      }
                      else{
                        //Spremam neuspješnu poruku
                        this.porukaSljedeciPacijent = podatci[0]["message"];
                      }
                      //Ako je pacijent naručen na taj dan
                      if(podatci[1]["success"] != "false"){
                          //Označavam da je pacijent naručen
                          this.isNarucen = true;
                          //Spremam mu vrijeme narudžbe
                          this.narucenU = podatci[1][0]["Vrijeme"];
                      }
                      //Ako pacijent nije naručen za taj dan
                      else{
                          //Spremam poruku da je nenaručen
                          this.porukaNarucen = podatci[1]["message"];
                      }
                      //Ako korisnički objekt nije null
                      if(podatci[2] != null){
                          if(podatci[2]["tip"] === "lijecnik"){
                              //Označavam da je korisnik liječnik
                              this.isLijecnik = true;
                          }
                          else{
                              //Označavam da je korisnik medicinska sestra
                              this.isMedSestra = true;
                          }
                      }
                      //Ako je prijavljeni korisnik "lijecnik":
                      if(this.isLijecnik){
                          //Ako je server vratio da ima pacijenta u obradi
                          if(podatci[3]["pacijent"]["success"] !== "false"){
                              //Označavam da je pacijent aktivan
                              this.isAktivan = true;
                              //Spremam podatke trenutno aktivnog pacijenta
                              this.trenutnoAktivniPacijent = new Obrada(podatci[3].pacijent[0]);
                              //Šaljem ID obrade komponenti "PrikaziPovijestBolestiComponent"
                              this.obradaService.podatciObrada.next(this.trenutnoAktivniPacijent.idObrada);
                              //ID obrade spremam u Local Storage
                              localStorage.setItem("idObrada",JSON.stringify(this.trenutnoAktivniPacijent.idObrada));
                              this.pacijent = new Pacijent(podatci[3].pacijent[0]);
                              //Spremam ID trenutno aktivnog pacijenta kojega dobivam iz metode obrade
                              this.idTrenutnoAktivniPacijent = this.trenutnoAktivniPacijent.idPacijent;
                          }
                          //Ako je server vratio da NEMA pacijenta u obradi
                          else if(podatci[3]["pacijent"]["success"] === "false"){
                              //Označavam da pacijent nije aktivan
                              this.isAktivan = false;
                              //U Subject stavljam informaciju da NE POSTOJI ID obrade
                              this.obradaService.podatciObrada.next(null);
                              //Local Storage također obavješavam da NE POSTOJI ID obrade
                              localStorage.setItem("idObrada",JSON.stringify(null));
                          }
                      }
                      //Ako je prijavljeni korisnik "sestra":
                      else if(this.isMedSestra){
                          //Ako je server vratio da ima pacijenta u obradi
                          if(podatci[3]["pacijent"]["pacijent"]["success"] !== "false"){
                              //Kreiram BMI formu
                              this.formaBMI = new FormGroup({
                                  'visina': new FormControl(null, [Validators.pattern("^[0-9]*$"), ObradaValidations.visinaValidator()]),
                                  'tezina': new FormControl(null, [Validators.pattern("^[0-9]*$"), ObradaValidations.tezinaValidator()]),
                                  'bmi': new FormControl(null)
                              });
                              //Onemogućavam unos u polje BMI
                              this.bmi.disable({emitEvent: false});
                              //Označavam da je pacijent aktivan
                              this.isAktivan = true;
                              //Spremam podatke trenutno aktivnog pacijenta
                              this.trenutnoAktivniPacijent = new Obrada(podatci[3].pacijent.pacijent[0]);
                              //Šaljem ID obrade komponenti "PrikaziPovijestBolestiComponent"
                              this.obradaService.podatciObrada.next(this.trenutnoAktivniPacijent.idObrada);
                              //ID obrade spremam u Local Storage
                              localStorage.setItem("idObrada",JSON.stringify(this.trenutnoAktivniPacijent.idObrada));
                              this.pacijent = new Pacijent(podatci[3].pacijent.pacijent[0]);
                              //Spremam ID trenutno aktivnog pacijenta kojega dobivam iz metode obrade
                              this.idTrenutnoAktivniPacijent = this.trenutnoAktivniPacijent.idPacijent;
                          }
                          //Ako je server vratio da NEMA pacijenta u obradi
                          else if(podatci[3]["pacijent"]["pacijent"]["success"] === "false"){
                              //Označavam da pacijent nije aktivan
                              this.isAktivan = false;
                              //U Subject stavljam informaciju da NE POSTOJI ID obrade
                              this.obradaService.podatciObrada.next(null);
                              //Local Storage također obavješavam da NE POSTOJI ID obrade
                              localStorage.setItem("idObrada",JSON.stringify(null));
                          }
                      }
                  }),
                  switchMap(() => {
                      //Ako je logirana medicinska sestra
                      if(this.isMedSestra){
                          //Ako je pacijent aktivan
                          if(this.isAktivan){
                              //Tražim informaciju je li liječnik obradio pacijenta
                              return this.obradaService.getObradenPovijestBolesti(this.idTrenutnoAktivniPacijent).pipe(
                                  tap(odgovor => {
                                      if(odgovor[0].Vrijeme !== null){
                                          //Označavam da je liječnik potvrdio povijest bolesti ovog pacijenta
                                          this.isObradenPovijestBolesti = true;
                                          //Spremam vrijeme obrade
                                          this.vrijemeObradeLijecnik = odgovor[0].Vrijeme;
                                      }
                                      else{
                                          //Označavam da liječnik nije potvrdio povijest bolesti ovog pacijenta
                                          this.isObradenPovijestBolesti = false;
                                      }
                                  }),
                                  takeUntil(this.pretplateSubject)
                              );
                          }
                          //Ako pacijent nije aktivan
                          else{
                              return of(null).pipe(
                                takeUntil(this.pretplateSubject)
                              );
                          }
                      }
                      //Ako je logiran liječnik
                      else if(this.isLijecnik){
                          //Ako je pacijent aktivan
                          if(this.isAktivan){
                              //Tražim informaciju je li medicinska sestra obradila pacijenta
                              return this.obradaService.getObradenOpciPodatci(this.idTrenutnoAktivniPacijent).pipe(
                                  tap(odgovor => {
                                      if(odgovor[0].Vrijeme !== null){
                                          //Označavam da je sestra potvrdila opće podatke ovog pacijenta
                                          this.isObradenOpciPodatci = true;
                                          //Spremam vrijeme obrade
                                          this.vrijemeObradeMedSestra = odgovor[0].Vrijeme;
                                      }
                                      else{
                                          //Označavam da sestra NIJE potvrdila opće podatke pacijenta danas
                                          this.isObradenOpciPodatci = false;
                                      }
                                  }),
                                  takeUntil(this.pretplateSubject)
                              );
                          }
                          //Ako pacijent nije aktivan
                          else{
                              return of(null).pipe(
                                  takeUntil(this.pretplateSubject)
                              );
                          }
                      }
                  }),
                  //Pretplaćivam se na promjene u poljima visine i težine
                  switchMap(() => {
                      //Ako je pacijent aktivan te ako je korisnik med. sestra
                      if(this.isAktivan && this.isMedSestra){
                          return merge(
                              this.visina.valueChanges.pipe(
                                  switchMap(() => {
                                      //Pozivam metodu za računanje BMI
                                      return this.izracunajBMI(this.visina.value, this.tezina.value);
                                  }),
                                  takeUntil(this.pretplateSubject)
                              ),
                              this.tezina.valueChanges.pipe(
                                  switchMap(() => {
                                      //Pozivam metodu za računanje BMI
                                      return this.izracunajBMI(this.visina.value, this.tezina.value);
                                  }),
                                  takeUntil(this.pretplateSubject)
                              )
                          );
                      }
                      else{
                          return of(null).pipe(
                              takeUntil(this.pretplateSubject)
                          );
                      }
                  }),
                  takeUntil(this.pretplateSubject)
              );
          }),
          takeUntil(this.pretplateSubject)
      ).subscribe();
    }

    //Izračunaj BMI
    izracunajBMI(visina: string, tezina: string){
        //Ako su prazna polja visina ili težine
        if(!visina || !tezina){
            //Restart polje BMI-a
            this.bmi.patchValue(null, {emitEvent: false});
            return of(null).pipe(
                tap(() => {
                    //Restartam BMI
                    this.spremioBMI = null;
                }),
                takeUntil(this.pretplateSubject)
            );
        }
        //Računam BMI samo ako su visina i težina ispravno unesene
        if(this.visina.valid
            && this.tezina.valid
            && visina
            && tezina){
              //Računam BMI
              let bmi = +this.tezina.value/((+visina/100)**2);
              this.bmi.patchValue(bmi.toFixed(2),{emitEvent: false});
              //Vraća Observable u kojemu se nalazi odgovor servera na spremanje BMI-a
              return this.obradaService.spremiBMI(
                  this.visina.value,
                  this.tezina.value,
                  this.bmi.value,
                  this.idTrenutnoAktivniPacijent,
                  this.trenutnoAktivniPacijent.idObrada).pipe(
                  tap(odgovor => {
                      //Ako je odgovor servera true:
                      if(odgovor === true){
                          //Prikazivam poruku da sam spremio bmi
                          this.spremioBMI = 'BMI spremljen!';
                          //Naplaćujem računanje BMI-a
                          this.sharedService.postaviNovuCijenu(10, this.isMedSestra ? 'sestra' : 'lijecnik');
                      }
                      else{
                          this.spremioBMI = null;
                      }
                  }),
                  takeUntil(this.pretplateSubject)
              );
        }
        //Ako unosi nisu ispravni
        else{
            //Resetiram polje BMI-a
            this.bmi.patchValue(null, {emitEvent: false});
            return of(null).pipe(
                tap(() => {
                    //Restartam BMI
                    this.spremioBMI = null;
                }),
                takeUntil(this.pretplateSubject)
            );
        }
    }

    //Metoda koja se pokreće kada korisnik klikne "Dodaj u čekaonicu" u prozoru pretrage pacijenta
    onSljedeciPacijent(){
        //Pretplaćujem se na odgovor servera ima li sljedećeg pacijenta koji ima status "Čeka na pregled"
        this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                return this.obradaService.getSljedeciPacijent(user.tip);
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe(
            //Dohvaćam pacijenta ili poruku da nema pacijenta
            (odgovor) => {
              //Ako ima SLJEDEĆEG pacijenta koji čeka na pregled
              if(odgovor["success"] !== "false"){
                  //Označavam da ima sljedećeg pacijenta
                  this.isSljedeciPacijent = true;
                  //Spremam sljedećeg pacijenta
                  this.sljedeciPacijent = odgovor[0].imePacijent + " " + odgovor[0].prezPacijent;
                  console.log(this.sljedeciPacijent);
              }
              else{
                  //Spremam neuspješnu poruku
                  this.porukaSljedeciPacijent = odgovor["message"];
              }
            }
        );
    }

    //Metoda koja se izvršava kada korisnik klikne button "Završi pregled"
    zavrsiPregled(){
        //Resetiram Subject u kojemu se nalazi ID obrade kojega šaljem komponenti "PrikazPovijestiBolesti"
        this.obradaService.podatciObrada.next(null);
        //U Local Storage stavljam novu vrijednost ID-a obrade
        localStorage.setItem("idObrada",JSON.stringify(null));
        //Dohvaćam tip prijavljenog korisnika te tu informaciju predavam metodama
        this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                return combineLatest([
                    this.obradaService.editPatientStatus(this.trenutnoAktivniPacijent.idObrada,user.tip,this.trenutnoAktivniPacijent.idPacijent),
                    this.obradaService.getPatientProcessing(user.tip)
                ]).pipe(
                    takeUntil(this.pretplateSubject)
                )
            }),
            takeUntil(this.pretplateSubject)
        //Pretplaćivam se na odgovore servera
        ).subscribe(
            () => {
                //Označavam da pacijent više nije aktivan
                this.isAktivan = false;
                //Stavljam vrijednost u Subject da je završen pregled
                this.obradaService.zavrsenPregled.next(true);
            }
        );
    }

    //Dohvaćam ime i prezime pacijenta
    getImePrezime(){
      return this.pacijent.ime + ' ' + this.pacijent.prezime;
    }
    //Dohvaćam datum rođenja pacijenta
    getDatRod(){
      return this.pacijent.datRod;
    }
    //Dohvaćam adresu pacijenta
    getAdresa(){
      return this.pacijent.adresa;
    }
    //Dohvaćam MBO pacijenta
    getMBO(){
        return this.pacijent.mbo;
    }

    //Custom validator koji provjerava je li barem jedno od polja imena ili prezimena uneseno
    atLeastOneRequired(group : FormGroup) : {[s:string ]: boolean} {
      if (group) {
        if(group.controls['ime'].value || group.controls['prezime'].value) {
          return null;
        }
      }
      return {'error': true};
    }

    //Ova metoda se pokreće kada korisnik klikne button "Pretraži"
    onSubmit(){

      //Ako forma nije ispravna
      if(!this.forma.valid){
        return;
      }
      //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera
      this.obradaService.getPatients(this.ime.value,this.prezime.value,this.stranica).pipe(
          tap(
            (odgovor) => {
              //Ako je odgovor negativan, tj. nema pacijenata
              if(odgovor["success"] == "false"){
                //Označavam da ima poruke servera
                this.response = true;
                //Spremam poruku servera u prozor
                this.responsePoruka = odgovor["message"];
                //Resetiram formu
                this.forma.reset();
              }
              //Ako je odgovor pozitivan, tj. ima pacijenata
              else{
                //Pošalji Subjectu uneseno ime ili prezime pacijenta i broj početne stranice tablice pacijenata
                this.obradaService.imePrezimePacijent.next({ime: this.ime.value, prezime: this.prezime.value,stranica: this.stranica});
                //Otvori tablicu pacijenata
                this.isPretraga = true;
                //Restiraj formu
                this.forma.reset();
              }
            }
          ),
          takeUntil(this.pretplateSubject)
      ).subscribe();
    }

    //Kada korisnik klikne button "Izađi" na prozoru poruke ili negdje izvan njega
    onClose(){
      //Zatvori prozor
      this.response = false;
    }

    //Kada korisnik klikne button "Izađi" na prozoru tablice pacijenata
    onCloseTablica(){
      //Zatvori prozor
      this.isPretraga = false;
    }

    //Getteri za form controlove
    get ime(): FormControl{
        return this.forma.get('ime') as FormControl;
    }
    get prezime(): FormControl{
        return this.forma.get('prezime') as FormControl;
    }
    get visina(): FormControl{
        if(this.isMedSestra){
            return this.formaBMI.get('visina') as FormControl;
        }
        else{
            return;
        }
    }
    get tezina(): FormControl{
        if(this.isMedSestra){
            return this.formaBMI.get('tezina') as FormControl;
        }
        else{
            return;
        }
    }
    get bmi(): FormControl{
        if(this.isMedSestra){
            return this.formaBMI.get('bmi') as FormControl;
        }
        else{
            return;
        }
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}
