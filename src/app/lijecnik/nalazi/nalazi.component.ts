import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { merge, Subject } from 'rxjs';
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
    //Spremam ID aktivnog pacijenta
    idPacijent: number;
    //Spremam poruku da nema nalaza
    nemaNalaza: string = null;

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
            'datum': new FormControl(null, [Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]),
            'pretraga': new FormControl(null)
        });
        //Na početku onemogućavam filtriranje dok ne povučem podatke
        this.filter.disable({emitEvent: false});
        this.datum.disable({emitEvent: false});

        const combined = merge(
            this.datum.valueChanges.pipe(
                switchMap(datum => {
                    return this.nalaziService.dohvatiNalazePoDatumu(datum,this.idPacijent).pipe(
                        tap(nalazi => {
                            //Ako je odgovor servera null, znači da nema nalaza
                            if(nalazi !== null){
                                this.nemaNalaza = null;
                                //Punim listu nalaza
                                this.napuniNalaze(nalazi);
                            }
                            //Ako nema pronađenih nalaza za traženi datum
                            else{
                                this.nemaNalaza = 'Nema evidentiranih nalaza!';
                            }
                        }),
                        takeUntil(this.pretplata)
                    );
                }),
                takeUntil(this.pretplata)   
            )
        ).subscribe();
    }

    //Metoda koja se aktivira kada liječnik klikne na button "Povuci nalaze"
    povuciNalaze(){
        return this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                return this.obradaService.getPatientProcessing(user.tip).pipe(
                    switchMap(podatci => {
                        return this.nalaziService.dohvatiSveNalaze(+podatci[0].idPacijent).pipe(
                            tap(nalazi => {
                                //Ako je odgovor servera null, znači da nema nalaza
                                if(nalazi !== null){
                                    //Spremam ID aktivnog pacijenta
                                    this.idPacijent = +podatci[0].idPacijent;
                                    //Punim listu nalaza
                                    this.napuniNalaze(nalazi);
                                }
                                //Omogućavam pretragu
                                this.filter.enable({emitEvent: false});
                                this.datum.enable({emitEvent: false});
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

    //Metoda koja puni listu nalaza
    napuniNalaze(response: any){
        //Resetiram polje nalaza da se isti nalazi ne pushaju
        this.nalazi = [];
        //Definiram objekt tipa "NalazList"
        let objektNalazList;
        for(const nalaz of response){
            //Punim svoje objekte
            objektNalazList = new NalazList(nalaz);
            //Jednog po jednog spremam u polje
            this.nalazi.push(objektNalazList);
        }
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
