import { Time } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { forkJoin, of, Subject} from 'rxjs';
import { switchMap,distinctUntilChanged, takeUntil, debounceTime, tap, take } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { Obrada } from '../modeli/obrada.model';
import { OtvoreniSlucaj } from './otvoreniSlucaj.model';
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
    //Poruka
    porukaAktivan: string = null;
    porukaDijagnoza: string = null;
    porukaDijagnozaPretraga: string = null;
    //Kreiram event tako da ga druge komponente mogu slušati
    @Output() close = new EventEmitter<any>();
    @Output() podatciRetka = new EventEmitter<{
        mkbSifraPrimarna: string,
        datumPregled: Date,
        vrijemePregled: Time,
        tipSlucaj: string}>();
    //Spremam ID trenutno aktivnog pacijenta
    idPacijent: number;
    //Spremam podatke otvorenog slučaja
    otvoreniSlucaji: OtvoreniSlucaj[] = [];
    //Spremam podatke sek. dijagnoza
    sekDijagnoze: OtvoreniSlucaj[] = [];
    //Kreiram svoju formu
    forma: FormGroup;
    //Spremam podatke obrade trenutno aktivnog pacijenta
    pacijent: Obrada;

    constructor(
        //Dohvaćam servis otvorenog slučaja
        private otvoreniSlucajService: OtvoreniSlucajService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam login servis
        private loginService: LoginService
    ) {}

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){
        //Kreiram svoju formu
        this.forma = new FormGroup({
            'parametar': new FormControl(null)
          });
        //Pretplaćujem se na odgovore servera
        this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                return this.obradaService.getPatientProcessing(user.tip);
            })
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
                    return forkJoin([
                        this.otvoreniSlucajService.getOtvoreniSlucaj(this.idPacijent),
                        this.otvoreniSlucajService.getSekundarneDijagnoze(this.idPacijent)
                    ]).pipe(
                        tap(podatci => {
                            //Ako je server vratio uspješni odgovor tj. ako je pacijent AKTIVAN i ako ima AKTIVNIH PRIMARNIH DIJAGNOZA za pacijenta
                            if(podatci[0] !== "Nema aktivnih pacijenata!" && podatci[0]["success"] !== "false"){
                                //Definiram objekt tipa "OtvoreniSlucaj"
                                let objektOtvoreniSlucaj;
                                //Prolazim odgovorom servera
                                for(const slucaj of podatci[0]){
                                  //Za svaki objekt u odgovoru servera, kreiram svoj objekt tipa "OtvoreniSlucaj"
                                  objektOtvoreniSlucaj = new OtvoreniSlucaj(slucaj);
                                  //Dodavam novostvoreni objekt u svoje polje otvorenih slučaja
                                  this.otvoreniSlucaji.push(objektOtvoreniSlucaj);
                                }
                                //Označavam da ima dijagnoza
                                this.isDijagnoza = true;
                                //Definiram objekt tipa "OtvoreniSlucaj"
                                let objektSekDijagnoza;
                                //Prolazim kroz odgovor servera tj. sek dijagnoze sa servera
                                for(const dijagnoza of podatci[1]){
                                    //Za svaki objekt u odgovoru servera, kreiram svoj objekt tipa "OtvoreniSlucaj"
                                    objektSekDijagnoza = new OtvoreniSlucaj(dijagnoza);
                                    //Dodavam novostvoreni objekt u svoje polje otvorenih slučaja
                                    this.sekDijagnoze.push(objektSekDijagnoza);
                                }
                            }
                            //Ako je pacijent AKTIVAN te ako NEMA AKTIVNIH primarnih dijagnoza
                            else if(podatci[0] !== "Nema aktivnih pacijenata!" && podatci[0]["success"] === "false"){
                                //Označavam da nema dijagnoza
                                this.isDijagnoza = false;
                                //Dohvaćam glavni div
                                const alertBox = document.getElementById("alert-box");
                                const unutarnjiDiv = document.getElementById("promjenaKlase");
                                //Mijenjam klasu unuturanjem divu
                                unutarnjiDiv.className = "col-xs-12 col-md-6 col-md-offset-2";
                                //Ažuriram visinu prozora
                                alertBox.style.height = "10vw";
                                alertBox.style.width = "30vw";
                                alertBox.style.left = "35vw";
                                //Dižem overflow-y
                                alertBox.style.overflowY = "hidden";
                                //Spremam neuspješnu poruku (da nema aktivnih dijagnoza) u svoju varijablu
                                this.porukaDijagnoza = podatci[0]["message"];
                            }
                        })
                    );
                }
                //Ako Observable nije vratio aktivnog pacijenta
                else{
                    //Dohvaćam glavni div
                    const alertBox = document.getElementById("alert-box");
                    //Ažuriram visinu prozora
                    alertBox.style.height = "10vw";
                    alertBox.style.width = "30vw";
                    alertBox.style.left = "35vw";
                    //U svoju varijablu spremam poruku backenda da pacijent nije aktivan
                    this.porukaAktivan = response["message"];
                    //Kreiram Observable od te poruke tako da ga switchMapom vratim ako nema aktivnog pacijenta
                    return of(this.porukaAktivan);
                }
            })
        ).subscribe();

        //Pretplaćujem se na promjene u formi pretrage
        this.forma.get('parametar').valueChanges.pipe(
            debounceTime(100),
            distinctUntilChanged(),
            switchMap(value => {
                //Ako ID pacijent još nije definiran
                if(!this.idPacijent){
                    return this.loginService.user.pipe(
                        take(1),
                        switchMap(user => {
                            return this.obradaService.getPatientProcessing(user.tip).pipe(
                                switchMap(podatci => {
                                    this.idPacijent = +podatci[0].idPacijent;
                                    return this.pretraga(value, this.idPacijent);
                                })
                            );
                        })
                    );
                }
                //Ako je ID pacijent već definiran
                else{
                    return this.pretraga(value, this.idPacijent);
                }
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na pretragu
    pretraga(pretraga: string, idPacijent: number){
        return forkJoin([
            this.otvoreniSlucajService.getOtvoreniSlucajPretraga(pretraga,idPacijent),
            this.otvoreniSlucajService.getSekundarneDijagnoze(idPacijent)
        ]).pipe(
            tap((odgovor) => {
                //Ako je server vratio uspješni odgovor tj. ako ima aktivnih primarnih dijagnoza za pacijenta ZA NAVEDENU PRETRAGU
                if(odgovor[0]["success"] !== "false"){
                    //Označavam da ima pronađenih dijagnoza
                    this.isDijagnozaPretraga = true;
                    //Resetiram poruku da nema rezultata
                    this.porukaDijagnozaPretraga = null;
                    //Resetiram polje otvorenih slučajeva
                    this.otvoreniSlucaji = [];
                    //Definiram objekt tipa "OtvoreniSlucaj"
                    let objektOtvoreniSlucaj;
                    //Prolazim odgovorom servera
                    for(const slucaj of odgovor[0]){
                        //Za svaki objekt u odgovoru servera, kreiram svoj objekt tipa "OtvoreniSlucaj"
                        objektOtvoreniSlucaj = new OtvoreniSlucaj(slucaj);
                        //Dodavam novostvoreni objekt u svoje polje otvorenih slučaja
                        this.otvoreniSlucaji.push(objektOtvoreniSlucaj);
                    }
                    //Resetartam polje sekundarnih dijagnoza
                    this.sekDijagnoze = [];
                    //Definiram objekt tipa "OtvoreniSlucaj"
                    let objektSekDijagnoza;
                    //Prolazim kroz odgovor servera tj. sek dijagnoze sa servera
                    for(const dijagnoza of odgovor[1]){
                        //Za svaki objekt u odgovoru servera, kreiram svoj objekt tipa "OtvoreniSlucaj"
                        objektSekDijagnoza = new OtvoreniSlucaj(dijagnoza);
                        //Dodavam novostvoreni objekt u svoje polje otvorenih slučaja
                        this.sekDijagnoze.push(objektSekDijagnoza);
                    }
                }
                //Ako nema pronađenih rezultata ZA PRETRAGU
                else{
                    this.isDijagnozaPretraga = false;
                    //Spremam odgovor servera kao poruku koju ću prikazati na ekranu
                    this.porukaDijagnozaPretraga = odgovor[0]["message"];
                }
            })
        )
    }

    //Metoda koja se aktivira kada se klikne button "Poveži". Kao parameter prima podatke određenog retka
    poveziOtvoreniSlucaj(mkbSifraPrimarna: string,datumPregled: Date, vrijemePregled: Time, tipSlucaj: string){
        //Stavljam vrijednosti retka u EventEmitter da komponenta "Opći podatci pregleda" i "PovijestBolesti" dobije ovu poruku
        this.podatciRetka.emit({
          mkbSifraPrimarna,
          datumPregled,
          vrijemePregled,
          tipSlucaj
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
