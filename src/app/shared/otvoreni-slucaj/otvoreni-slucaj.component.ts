import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { forkJoin, of, Subscription } from 'rxjs';
import { switchMap,distinctUntilChanged } from 'rxjs/operators';
import { Obrada } from '../modeli/obrada.model';
import { ObradaService } from '../obrada/obrada.service';
import { OtvoreniSlucajService } from './otvoreni-slucaj.service';

@Component({
  selector: 'app-otvoreni-slucaj',
  templateUrl: './otvoreni-slucaj.component.html',
  styleUrls: ['./otvoreni-slucaj.component.css']
})
export class OtvoreniSlucajComponent implements OnInit, OnDestroy {

    //Spremam pretplatu
    subs: Subscription;
    subsAktivniPacijent: Subscription;
    subsPretraga: Subscription;
    subsOtvoreniSlucajPretraga: Subscription;
    subsZavrsenPregled: Subscription;
    //Oznaka je li pacijent aktivan u obradi ili nije
    isAktivan: boolean = false;
    //Oznaka je li ima dijagnoza za trenutno aktivnog pacijenta
    isDijagnoza: boolean = false;
    isDijagnozaPretraga: boolean = true;
    isSekundarnaDijagnoza: boolean = false;
    //Poruka 
    porukaAktivan: string;
    porukaDijagnoza: string;
    porukaDijagnozaPretraga: string;
    porukaSekundarnaDijagnoza: string;
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
    pacijent: Obrada;

    constructor(
      //Dohvaćam servis otvorenog slučaja
      private otvoreniSlucajService: OtvoreniSlucajService,
      //Dohvaćam servis obrade
      private obradaService: ObradaService
    ) { } 

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){
      //Kombiniram dva Observable-a 
      const combined = this.obradaService.getPatientProcessing().pipe(
          //Pomoću switchMapa uzimam podatke trenutno aktivnog pacijenta te njegov ID prosljeđujem dvjema metodama
          switchMap((response) => { 
              console.log(response);
              //Ako je Observable vratio aktivnog pacijenta
              if(response["success"] !== "false"){
                //Označavam da je pacijent aktivan u obradi
                this.isAktivan = true;
                //Spremam mu podatke
                this.pacijent = response;
                //Spremam ID pacijenta
                this.idPacijent = this.pacijent[0].idPacijent;
                //Kreiram svoju formu
                this.forma = new FormGroup({
                  'parametar': new FormControl(null)
                });
                console.log(this.isAktivan);
                return forkJoin([
                    this.otvoreniSlucajService.getOtvoreniSlucaj(this.idPacijent),
                    this.otvoreniSlucajService.getSekundarneDijagnoze(this.idPacijent)
                ]);
              }
              //Ako Observable nije vratio aktivnog pacijenta
              else{
                //U svoju varijablu spremam poruku backenda da pacijent nije aktivan
                this.porukaAktivan = response["message"];
                //Kreiram Observable od te poruke tako da ga switchMapom vratim ako nema aktivnog pacijenta
                return of(this.porukaAktivan);    
              }
          }) 
      );
      //Pretplaćujem se na odgovore servera
      this.subs = combined.subscribe(
          //Dohvaćavam odgovor
          (podatci) => {
              console.log(podatci);
              //Ako je pacijent AKTIVAN 
              if(podatci !== "Nema aktivnih pacijenata!"){
                  //Pretplaćujem se na promjene u formi pretrage 
                  this.subsPretraga = this.forma.get('parametar').valueChanges.subscribe(
                    //Dohvaćam promjene u pretrazi dijagnoze
                    (value: string) => {
                        //Pozivam metodu koja vraća datum pregleda, odgovornu osobu, mkb šifru i naziv primarne dijagnoze za promjenu u inputu
                        this.dohvatiOtvoreniSlucajPretraga(value);
                    }
                  );
              }
              //Ako je server vratio uspješni odgovor tj. ako je pacijent AKTIVAN i ako ima AKTIVNIH PRIMARNIH DIJAGNOZA za pacijenta
              if(podatci !== "Nema aktivnih pacijenata!" && podatci[0]["success"] !== "false"){
                  //Označavam da ima dijagnoza
                  this.isDijagnoza = true;
                  //Spremam sve podatke za prvi dio tablice otvorenog slučaja 
                  this.otvoreniSlucaj = podatci[0];
                  //Spremam sve sekundarne dijagnoze
                  this.dijagnoze = podatci[1];
              }
              //Ako je pacijent AKTIVAN te ako NEMA AKTIVNIH primarnih dijagnoza
              else if(podatci !== "Nema aktivnih pacijenata!" && podatci[0]["success"] === "false"){
                  //Spremam neuspješnu poruku (da nema aktivnih dijagnoza) u svoju varijablu
                  this.porukaDijagnoza = podatci[0]["message"];
              }
              //Ako pacijent NIJE AKTIVAN
              else if(podatci === "Nema aktivnih pacijenata!"){
                  this.porukaAktivan = podatci;
              }
          }
      );
    }

    //Metoda u kojoj dohvaćam DATUM PREGLEDA, ODGOVORNU OSOBU, MKB ŠIFRU I NAZIV PRIMARNE DIJAGNOZE ZA PRETRAGU
    dohvatiOtvoreniSlucajPretraga(value: string){

        this.subsOtvoreniSlucajPretraga = this.otvoreniSlucajService.getOtvoreniSlucajPretraga(value,this.idPacijent).subscribe(
            //Dohvaćam rezultat pretrage
            (odgovor) => {
                //Ako je server vratio uspješni odgovor tj. ako ima aktivnih primarnih dijagnoza za pacijenta ZA NAVEDENU PRETRAGU
                if(odgovor["success"] !== "false"){
                  //Označavam da ima pronađenih dijagnoza za navedenu pretragu
                  this.isDijagnozaPretraga = true;
                  //Spremam sve podatke za otvoreni slučajeve trenutno aktivnog pacijenta
                  this.otvoreniSlucaj = odgovor;
                  console.log(this.otvoreniSlucaj);
                }
                //Ako nema pronađenih rezultata ZA PRETRAGU
                else{
                    //Označavam da nema pronađenih dijagnoza za pretragu
                    this.isDijagnozaPretraga = false;
                    //Spremam odgovor servera kao poruku koju ću prikazati na ekranu
                    this.porukaDijagnozaPretraga = odgovor["message"];
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
      //Ako postoji pretplata
      if(this.subs){
        //Izađi iz pretplate
        this.subs.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsAktivniPacijent){
        //Izađi iz pretplate
        this.subsAktivniPacijent.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsPretraga){
        //Izađi iz pretplate
        this.subsPretraga.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsOtvoreniSlucajPretraga){
        //Izađi iz pretplate
        this.subsOtvoreniSlucajPretraga.unsubscribe();
      }
    }
}
