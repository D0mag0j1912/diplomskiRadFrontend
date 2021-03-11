import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { PregledList } from '../../modeli/pregledList.model';
import { ObradaService } from '../obrada.service';

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
    //Oznaka je li pacijent aktivan
    isAktivan: boolean = false;
    //Oznaka ima li aktivni pacijent pregleda
    imaLiPregleda: boolean = false;

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis obrade
        private obradaService: ObradaService
    ) { }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Pretplaćujem se na podatke Resolvera
        this.route.data.pipe(
            tap(podatci => {
                console.log(podatci);
                //Ako pacijent nije aktivan
                if(podatci.pregledi === null){
                    //Označavam da pacijent nije aktivan
                    this.isAktivan = false;
                }
                //Ako je pacijent aktivan
                else{
                    //Označavam da je pacijent aktivan
                    this.isAktivan = true;
                    //Ako aktivni pacijent NEMA evidentiranih pregleda
                    if(podatci.pregledi[0] === null){
                        //Označavam da aktivni pacijent NEMA aktivnih pregleda
                        this.imaLiPregleda = false;
                    }
                    else{
                        //Označavam da aktivni pacijent IMA pregleda
                        this.imaLiPregleda = true;
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
                    }
                }
            }),
            takeUntil(this.pretplate)
        ).subscribe();
        console.log(this.isAktivan);
        //Ako je pacijent aktivan
        if(this.isAktivan){
            //Pretplaćujem se na završetak pregleda
            this.obradaService.obsZavrsenPregled.pipe(
                tap((pregled) => {
                        console.log(pregled);
                        //Ako je pregled završen
                        if(pregled === "zavrsenPregled"){
                            console.log("tu sam");
                            //Označavam da pacijent više nije aktivan
                            this.isAktivan = false;
                        }
                }),
                takeUntil(this.pretplate)
            );
        }
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
