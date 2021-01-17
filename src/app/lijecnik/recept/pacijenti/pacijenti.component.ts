import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { concatMap, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ReceptService } from '../recept.service';

@Component({
  selector: 'app-pacijenti',
  templateUrl: './pacijenti.component.html',
  styleUrls: ['./pacijenti.component.css']
})
export class PacijentiComponent implements OnInit, OnDestroy {

    //Kreiram formu
    formaPretraga: FormGroup;
    //Spremam pretplate
    subs: Subscription;
    subsPretraga: Subscription;
    //Spremam pacijente za tablicu
    pacijenti: any;
    //Oznaka ima li rezultata pretrage
    isPretraga: boolean = true;
    //Spremam poruku servera da nema rezultata za pretragu
    porukaPretraga: string = null;

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
        this.subs = this.route.data.subscribe(
            //Dohvati podatke
            (podatci : {pacijenti: any}) => {
                //Spremam pacijente za tablicu
                this.pacijenti = podatci.pacijenti;
                console.log(this.pacijenti);
            }
        ); 
        //Pretplaćujem se na liječnikovu pretragu u formi pretrage
        this.subsPretraga = this.formaPretraga.get('pretraga').valueChanges.pipe( 
            //Ne ponavljam iste zahtjeve
            distinctUntilChanged(), 
            concatMap(value => {
                return this.receptService.getPacijentiPretraga(value);
            })
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
    izdajRecept(){

    }

    //Ova metoda se izvodi kada se komponenta uništi
    ngOnDestroy(){
        //Ako postoji pretplata
        if(this.subs){
            //Izađi iz pretplate
            this.subs.unsubscribe();
        }
    }
}
