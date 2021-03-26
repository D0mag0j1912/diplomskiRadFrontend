import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { NalazList } from 'src/app/shared/modeli/nalazList.model';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
import { NalaziService } from './nalazi.service';

@Component({
  selector: 'app-nalazi',
  templateUrl: './nalazi.component.html',
  styleUrls: ['./nalazi.component.css']
})
export class NalaziComponent implements OnInit, OnDestroy{

    //Spremam pretplatu
    pretplata = new Subject<boolean>();
    //Definiram formu
    forma: FormGroup;
    //Oznaka je li se pretraživa po datumu
    isDatum: boolean = true;
    //Spremam sve dohvaćene nalaze 
    nalazi: NalazList[] = [];

    constructor(
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis logina
        private loginService: LoginService,
        //Dohvaćam servis nalaza
        private nalaziService: NalaziService
    ) { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit(){
        //Kreiram formu
        this.forma = new FormGroup({
            'filter': new FormControl("datum"),
            'datum': new FormControl(null),
            'pretraga': new FormControl(null)
        });
        //Na početku onemogućavam filtriranje dok ne povučem podatke
        this.filter.disable({emitEvent: false});
        this.datum.disable({emitEvent: false});
    }

    //Metoda koja se aktivira kada liječnik klikne na button "Povuci nalaze"
    povuciNalaze(){
        this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                return this.obradaService.getPatientProcessing(user.tip).pipe(
                    switchMap(podatci => {
                        return this.nalaziService.dohvatiSveNalaze(+podatci[0].idPacijent).pipe(
                            tap(nalazi => {
                                //Ako je odgovor servera null, znači da se procedura nije uspješno okinula
                                if(nalazi !== null){
                                    //Definiram objekt tipa "NalazList"
                                    let objektNalazList;
                                    for(const nalaz of nalazi){
                                        //Punim svoje objekte
                                        objektNalazList = new NalazList(nalaz);
                                        //Jednog po jednog spremam u polje
                                        this.nalazi.push(objektNalazList);
                                    }
                                    for(const nalaz of this.nalazi){
                                        console.log(nalaz);
                                    }
                                }
                            }),
                            takeUntil(this.pretplata)
                        );
                    }),
                    takeUntil(this.pretplata)
                );
            }),
            takeUntil(this.pretplata)
        ).subscribe();
    }

    //Metoda koja se pokreće kada se promijeni vrijednost filtera
    onChangeFilter($event: string){
        //Ako je vrijednost filtera datum:
        if($event === "datum"){
            //Označavam da se pretraživa po datumu
            this.isDatum = true;
        }
        //Ako je nešto drugo
        else{
            //Označavam da se ne pretraživa po datumu
            this.isDatum = false;
        }
    }

    //Ova metoda se pokreće kada se komponenta uništi
    ngOnDestroy(){
        this.pretplata.next(true);
        this.pretplata.complete();
    }

    get filter(): FormControl{
        return this.forma.get('filter') as FormControl;
    }
    get datum(): FormControl{
        return this.forma.get('datum') as FormControl;
    }
    get pretraga(): FormControl{
        return this.forma.get('pretraga') as FormControl;
    }
}
