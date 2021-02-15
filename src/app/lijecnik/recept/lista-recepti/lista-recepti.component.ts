import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { PacijentRecept } from 'src/app/shared/modeli/pacijentRecept.model';
import { Recept } from 'src/app/shared/modeli/recept.model';
import { ReceptService } from '../recept.service';
import { ListaReceptiService } from './lista-recepti.service';

@Component({
  selector: 'app-lista-recepti',
  templateUrl: './lista-recepti.component.html',
  styleUrls: ['./lista-recepti.component.css']
})
export class ListaReceptiComponent implements OnInit,OnDestroy{

    //Oznaka je li prikazan prozor prikaza recepta
    prikaz: boolean = false;
    //Spremam ID pacijenta kojemu sam kliknuo na red
    id: number;
    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    formaPretraga: FormGroup;
    //Oznaka je li recept ponovljiv
    isPonovljiv: boolean = false;
    //Spremam inicijalnu poruku da nema registriranih pacijenata u bazi podataka
    inicijalnoNemaPacijenata: string = null;
    //Spremam inicijalnu poruku da trenutno aktivni pacijent nema evidentiranih recepata
    inicijalnoAktivniNemaRezultata: string = null;
    //Spremam poruku da pacijent nema evidentiranih recepata
    nemaRecepata: string = null;
    //Spremam inicijalne recepte
    recepti: Recept[] = [];
    //Spremam imena i prezimena u pomoćno polje
    pacijenti: PacijentRecept[];
    //Oznaka je li se pretražuje
    isPretraga: boolean = true;
    //Poruka koja se prikazuje kada server vrati da nema rezultata pretrage
    porukaPretraga: string = null;

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis liste recepata
        private listaReceptiService: ListaReceptiService,
        //Dohvaćam servis recepata
        private receptService: ReceptService
    ) { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Kreiram formu pretrage
        this.formaPretraga = new FormGroup({
            'pretraga': new FormControl(null)
        });
        //Pretplaćujem se na Subject koji šalje ID-ove pacijenata 
        this.listaReceptiService.prijenosnikObs.pipe(
            switchMap(vrijednost => {
                console.log(vrijednost);
                //Ako je dobivena vrijednost polje
                if(vrijednost){
                    //Dohvaćam recepte tako da prosljeđivam ID-eve pacijenata (prosljeđivam samo ako sam dobio array kao value)
                    return this.listaReceptiService.getReceptiTablica(vrijednost).pipe(
                        tap(odgovor => {
                            console.log(odgovor);
                            //Ako odgovor servera nije null 
                            if(odgovor){
                                //Ako IMA evidentiranih recepata za poslane pacijente
                                if(odgovor["success"] !== "false"){
                                    //Resetiram poruke koja je potrebno resetirati da se prikažu recepti
                                    this.inicijalnoNemaPacijenata = null;
                                    this.inicijalnoAktivniNemaRezultata = null;
                                    this.porukaPretraga = null;
                                    this.nemaRecepata = null;
                                    //Označavam da liječnik pretražuje recepte
                                    this.isPretraga = true;
                                    //Inicijaliziram varijable u koje ću spremiti podatke recepata
                                    let recept;
                                    //Resetiram polje u koje spremam SVE PODATKE evidentiranih recepata
                                    this.recepti = [];
                                    //Prolazim kroz polje u kojemu se nalaze inicijalni recepti sa servera
                                    for(const r of odgovor){
                                        //Za svaki objekt recepta, kreiram svoj objekt tipa "Recept"
                                        recept = new Recept(r);
                                        //Objekt tipa "Recept" dodavam u polje
                                        this.recepti.push(recept);
                                    }
                                    //Kreiram novo polje koje se sastoji od samo podataka pacijenata koji sudjeluju u receptima (ID, imePrezime)
                                    let pacijent = this.recepti.map((objekt) => {
                                        const pom = {idPacijent: objekt.idPacijent, imePrezimePacijent: objekt.imePrezimePacijent};
                                        return pom;
                                    });
                                    //Resetiram polje u koje spremam ID-eve i imena/prezimena pacijenata kojima su evidentirani recepti
                                    this.pacijenti = [];
                                    //Samo jedinstvene pacijente nadodavam u svoje polje 
                                    this.pacijenti = pacijent.filter((objekt,index,polje) => polje.findIndex(obj => (obj.idPacijent === objekt.idPacijent)) === index);
                                }
                                //Ako je poslan samo JEDAN ID pacijenta (zato što je u tablici pacijenata samo jedan redak), te on NEMA evidentiranih recepata
                                else{
                                    //Resetiram poruke koje je potrebno resetirati da se prikaže sljedeća poruka
                                    this.inicijalnoAktivniNemaRezultata = null;
                                    this.inicijalnoNemaPacijenata = null;
                                    //Označavam da nema rezultata pretrage (da se sakriju recepti)
                                    this.isPretraga = false;
                                    //Spremam odgovor servera
                                    this.nemaRecepata = odgovor.message;
                                }
                            } 
                        }),
                        takeUntil(this.pretplateSubject)
                    );
                }
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
                    //Resetiram poruke koja je potrebno resetirati da se prikažu recepti
                    this.inicijalnoNemaPacijenata = null;
                    this.inicijalnoAktivniNemaRezultata = null;
                    this.porukaPretraga = null;
                    this.nemaRecepata = null;
                    //Označavam je liječnik pretražuje recepte (u slučaju da je ostala false)
                    this.isPretraga = true;
                    //Inicijaliziram varijable u koje ću spremiti podatke recepata
                    let recept;
                    //Resetiram polje u koje spremam SVE PODATKE evidentiranih recepata
                    this.recepti = [];
                    //Prolazim kroz polje u kojemu se nalaze inicijalni recepti sa servera
                    for(const r of podatci){
                        //Za svaki objekt recepta, kreiram svoj objekt tipa "Recept"
                        recept = new Recept(r);
                        //Objekt tipa "Recept" dodavam u polje
                        this.recepti.push(recept);
                    }
                    //Kreiram novo polje koje se sastoji od samo podataka pacijenata koji sudjeluju u receptima (ID, imePrezime)
                    let pacijent = this.recepti.map((objekt) => {
                        const pom = {idPacijent: objekt.idPacijent, imePrezimePacijent: objekt.imePrezimePacijent};
                        return pom;
                    });
                    //Resetiram polje u koje spremam ID-eve i imena/prezimena pacijenata kojima su evidentirani recepti
                    this.pacijenti = [];
                    //Samo jedinstvene pacijente nadodavam u svoje polje 
                    this.pacijenti = pacijent.filter((objekt,index,polje) => polje.findIndex(obj => (obj.idPacijent === objekt.idPacijent)) === index);
                }
                //Ako je server inicijalno vratio da nema registriranih pacijenata u bazi 
                else if(podatci["success"] === "false" && podatci["message"] === "Nema pronađenih pacijenata!"){
                    //Resetiram poruke koje je potrebno resetirati da se prikaže sljedeća poruka
                    this.nemaRecepata = null;
                    this.inicijalnoAktivniNemaRezultata = null;
                    //Spremam odgovor servera u svoju varijablu
                    this.inicijalnoNemaPacijenata = podatci.message;
                }
                //Ako je server inicijalno vratio da nema evidentiranih recepata za aktivnog pacijenta 
                else if(podatci["success"] === "false" && podatci["message"] === "Aktivni pacijent nema evidentiranih recepata!"){
                    //Resetiram poruke koje je potrebno resetirati da se prikaže sljedeća poruka
                    this.nemaRecepata = null;
                    this.inicijalnoNemaPacijenata = null;
                    //Spremam odgovor servera u svoju varijablu
                    this.inicijalnoAktivniNemaRezultata = podatci.message;
                }
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
                            this.nemaRecepata = null;
                            //Označavam da ima rezultata
                            this.isPretraga = true;
                            //Inicijaliziram varijable u koje ću spremiti podatke recepata
                            let recept;
                            //Praznim inicijalno polje recepata
                            this.recepti = [];
                            //Prolazim kroz polje u kojemu se nalaze inicijalni recepti sa servera
                            for(const r of odgovor){
                                //Za svaki objekt recepta, kreiram svoj objekt tipa "Recept"
                                recept = new Recept(r);
                                //Objekt tipa "Recept" dodavam u polje
                                this.recepti.push(recept);
                            }
                            //Kreiram novo polje koje se sastoji od samo podataka pacijenata koji sudjeluju u receptima (ID, imePrezime)
                            let pacijent = this.recepti.map((objekt) => {
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

    //Metoda koja se poziva kada liječnik klikne na button "Prikaži recept"
    podiNaPrikaz(id: number){
        //Šaljem prikazu recepta podatke iz ovog retka recepta
        this.id = id;
        //Omogućavam prikaz recepta
        this.prikaz = true;
    }

    //Metoda koja se poziva kada se klikne "Izađi" ili negdje izvan prikaza recepta
    onClosePrikaz(){
        //Zatvori prikaz
        this.prikaz = false;
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
