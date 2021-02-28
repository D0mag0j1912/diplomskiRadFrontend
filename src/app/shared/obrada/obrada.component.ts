import { Time } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, forkJoin, Subject } from 'rxjs';
import { concatMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { PovijestBolestiService } from 'src/app/lijecnik/povijest-bolesti/povijest-bolesti.service';
import { LoginService } from 'src/app/login/login.service';
import { Obrada } from 'src/app/shared/modeli/obrada.model';
import { HeaderService } from '../header/header.service';
import { Pacijent } from '../modeli/pacijent.model';
import { ObradaService } from './obrada.service';

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
    vrijemeObradeLijecnik: Time;
    vrijemeObradeMedSestra: Time;
    constructor(
        //Dohvaćam trenutni route da dohvatim podatke
        private route: ActivatedRoute,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam login servis
        private loginService: LoginService,
        //Dohvaćam header service
        private headerService: HeaderService,
        //Dohvaćam servis povijesti bolesti
        private povijestBolestiService: PovijestBolestiService
    ) { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit() {

      //Kreiram svoju formu
      this.forma = new FormGroup({
        'ime': new FormControl(null),
        'prezime': new FormControl(null)
      }, {validators: this.atLeastOneRequired});

      //Pretplaćujem se na odgovore servera na traženje sljedećeg pacijenta koji čeka na pregled I na vrijeme narudžbe aktivnog pacijenta
      this.headerService.tipKorisnikaObs.pipe(
          take(1),
          switchMap(podatci => {
              return combineLatest([
                this.obradaService.getSljedeciPacijent(podatci),
                this.obradaService.getVrijemeNarudzbe(podatci),
                this.loginService.user,
                this.route.data
              ]).pipe(
                  concatMap(podatci => {
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
                      //Kreiram pomoćno polje u koje ću stavljat infomacije (Observableove) je li pacijent obrađen
                      let polje = [];
                      //Ako je prijavljeni korisnik "lijecnik":
                      if(this.isLijecnik){
                          //Ako je server vratio da ima pacijenta u obradi
                          if(podatci[3]["pacijent"]["success"] !== "false"){
                              //Označavam da je pacijent aktivan
                              this.isAktivan = true;
                              //Spremam podatke trenutno aktivnog pacijenta
                              this.trenutnoAktivniPacijent = new Obrada(podatci[3].pacijent[0]);
                              this.pacijent = new Pacijent(podatci[3].pacijent[0]);
                              //Spremam ID trenutno aktivnog pacijenta kojega dobivam iz metode obrade
                              this.idTrenutnoAktivniPacijent = this.trenutnoAktivniPacijent.idPacijent;
                              //U polje ubacivam Observable u kojemu se nalazi informacija je li, te ako jest, kada je med. sestra obradila aktivnog pacijenta danas
                              polje.push(this.obradaService.getObradenOpciPodatci(this.idTrenutnoAktivniPacijent));
                              //U polje ubacivam Observable u kojemu se nalazi informacija je li, te ako jest, kada je liječnik obradio aktivnog pacijenta danas
                              polje.push(this.obradaService.getObradenPovijestBolesti(this.idTrenutnoAktivniPacijent));
                          }
                      }
                      //Ako je prijavljeni korisnik "sestra":
                      else if(this.isMedSestra){
                          //Ako je server vratio da ima pacijenta u obradi
                          if(podatci[3]["pacijent"]["pacijent"]["success"] !== "false"){
                              //Označavam da je pacijent aktivan
                              this.isAktivan = true;
                              //Spremam podatke trenutno aktivnog pacijenta
                              this.trenutnoAktivniPacijent = new Obrada(podatci[3].pacijent.pacijent[0]);
                              this.pacijent = new Pacijent(podatci[3].pacijent.pacijent[0]);
                              //Spremam ID trenutno aktivnog pacijenta kojega dobivam iz metode obrade
                              this.idTrenutnoAktivniPacijent = this.trenutnoAktivniPacijent.idPacijent;   
                              //U polje ubacivam Observable u kojemu se nalazi informacija je li, te ako jest, kada je med. sestra obradila aktivnog pacijenta danas
                              polje.push(this.obradaService.getObradenOpciPodatci(this.idTrenutnoAktivniPacijent));
                              //U polje ubacivam Observable u kojemu se nalazi informacija je li, te ako jest, kada je liječnik obradio aktivnog pacijenta danas
                              polje.push(this.obradaService.getObradenPovijestBolesti(this.idTrenutnoAktivniPacijent));
                          }
                      }
                      return forkJoin(polje);
                  }),
                  takeUntil(this.pretplateSubject)
              );
          }),
          takeUntil(this.pretplateSubject)
      //Pretplaćujem se na informaciju je li pacijenta obrađen od strane liječnika/med.sestre
      ).subscribe(
          (odgovor) => {
              console.log(odgovor);
              //Ako je pacijent aktivan
              if(odgovor.length > 0){
                  //Ako je medicinska sestra potvrdila opće podatke ovog pacijenta
                  if(odgovor[0][0]["Vrijeme"] !== null){
                    //Označavam da je sestra potvrdila opće podatke ovog pacijenta
                    this.isObradenOpciPodatci = true;
                    //Spremam vrijeme obrade
                    this.vrijemeObradeMedSestra = odgovor[0][0]["Vrijeme"];
                  }
                  //Ako je liječnik potvrdio povijest bolesti ovog pacijenta
                  if(odgovor[1][0]["Vrijeme"] != null){
                      //Označavam da je liječnik potvrdio povijest bolesti ovog pacijenta
                      this.isObradenPovijestBolesti = true;
                      //Spremam vrijeme obrade
                      this.vrijemeObradeLijecnik = odgovor[1][0]["Vrijeme"];
                  }
              }  
          }
      );
    }

    //Metoda koja se pokreće kada korisnik klikne "Dodaj u čekaonicu" u prozoru pretrage pacijenta
    onSljedeciPacijent(){
        //Pretplaćujem se na odgovor servera ima li sljedećeg pacijenta koji ima status "Čeka na pregled"
        this.headerService.tipKorisnikaObs.pipe(
            switchMap(tipKorisnik => {
                return this.obradaService.getSljedeciPacijent(tipKorisnik);
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
        //Resetiram Subject koji dava informaciju da je već upisana povijest bolesti
        this.povijestBolestiService.isObraden.next({idPacijent: null, isObraden: false});
        //Dohvaćam tip prijavljenog korisnika te tu informaciju predavam metodama
        this.headerService.tipKorisnikaObs.pipe(
            switchMap(podatci => {
                return combineLatest([
                    this.obradaService.editPatientStatus(this.trenutnoAktivniPacijent.idObrada,podatci,this.trenutnoAktivniPacijent.idPacijent),
                    this.obradaService.getPatientProcessing(podatci)
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
                this.obradaService.zavrsenPregled.next('zavrsenPregled');
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

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}
