import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { PregledList } from '../../modeli/pregledList.model';

@Component({
  selector: 'app-pregledi',
  templateUrl: './pregledi.component.html',
  styleUrls: ['./pregledi.component.css']
})
export class PreglediComponent implements OnInit, OnDestroy{
    //Spremam pretplate
    pretplate = new Subject<boolean>();
    //Deklariram svoju formu
    forma: FormGroup;
    //Oznaka je li se prikaziva datum ili pretraga
    isDatum: boolean = true;
    //Spremam sve preglede u svoje polje
    pregledi: PregledList[] = [];

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute
    ) { }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {
        //Pretplaćujem se na podatke Resolvera
        this.route.data.pipe(
            tap(podatci => {
                console.log(podatci);
                //Inicijaliziram objekt tipa "PregledList"
                let objektPregled: PregledList;
                //Za svaki objekt u polju pregleda
                for(const pregled of podatci.pregledi[0]){
                    //Kreiram svoj objekt
                    objektPregled = new PregledList(pregled);
                    //Pusham ga u svoje polje pregleda
                    this.pregledi.push(objektPregled);
                }
                for(const pregled of this.pregledi){
                    console.log(pregled);
                }
                //Kreiram novu formu
                this.forma = new FormGroup({
                    'filter': new FormControl('datum',[Validators.required]),
                    'datum': new FormControl(podatci.pregledi[1]),
                    'pretraga': new FormControl(null)
                });
            }),
            takeUntil(this.pretplate)
        ).subscribe();
    }

    //Ova metoda se poziva kada se promijeni vrijednost filtera
    onChangeFilter($event: any){
        //Ako je korisnik izabrao datum:
        if($event.target.value === "datum"){
            //Označavam da se prikaže input datuma
            this.isDatum = true;
        }
        //Ako je korisnik izabrao pretragu:
        else{
            //Označavam da je korisnik izabrao pretragu
            this.isDatum = false;
        }
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplate.next(true);
        this.pretplate.complete();
    }

}
