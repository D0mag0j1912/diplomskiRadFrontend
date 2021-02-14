import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { PacijentRecept } from 'src/app/shared/modeli/pacijentRecept.model';
import { Recept } from 'src/app/shared/modeli/recept.model';
import { ListaReceptiService } from './lista-recepti.service';

@Component({
  selector: 'app-lista-recepti',
  templateUrl: './lista-recepti.component.html',
  styleUrls: ['./lista-recepti.component.css']
})
export class ListaReceptiComponent implements OnInit,OnDestroy{

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    formaPretraga: FormGroup;
    //Oznaka je li recept ponovljiv
    isPonovljiv: boolean = false;
    //Spremam inicijalnu poruku da trenutno aktivni pacijent nema evidentiranih recepata
    inicijalnoNemaPacijenata: string = null;
    //Spremam inicijalnu poruku da trenutno aktivni pacijent nema evidentiranih recepata
    inicijalnoAktivniNemaRezultata: string = null;
    //Spremam inicijalne recepte
    inicijalniRecepti: Recept[] = [];
    //Spremam imena i prezimena u pomoćno polje
    pacijenti: PacijentRecept[];
    //Oznaka je li se pretražuje
    isPretraga: boolean = true;
    //Poruka koja se prikazuje kada server vrati da nema rezultata pretrage
    porukaPretraga: string = null;
    //Polje u koje ću spremati vrijednost koje BehaviourSubject pošalje (ID-ove pacijenata)
    idPacijenti: number[] = [];

    constructor(
        //Dohvaćam router
        private router: Router,
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis liste recepata
        private listaReceptiService: ListaReceptiService
    ) { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Kreiram formu pretrage
        this.formaPretraga = new FormGroup({
            'pretraga': new FormControl(null)
        });

        this.listaReceptiService.prijenosnikObs.pipe(
            /* switchMap(value => {
                //Svaki put kada primim novu vrijednost od Subjecta, resetiram polje
                this.idPacijenti = [];
                //Stavljam novu vrijednost iz Subjecta (ID pacijenta) u polje
                this.idPacijenti.push(value);
                console.log(this.idPacijenti);
                return this.listaReceptiService.getReceptiTablica(this.idPacijenti).pipe(
                    tap(odgovor => {
                        console.log(odgovor);
                    }),
                    takeUntil(this.pretplateSubject)
                );
            }), */
            tap(value => {
                console.log(value);
                this.idPacijenti.push(value);
                console.log(this.idPacijenti);
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();

        //Pretplaćujem se na podatke Resolvera tj. na recepte
        this.route.data.pipe(
            map(podatci => podatci.podatci.recepti),
            tap((podatci: any) => {
                console.log(podatci);
                //Ako je server vratio da ima evidentiranih pacijenata u bazi ILI da aktivni pacijent ima evidentiranih recepata
                if(podatci["success"] !== "false"){
                    //Inicijaliziram varijable u koje ću spremiti podatke recepata
                    let recept;
                    //Prolazim kroz polje u kojemu se nalaze inicijalni recepti sa servera
                    for(const r of podatci){
                        //Za svaki objekt recepta, kreiram svoj objekt tipa "Recept"
                        recept = new Recept(r);
                        //Objekt tipa "Recept" dodavam u polje
                        this.inicijalniRecepti.push(recept);
                    }
                    //Kreiram novo polje koje se sastoji od samo podataka pacijenata koji sudjeluju u receptima (ID, imePrezime)
                    let pacijent = this.inicijalniRecepti.map((objekt) => {
                        const pom = {idPacijent: objekt.idPacijent, imePrezimePacijent: objekt.imePrezimePacijent};
                        return pom;
                    });
                    //Samo jedinstvene pacijente nadodavam u svoje polje 
                    this.pacijenti = pacijent.filter((objekt,index,polje) => polje.findIndex(obj => (obj.idPacijent === objekt.idPacijent)) === index);
                }
                //Ako je server inicijalno vratio da nema registriranih pacijenata u bazi 
                else if(podatci["success"] === "false" && podatci["message"] === "Nema pronađenih pacijenata!"){
                    //Spremam odgovor servera u svoju varijablu
                    this.inicijalnoNemaPacijenata = podatci.message;
                }
                //Ako je server inicijalno vratio da nema evidentiranih recepata za aktivnog pacijenta 
                else if(podatci["success"] === "false" && podatci["message"] === "Trenutno aktivni pacijent nema evidentiranih recepata!"){
                    //Spremam odgovor servera u svoju varijablu
                    this.inicijalnoAktivniNemaRezultata = podatci.message;
                }
                console.log(this.inicijalnoAktivniNemaRezultata);
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();

        //Pretplaćivam se na promjene u pretrazi liste recepata
        this.pretraga.valueChanges.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            switchMap(value => {
                return this.listaReceptiService.getReceptiPretraga(value).pipe(
                    tap(odgovor => {
                        //Ako je server vratio neke rezultate (recepte)
                        if(odgovor["success"] !== "false"){
                            //Praznim poruke da nema rezultata
                            this.porukaPretraga = null;
                            this.inicijalnoNemaPacijenata = null;
                            this.inicijalnoAktivniNemaRezultata = null;
                            //Označavam da ima rezultata
                            this.isPretraga = true;
                            //Inicijaliziram varijable u koje ću spremiti podatke recepata
                            let recept;
                            //Praznim inicijalno polje recepata
                            this.inicijalniRecepti = [];
                            //Prolazim kroz polje u kojemu se nalaze inicijalni recepti sa servera
                            for(const r of odgovor){
                                //Za svaki objekt recepta, kreiram svoj objekt tipa "Recept"
                                recept = new Recept(r);
                                //Objekt tipa "Recept" dodavam u polje
                                this.inicijalniRecepti.push(recept);
                            }
                            //Kreiram novo polje koje se sastoji od samo podataka pacijenata koji sudjeluju u receptima (ID, imePrezime)
                            let pacijent = this.inicijalniRecepti.map((objekt) => {
                                const pom = {idPacijent: objekt.idPacijent, imePrezimePacijent: objekt.imePrezimePacijent};
                                return pom;
                            });
                            //Praznim polje pacijenata
                            this.pacijenti = [];
                            //Samo jedinstvene pacijente nadodavam u svoje polje 
                            this.pacijenti = pacijent.filter((objekt,index,polje) => polje.findIndex(obj => (obj.idPacijent === objekt.idPacijent)) === index);
                        }
                        //Ako je server vratio da nema rezultata
                        else{
                            //Označavam da nema rezultata
                            this.isPretraga = false;
                            //Spremam poruku servera
                            this.porukaPretraga = odgovor.message;
                        }
                    }),
                    takeUntil(this.pretplateSubject)
                );
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe(); 
    }

    podiNaPrikaz(){
        //Preusmjeri liječnika na prozor izdavanja recepta
        this.router.navigate(['./',23],{relativeTo: this.route});
    }

    //Metoda koja se poziva kada se komponenta uništi
    ngOnDestroy(){
        //Izađi iz pretplata
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

    get pretraga(): FormControl{
        return this.formaPretraga.get('pretraga') as FormControl;
    }

}
