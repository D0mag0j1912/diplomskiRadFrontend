import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
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
    //Oznaka ima li inicijalno vraćenih pacijenata
    isPacijenti: boolean = false;
    //Spremam poruku da nema pacijenata
    nemaPacijenata: string = null;

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis recepta
        private receptService: ReceptService,
        //Dohvaćam router
        private router: Router
    ) { }

    //Ova metoda se izvodi kada se komponenta inicijalizira
    ngOnInit() {
        //Kreiram formu pretrage
        this.formaPretraga = new FormGroup({
            'pretraga': new FormControl(null)
        });
        //Pretplaćivam se na podatke iz Resolvera 
        this.route.data.pipe(
            map(podatci => podatci.podatci.pacijenti),
            tap((podatci) => {
                //Ako je server vratio da IMA pacijenata u bazi podataka
                if(podatci["success"] !== "false"){
                    //Označavam da ima pacijenata 
                    this.isPacijenti = true;
                    //Spremam pacijente u svoje polje
                    this.pacijenti = podatci;
                }
                //Ako je server vratio da NEMA pacijenata u bazi podataka
                else if(podatci["success"] === "false"){
                    //Spremam odgovor servera u svoju varijablu
                    this.nemaPacijenata = podatci["message"];
                } 
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
        //Pretplaćujem se na liječnikovu pretragu u formi pretrage
        this.formaPretraga.get('pretraga').valueChanges.pipe(
            //Namjerno kašnjenje
            debounceTime(200),
            //Ne ponavljam iste zahtjeve
            distinctUntilChanged(), 
            //Uzimam vrijednost pretrage te ga predavam HTTP zahtjevu
            switchMap(value => {
                return this.receptService.getPacijentiPretraga(value).pipe(
                    takeUntil(this.pretplateSubject)
                );
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe(
            //Dohvaćam odgovor servera na liječnikovu pretragu
            (odgovor) => {
                console.log(odgovor);
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
        //Preusmjeri liječnika na prozor izdavanja recepta
        this.router.navigate(['./',id],{relativeTo: this.route});
    }

    //Ova metoda se izvodi kada se komponenta uništi
    ngOnDestroy(){
        //Postavljam Subject na true da izađem iz pretplata
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}
