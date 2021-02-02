import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { concatMap, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { ReceptService } from '../recept.service';

@Component({
  selector: 'app-pacijenti',
  templateUrl: './pacijenti.component.html',
  styleUrls: ['./pacijenti.component.css']
})
export class PacijentiComponent implements OnInit, OnDestroy {

    //Kreiram formu
    formaPretraga: FormGroup;
    //Definiram Subject
    pretplateSubject = new Subject<boolean>();
    //Spremam pacijente za tablicu
    pacijenti: any;
    //Oznaka ima li rezultata pretrage
    isPretraga: boolean = true;
    //Spremam poruku servera da nema rezultata za pretragu
    porukaPretraga: string = null;
    //Oznaka je li prozor za izdavanje recepta aktivan
    isIzdajRecept: boolean = false;

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis recepta
        private receptService: ReceptService
    ) { }

    //Ova metoda se izvodi kada se komponenta inicijalizira
    ngOnInit() {
        //Kreiram formu pretrage
        this.formaPretraga = new FormGroup({
            'pretraga': new FormControl(null)
        });
        //Pretplaćivam se na podatke iz Resolvera 
        this.route.data.pipe(
            tap(
                (podatci : {pacijenti: any}) => {
                    //Spremam pacijente za tablicu
                    this.pacijenti = podatci.pacijenti;
                    console.log(this.pacijenti);
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe(); 
        //Pretplaćujem se na liječnikovu pretragu u formi pretrage
        this.formaPretraga.get('pretraga').valueChanges.pipe(
            //Ne ponavljam iste zahtjeve
            distinctUntilChanged(), 
            //Uzimam vrijednost pretrage te ga sekvencijalno predavam serveru tj. ako prošla vrijednost pretrage nije došla još do backenda
            //,a već se nova vrijednost pretrage pojavila, nova će morati čekati staru da završi
            concatMap(value => {
                return this.receptService.getPacijentiPretraga(value).pipe(
                    takeUntil(this.pretplateSubject)
                );
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe(
            //Dohvaćam odgovor servera na liječnikovu pretragu
            (odgovor) => {
                //Ako je odgovor servera uspješan tj. vratio je neke pacijente
                if(odgovor["success"] !== "false"){
                    //Označavam da ima vraćenih pacijenata
                    this.isPretraga = true;
                    //Odgovor servera za pretragu spremam u svoje polje pacijenata
                    this.pacijenti = odgovor;
                    //Praznim poruku pretrage
                    this.porukaPretraga = null;
                }
                //Ako je odgovor servera neuspješan
                else{
                    //Označavam da nema rezultata pretrage
                    this.isPretraga = false;
                    //Spremam poruku servera
                    this.porukaPretraga = odgovor["message"];
                }
            }
        );
    }

    //Metoda koja se poziva kada liječnik klikne na "Izdaj recept"
    izdajRecept(id: number){
        //Pošalji ID pacijenta u backend da mogu inicijalno prikazati njegove dijagnoze na unosu recepta
        this.receptService.inicijalneDijagnozeSubject.next(id);
        //Otvara se prozor za izdavanje recepta
        this.isIzdajRecept = true;
    }

    //Metoda koja zatvara prozor izdavanja recepta
    onClose(){
        //Zatvori prozor
        this.isIzdajRecept = false;
    }

    //Ova metoda se izvodi kada se komponenta uništi
    ngOnDestroy(){
        //Postavljam Subject na true da izađem iz pretplata
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}
