import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';
import { Recept } from 'src/app/shared/modeli/recept.model';
import { PacijentiService } from '../pacijenti/pacijenti.service';
import { ListaReceptiService } from './lista-recepti.service';

@Component({
  selector: 'app-lista-recepti',
  templateUrl: './lista-recepti.component.html',
  styleUrls: ['./lista-recepti.component.css']
})
export class ListaReceptiComponent implements OnInit,OnDestroy{

    //Oznaka je li prikazan prozor prikaza recepta
    prikaz: boolean = false;
    //Spremam podatke Recepta kojemu sam kliknuo na red
    poslaniRecept: Recept;
    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    formaPretraga: FormGroup;
    //Oznaka je li recept ponovljiv
    isPonovljiv: boolean = false;
    //Spremam inicijalnu poruku da nema registriranih pacijenata u bazi podataka
    inicijalnoNemaPacijenata: string = null;
    //Spremam inicijalnu poruku da trenutno aktivni pacijent nema evidentiranih recepata
    inicijalnoAktivniNemaRezultata: string = null;
    //Spremam poruku da nitko od pacijenata nema evidentianih recepata
    nemaNitkoRecept: string = null;
    //Spremam poruku da pacijent nema evidentiranih recepata
    nemaRecepata: string = null;
    //Spremam inicijalne recepte
    recepti: Recept[] = [];
    //Spremam imena i prezimena u pomoćno polje
    pacijenti: Pacijent[];
    //Oznaka je li se pretražuje
    isPretraga: boolean = true;
    //Poruka koja se prikazuje kada server vrati da nema rezultata pretrage
    porukaPretraga: string = null;
    //Kreiram polje u koje ću spremiti ID-ove pacijenata koji posjeduju recepte u listi recepata
    ids: string[] = [];

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis liste recepata
        private listaReceptiService: ListaReceptiService,
        //Dohvaćam servis pacijenata
        private pacijentiService: PacijentiService,
        //Dohvaćam router zbog preusmjeravanja na ažuriranje recepta
        private router: Router
    ) { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Kreiram formu pretrage
        this.formaPretraga = new FormGroup({
            'pretraga': new FormControl(null)
        });
        //Pretplaćujem se na Subject koji šalje ID-ove pacijenata
        this.listaReceptiService.prijenosnikUListuRecepataObs.pipe(
            debounceTime(100),
            switchMap(vrijednost => {
                console.log("Primljena vrijednost ID-ova: " + vrijednost);
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
                                    this.nemaNitkoRecept = null;
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
                                        const pac = new Pacijent(pom);
                                        return pac;
                                    });
                                    //Resetiram polje u koje spremam ID-eve i imena/prezimena pacijenata kojima su evidentirani recepti
                                    this.pacijenti = [];
                                    //Samo jedinstvene pacijente nadodavam u svoje polje
                                    this.pacijenti = pacijent.filter((objekt,index,polje) => polje.findIndex(obj => (obj.id === objekt.id)) === index);
                                }
                                //Ako je poslan samo JEDAN ID pacijenta (zato što je u tablici pacijenata samo jedan redak), te on NEMA evidentiranih recepata
                                else if(odgovor["success"] === "false" && odgovor["message"] !== "Nema evidentiranih recepata!"){
                                    //Resetiram poruke koje je potrebno resetirati da se prikaže sljedeća poruka
                                    this.inicijalnoAktivniNemaRezultata = null;
                                    this.inicijalnoNemaPacijenata = null;
                                    this.nemaNitkoRecept = null;
                                    //Označavam da nema rezultata pretrage (da se sakriju recepti)
                                    this.isPretraga = false;
                                    //Spremam odgovor servera
                                    this.nemaRecepata = odgovor.message;
                                }
                                //Ako je poslano više ID-ova pacijenata te nijedan od njih nema evidentiranih recepata
                                else if(odgovor["success"] === "false" && odgovor["message"] === "Nema evidentiranih recepata!"){
                                    //Resetiram poruke koje je potrebno resetirati
                                    this.inicijalnoAktivniNemaRezultata = null;
                                    this.inicijalnoNemaPacijenata = null;
                                    this.nemaRecepata = null;
                                    //Označavam da nema rezultata pretrage (da se sakriju recepti)
                                    this.isPretraga = false;
                                    //Spremam odgovor servera
                                    this.nemaNitkoRecept = odgovor.message;
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
                    this.nemaNitkoRecept = null;
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
                    console.log(this.recepti);
                    //Kreiram novo polje koje se sastoji od samo podataka pacijenata koji sudjeluju u receptima (ID, imePrezime)
                    let pacijent = this.recepti.map((objekt) => {
                        const pom = {idPacijent: objekt.idPacijent, imePrezimePacijent: objekt.imePrezimePacijent};
                        const pac = new Pacijent(pom);
                        return pac;
                    });
                    //Resetiram polje u koje spremam ID-eve i imena/prezimena pacijenata kojima su evidentirani recepti
                    this.pacijenti = [];
                    //Samo jedinstvene pacijente nadodavam u svoje polje
                    this.pacijenti = pacijent.filter((objekt,index,polje) => polje.findIndex(obj => (obj.id === objekt.id)) === index);
                }
                //Ako je server inicijalno vratio da nema registriranih pacijenata u bazi
                else if(podatci["success"] === "false" && podatci["message"] === "Nema pronađenih pacijenata!"){
                    //Resetiram poruke koje je potrebno resetirati da se prikaže sljedeća poruka
                    this.nemaRecepata = null;
                    this.inicijalnoAktivniNemaRezultata = null;
                    this.nemaNitkoRecept = null;
                    //Spremam odgovor servera u svoju varijablu
                    this.inicijalnoNemaPacijenata = podatci.message;
                }
                //Ako je server inicijalno vratio da nema evidentiranih recepata za aktivnog pacijenta
                else if(podatci["success"] === "false" && podatci["message"] === "Aktivni pacijent nema evidentiranih recepata!"){
                    //Resetiram poruke koje je potrebno resetirati da se prikaže sljedeća poruka
                    this.nemaRecepata = null;
                    this.inicijalnoNemaPacijenata = null;
                    this.nemaNitkoRecept = null;
                    //Spremam odgovor servera u svoju varijablu
                    this.inicijalnoAktivniNemaRezultata = podatci.message;
                }
                else if(podatci["success"] === "false" && podatci["message"] === "Nema evidentiranih recepata!"){
                    //Resetiram poruke koje je potrebno resetirati da se prikaže sljedeća poruka
                    this.nemaRecepata = null;
                    this.inicijalnoNemaPacijenata = null;
                    this.inicijalnoAktivniNemaRezultata = null;
                    //Spremam odgovor servera u svoju varijablu
                    this.nemaNitkoRecept = podatci.message;
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
                        console.log(odgovor);
                        //Ako je server vratio neke rezultate (recepte)
                        if(odgovor["success"] !== "false"){
                            //Praznim poruke da nema rezultata
                            this.porukaPretraga = null;
                            this.inicijalnoNemaPacijenata = null;
                            this.inicijalnoAktivniNemaRezultata = null;
                            this.nemaRecepata = null;
                            this.nemaNitkoRecept = null;
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
                                const pac = new Pacijent(pom);
                                return pac;
                            });
                            //Praznim polje pacijenata
                            this.pacijenti = [];
                            //Samo jedinstvene pacijente nadodavam u svoje polje
                            this.pacijenti = pacijent.filter((objekt,index,polje) => polje.findIndex(obj => (obj.id === objekt.id)) === index);
                            //Kreiram svoje novo polje koje će uzeti samo ID-ove iz polja rezultata
                            this.ids = this.pacijenti.map((objekt) => {
                                return objekt.id.toString();
                            });
                            //Pošalji te ID-eve tablici pacijenata
                            this.pacijentiService.prijenosnikUTablicuPacijenata.next(this.ids);
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
    podiNaPrikaz(recept: Recept){
        //Šaljem prikazu recepta podatke iz ovog retka recepta
        this.poslaniRecept = new Recept(recept);
        //Omogućavam prikaz recepta
        this.prikaz = true;
    }

    //Metoda koja se poziva kada liječnik klikne na button "Ažuriraj recept"
    azurirajRecept(recept: Recept){
        //Šaljem podatke recepta komponenti "IzdajReceptComponent" da se zna da se radi o AŽURIRANJU RECEPTA
        this.listaReceptiService.editMessenger.next(recept);
        //Stavljam u LS informaciju je li se radi o ažuriranju recepta ili izdavanju recepta
        localStorage.setItem("editMessenger", JSON.stringify(recept));
        //Preusmjeri liječnika na prozor ažuriranja recepta
        this.router.navigate(['./',recept.idPacijent],{relativeTo: this.route});
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
