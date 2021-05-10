import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';
import { SharedService } from 'src/app/shared/shared.service';
import { ListaReceptiService } from '../lista-recepti/lista-recepti.service';
import { ReceptService } from '../recept.service';
import { PacijentiService } from './pacijenti.service';

@Component({
  selector: 'app-pacijenti',
  templateUrl: './pacijenti.component.html',
  styleUrls: ['./pacijenti.component.css']
})
export class PacijentiComponent implements OnInit, OnDestroy {

    //Oznaka hoće li se prikazati prozor povijesti bolesti
    isPovijestBolesti: boolean = false;
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
    //Spremam sve dijagnoze koje prosljeđujem child komponenti "PrikaziPovijestBolesti"
    dijagnoze: any;
    //Spremam ID pacijenta kojega šaljem child komponenti "PrikaziPovijestBolesti"
    idPacijent: number;

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
        private pacijentiService: PacijentiService,
        //Dohvaćam shared servis
        private sharedService: SharedService
    ) { }

    //Ova metoda se izvodi kada se komponenta inicijalizira
    ngOnInit() {
        //Kreiram formu pretrage
        this.formaPretraga = new FormGroup({
            'pretraga': new FormControl(null)
        });
        //Pretplaćivam se na podatke iz Resolvera
        this.route.data.pipe(
            tap(podatci => {
                //Spremam sve dijagnoze
                this.dijagnoze = podatci.podatci.dijagnoze;
            }),
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
                        })
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
                            })
                        );
                    }
                }),
                takeUntil(this.pretplateSubject)
            )
        ).subscribe();
    }

    //Metoda koja se poziva kada liječnik klikne na "Izdaj recept"
    izdajRecept(id: string){
        //Emitiram null vrijednost Subjectom u "IzdajReceptComponent" da se zna da se radi o DODAVANJU RECEPTA
        this.listaReceptiService.editMessenger.next(null);
        //Stavljam u LS informaciju je li se radi o izdavanju ili ažuriranju recepta
        localStorage.setItem("editMessenger", JSON.stringify(null));
        //Ako pacijent NIJE TRENUTNO AKTIVAN u obradi
        if(JSON.parse(localStorage.getItem("idObrada")) === null){
            //Dohvaćam sve ID-ove pacijenata kojima je unesena povijest bolesti kada pacijent nije bio aktivan
            this.sharedService.pacijentiIDsObs.pipe(
                take(1),
                tap(pacijentiIDs => {
                    console.log(pacijentiIDs);
                    //Ako se ID pacijenta kojemu je kliknut redak NALAZI u polju ID-ova (tj. njemu je dodana povijest bolesti)
                    if(pacijentiIDs.indexOf(+id) !== -1){
                        //Preusmjeri liječnika na prozor izdavanja recepta
                        this.router.navigate(['./',id],{relativeTo: this.route});
                    }
                    //Ako se ID pacijenta kojemu je klinut redak NE NALAZI u polju ID-ova (tj. NIJE mu još dodana povijest bolesti)
                    else{
                        console.log("tu sam");
                        //Šaljem child komponenti ovaj ID pacijenta
                        this.idPacijent = +id;
                        //Otvaram prozor povijesti bolesti
                        this.isPovijestBolesti = true;
                        //Subjectom davam informaciju child komponenti da dolazim iz izdavanja recepta
                        this.sharedService.receptIliUputnica.next("recept");
                    }
                }),
                takeUntil(this.pretplateSubject)
            ).subscribe();
        }
        //Ako JE PACIJENT AKTIVAN U OBRADI
        else{
            //Treba provjeriti je li ovaj pacijent ima već upisan povijest bolesti za ovu sesiju obrade (možda mu se upisao, pa se prozor izdavanja recepta slučajno zatvorio)
            //Pa da se ne upisuje ponovno povijest bolesti
            this.pacijentiService.provjeraPovijestBolesti(+JSON.parse(localStorage.getItem("idObrada")),+id).pipe(
                tap(brojPovijestiBolesti => {
                    //Ako je "brojPovijestiBolesti" 0
                    if(+brojPovijestiBolesti === 0){
                        //Šaljem child komponenti ovaj ID pacijenta
                        this.idPacijent = +id;
                        //Otvaram prozor povijesti bolesti
                        this.isPovijestBolesti = true;
                        //Subjectom davam informaciju child komponenti da dolazim iz izdavanja recepta
                        this.sharedService.receptIliUputnica.next("recept");
                    }
                    else{
                        //Preusmjeri liječnika na prozor izdavanja recepta
                        this.router.navigate(['./',id],{relativeTo: this.route});
                    }
                })
            ).subscribe();
        }
    }

    //Metoda koja prima poslani event od komponente "PovijestBolestiComponent"
    onClosePovijestBolesti(){
        //Zatvori prozor povijesti bolesti
        this.isPovijestBolesti = false;
    }

    //Ova metoda se izvodi kada se komponenta uništi
    ngOnDestroy(){
        //Postavljam Subject na true da izađem iz pretplata
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}
