import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';
import { ListaReceptiService } from '../lista-recepti/lista-recepti.service';
import { ReceptService } from '../recept.service';
import { PacijentiService } from './pacijenti.service';

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
    //Oznaka ima li rezultata pretrage
    isPretraga: boolean = true;
    //Spremam poruku servera da nema rezultata za pretragu
    porukaPretraga: string = null;
    //Oznaka ima li inicijalno vraćenih pacijenata
    isPacijenti: boolean = false;
    //Spremam poruku da nema pacijenata
    nemaPacijenata: string = null;
    //Spremam ID-ove pacijenata koji se trenutno nalaze u tablici pacijenata
    ids: string[] = [];
    //Kreiram polje pacijenata
    pacijenti: Pacijent[] = [];

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis recepta
        private receptService: ReceptService,
        //Dohvaćam router
        private router: Router,
        //Dohvaćam servis liste recepata
        private listaReceptiService: ListaReceptiService,
        //Dohvaćam servis pacijenata
        private pacijentiService: PacijentiService
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
                    //Inicijaliziram praznu varijablu
                    let pacijent;
                    //Resetiram poruke koje je potrebno resetirati da se prikaže tablica pacijenata
                    this.nemaPacijenata = null;
                    //Označavam da ima pacijenata 
                    this.isPacijenti = true;
                    //Prolazim kroz polje pacijenata sa servera
                    for(const pac of podatci){
                        //Za svaki JS objekt kreiram novi svoj objekt tipa "Pacijent"
                        pacijent = new Pacijent(pac);
                        //Svaki novo kreirani objekt nadodavam u polje
                        this.pacijenti.push(pacijent);
                    }
                    //Označavam da liječnik pretraživa pacijente
                    this.isPretraga = true;
                    //Kreiram novo polje u koje spremam samo ID-ove pacijenata koji se trenutno nalaze u tablici pacijenata
                    this.ids = this.pacijenti.map((objekt) => {
                        return objekt.id.toString();
                    });
                    console.log(this.ids);
                }
                //Ako je server vratio da NEMA pacijenata u bazi podataka
                else if(podatci["success"] === "false"){
                    //Označavam da nema rezultata za pretragu pacijenata
                    this.isPretraga = false;
                    //Spremam odgovor servera u svoju varijablu
                    this.nemaPacijenata = podatci["message"];
                } 
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();

        const combined = merge(
            //Pretplaćujem se na liječnikovu pretragu u formi pretrage
            this.formaPretraga.get('pretraga').valueChanges.pipe(
                //Namjerno kašnjenje
                debounceTime(200),
                //Ne ponavljam iste zahtjeve
                distinctUntilChanged(), 
                //Uzimam vrijednost pretrage te ga predavam HTTP zahtjevu
                switchMap(value => {
                    return this.pacijentiService.getPacijentiPretraga(value).pipe(
                        //Dohvaćam odgovor servera na liječnikovu pretragu
                        tap((odgovor) => {
                            //Ako je odgovor servera uspješan tj. vratio je neke pacijente
                            if(odgovor["success"] !== "false"){
                                //Inicijaliziram praznu varijablu
                                let pacijent;
                                //Resetiram poruke koje je potrebno resetirati da se prikaže tablica pacijenata
                                this.nemaPacijenata = null;
                                //Označavam da ima vraćenih pacijenata
                                this.isPretraga = true;
                                //Praznim inicijalno polje pacijenata
                                this.pacijenti = [];
                                //Prolazim kroz polje pacijenata sa servera
                                for(const pac of odgovor){
                                    //Za svaki JS objekt kreiram novi svoj objekt tipa "Pacijent"
                                    pacijent = new Pacijent(pac);
                                    //Svaki novo kreirani objekt nadodavam u polje
                                    this.pacijenti.push(pacijent);
                                }
                                //Praznim polje ID-ova koje šaljem u listu recepata
                                this.ids = [];
                                //Kreiram svoje novo polje koje će uzeti samo ID-ove iz polja rezultata
                                this.ids = this.pacijenti.map((objekt) => {
                                    return objekt.id.toString();
                                });
                                //Pošalji te ID-eve listi recepata
                                this.listaReceptiService.prijenosnikUListuRecepata.next(this.ids);
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
                        }),
                        takeUntil(this.pretplateSubject)
                    );
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na vrijednost Subjecta pomoću kojega dobivam informaciju kada poslati ID-ove pacijenata
            this.receptService.messengerObs.pipe(
                tap(value => {
                    console.log(value);
                    //Ako je vrijednost Subjecta true
                    if(value){
                        console.log("Šaljem ID-ove listi recepata");
                        console.log(this.ids);
                        //Pošalji listi recepata trenutno stanje ID-ova u tablici pacijenata
                        this.listaReceptiService.prijenosnikUListuRecepata.next(this.ids);
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na ID-ove pacijenata iz liste recepata
            this.pacijentiService.prijenosnikUTablicuPacijenataObs.pipe(
                debounceTime(100),
                distinctUntilChanged(),
                switchMap(value => {
                    //Ako ima nekih vraćenih ID-ova
                    if(value){
                        return this.pacijentiService.getPacijenti(value).pipe(
                            tap(primljeniPacijenti => {
                                //Ako ima nekih pacijenata
                                if(primljeniPacijenti){
                                    console.log(primljeniPacijenti);
                                    //Inicijaliziram praznu varijablu
                                    let pacijent;
                                    //Resetiram poruke koje je potrebno resetirati da se prikaže tablica pacijenata
                                    this.nemaPacijenata = null;
                                    //Označavam da ima pacijenata 
                                    this.isPacijenti = true;
                                    //Praznim inicijalno polje pacijenata
                                    this.pacijenti = [];
                                    //Prolazim kroz polje pacijenata sa servera
                                    for(const pac of primljeniPacijenti){
                                        //Za svaki JS objekt kreiram novi svoj objekt tipa "Pacijent"
                                        pacijent = new Pacijent(pac);
                                        //Svaki novo kreirani objekt nadodavam u polje
                                        this.pacijenti.push(pacijent);
                                    }
                                }
                            }),
                            takeUntil(this.pretplateSubject)
                        );
                    }
                }),
                takeUntil(this.pretplateSubject)
            )
        ).subscribe();
    }

    //Metoda koja se poziva kada liječnik klikne na "Izdaj recept"
    izdajRecept(id: number){
        //Emitiram null vrijednost Subjectom u "IzdajReceptComponent" da se zna da se radi o DODAVANJU RECEPTA
        this.listaReceptiService.editMessenger.next(null);
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
