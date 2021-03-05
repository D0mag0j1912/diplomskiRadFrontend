import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { forkJoin, of, Subject} from 'rxjs';
import { switchMap,distinctUntilChanged, takeUntil, debounceTime } from 'rxjs/operators';
import { HeaderService } from '../header/header.service';
import { Obrada } from '../modeli/obrada.model';
import { ObradaService } from '../obrada/obrada.service';
import { OtvoreniSlucajService } from './otvoreni-slucaj.service';

@Component({
  selector: 'app-otvoreni-slucaj',
  templateUrl: './otvoreni-slucaj.component.html',
  styleUrls: ['./otvoreni-slucaj.component.css']
})
export class OtvoreniSlucajComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li pacijent aktivan u obradi ili nije
    isAktivan: boolean = false;
    //Oznaka je li ima dijagnoza za trenutno aktivnog pacijenta
    isDijagnoza: boolean = false;
    isDijagnozaPretraga: boolean = false;
    isSekundarnaDijagnoza: boolean = false;
    //Poruka 
    porukaAktivan: string = null;
    porukaDijagnoza: string = null;
    porukaDijagnozaPretraga: string = null;
    porukaSekundarnaDijagnoza: string = null;
    //Kreiram event tako da ga druge komponente mogu slušati
    @Output() close = new EventEmitter<any>();
    @Output() podatciRetka = new EventEmitter<{mkbSifraPrimarna: string,datumPregled: Date,odgovornaOsoba: string}>();
    //Spremam ID trenutno aktivnog pacijenta
    idPacijent: number;
    //Spremam podatke otvorenog slučaja
    otvoreniSlucaj: any;
    dijagnoze: any;
    //Kreiram svoju formu
    forma: FormGroup;
    //Spremam podatke obrade trenutno aktivnog pacijenta
    pacijent: Obrada;
    //Spremam tip prijavljenog korisnika
    tipKorisnik: string = null;

    constructor(
      //Dohvaćam servis otvorenog slučaja
      private otvoreniSlucajService: OtvoreniSlucajService,
      //Dohvaćam servis obrade
      private obradaService: ObradaService,
      //Dohvaćam header servis
      private headerService: HeaderService
    ) { } 

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){

        //Pretplaćujem se na odgovore servera
        this.headerService.tipKorisnikaObs.pipe(
            switchMap(podatci => {
                //Spremam tip prijavljenog korisnika
                this.tipKorisnik = podatci;
                return this.obradaService.getPatientProcessing(podatci).pipe(
                    takeUntil(this.pretplateSubject)
                );
            }),
            takeUntil(this.pretplateSubject)
        ).pipe(
            //Pomoću switchMapa uzimam podatke trenutno aktivnog pacijenta te njegov ID prosljeđujem dvjema metodama
            switchMap((response) => {
                //Ako je Observable vratio aktivnog pacijenta
                if(response["success"] !== "false"){
                    //Označavam da je pacijent aktivan u obradi
                    this.isAktivan = true;
                    //Spremam mu podatke
                    this.pacijent = new Obrada(response[0]);
                    //Spremam ID pacijenta
                    this.idPacijent = this.pacijent.idPacijent;
                    //Kreiram svoju formu
                    this.forma = new FormGroup({
                      'parametar': new FormControl(null)
                    });
                    return forkJoin([
                        this.otvoreniSlucajService.getOtvoreniSlucaj(this.idPacijent),
                        this.otvoreniSlucajService.getSekundarneDijagnoze(this.idPacijent)
                    ]).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                }
                //Ako Observable nije vratio aktivnog pacijenta
                else{
                    //U svoju varijablu spremam poruku backenda da pacijent nije aktivan
                    this.porukaAktivan = response["message"];
                    //Kreiram Observable od te poruke tako da ga switchMapom vratim ako nema aktivnog pacijenta
                    return of(this.porukaAktivan).pipe(
                        takeUntil(this.pretplateSubject)
                    );  
                }
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe(
              (podatci) => {
              console.log(podatci);  
              //Ako je server vratio uspješni odgovor tj. ako je pacijent AKTIVAN i ako ima AKTIVNIH PRIMARNIH DIJAGNOZA za pacijenta
              if(podatci !== "Nema aktivnih pacijenata!" && podatci[0]["success"] !== "false"){
                  //Pretplaćujem se na promjene u formi pretrage 
                  this.forma.get('parametar').valueChanges.pipe(
                      debounceTime(100),
                      distinctUntilChanged(),
                      switchMap(value => {
                          return this.otvoreniSlucajService.getOtvoreniSlucajPretraga(value,this.idPacijent);
                      }),
                      takeUntil(this.pretplateSubject)
                  ).subscribe(
                      (odgovor) => {
                          console.log(odgovor);
                          //Ako je server vratio uspješni odgovor tj. ako ima aktivnih primarnih dijagnoza za pacijenta ZA NAVEDENU PRETRAGU
                          if(odgovor["success"] !== "false"){
                              //Ako JE prazno polje unosa pretrage, prikaži sve podatke
                              if(this.forma.get('parametar').value.length === 0){
                                  //Restartam poruku u kojoj piše da nema rezultata
                                  this.porukaDijagnozaPretraga = null;
                                  //Inicijalno stavljam sve podatke na ekran
                                  this.otvoreniSlucaj = podatci[0];
                              }
                              //Ako NIJE prazno polje unosa pretrage, prikaži samo one koje odgovaraju pretrazi
                              else{
                                  //Označavam da ima pronađenih dijagnoza za navedenu pretragu
                                  this.isDijagnozaPretraga = true;
                                  //Spremam sve podatke za otvoreni slučajeve trenutno aktivnog pacijenta
                                  this.otvoreniSlucaj = odgovor;
                                  //Restartam poruke dijagnoze pretrage
                                  this.porukaDijagnozaPretraga = null;
                              }
                          }
                          //Ako nema pronađenih rezultata ZA PRETRAGU
                          else{
                              //Ako JE prazno polje unosa pretrage, prikaži inicijalno sve podatke
                              if(this.forma.get('parametar').value.length === 0){
                                  this.otvoreniSlucaj = podatci[0];
                              }
                              //Ako NIJE prazno polje unosa pretrage, prikaži poruku pogreške
                              else{
                                  this.isDijagnozaPretraga = false;
                                  //Spremam odgovor servera kao poruku koju ću prikazati na ekranu
                                  this.porukaDijagnozaPretraga = odgovor["message"];
                              }
                          }
                      }
                  );
                  //Označavam da ima dijagnoza
                  this.isDijagnoza = true;
                  //Spremam sve podatke za prvi dio tablice otvorenog slučaja 
                  this.otvoreniSlucaj = podatci[0];
                  //Spremam sve sekundarne dijagnoze
                  this.dijagnoze = podatci[1];
              }
              //Ako je pacijent AKTIVAN te ako NEMA AKTIVNIH primarnih dijagnoza
              else if(podatci !== "Nema aktivnih pacijenata!" && podatci[0]["success"] === "false"){
                  //Dohvaćam glavni div
                  const alertBox = document.getElementById("alert-box");
                  const unutarnjiDiv = document.getElementById("promjenaKlase");
                  //Mijenjam klasu unuturanjem divu
                  unutarnjiDiv.className = "col-xs-12 col-md-6 col-md-offset-2";
                  //Ažuriram visinu prozora
                  alertBox.style.height = "10vw";
                  alertBox.style.width = "30vw";
                  alertBox.style.left = "35vw";
                  //Spremam neuspješnu poruku (da nema aktivnih dijagnoza) u svoju varijablu
                  this.porukaDijagnoza = podatci[0]["message"];
              }
              //Ako pacijent NIJE AKTIVAN
              else if(podatci === "Nema aktivnih pacijenata!"){
                  //Dohvaćam glavni div
                  const alertBox = document.getElementById("alert-box");
                  //Ažuriram visinu prozora
                  alertBox.style.height = "10vw";
                  alertBox.style.width = "30vw";
                  alertBox.style.left = "35vw";
                  this.porukaAktivan = podatci;
              }  
          }
        );
    }

    //Metoda koja se aktivira kada se klikne button "Poveži". Kao parameter prima podatke određenog retka
    poveziOtvoreniSlucaj(mkbSifraPrimarna: string,datumPregled: Date,odgovornaOsoba: string){
        //Stavljam vrijednosti retka u EventEmitter da komponenta "Opći podatci pregleda" i "PovijestBolesti" dobije ovu poruku
        this.podatciRetka.emit({
          mkbSifraPrimarna,
          datumPregled,
          odgovornaOsoba
        });
    }

    //Metoda koja se poziva kada korisnik klikne "Izađi"
    onClose(){
      //Emitiraj event
      this.close.emit();
    }

    //Metoda koja se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}
