import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Recept } from 'src/app/shared/modeli/recept.model';

@Component({
  selector: 'app-lista-recepti',
  templateUrl: './lista-recepti.component.html',
  styleUrls: ['./lista-recepti.component.css']
})
export class ListaReceptiComponent implements OnInit,OnDestroy{

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Definiram forme
    forma: FormGroup;
    formaPretraga: FormGroup;
    //Oznaka je li recept ponovljiv
    isPonovljiv: boolean = false;
    //Spremam inicijalne recepte
    inicijalniRecepti: Recept[] = [];

    constructor(
        //Dohvaćam router
        private router: Router,
        //Dohvaćam trenutni route
        private route: ActivatedRoute
    ) { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Kreiram formu pretrage
        this.formaPretraga = new FormGroup({
            'pretraga': new FormControl(null)
        });

        //Pretplaćujem se na podatke Resolvera tj. na recepte
        this.route.data.pipe(
            map(podatci => podatci.podatci.recepti),
            tap((recepti: any) => {
                //Inicijaliziram varijablu u kojoj ću spremiti podatke recepata
                let recept;
                //Prolazim kroz objekte sa servera
                for(const r of recepti){
                    //Za svaki objekt recepta, kreiram svoj objekt tipa "Recept"
                    recept = new Recept(r);
                    //Objekt tipa recept dodavam u polje
                    this.inicijalniRecepti.push(recept);
                }
                for(const recept of this.inicijalniRecepti){
                    console.log(recept);
                }
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

}
