import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { merge, of, Subject} from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { NalazList } from './nalazList.model';
import { NalaziService } from './nalazi.service';
import { ActivatedRoute } from '@angular/router';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';

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
    //Spremam oznaku je li pacijent aktivan
    isAktivan: boolean = false;

    constructor(
        //Dohvaćam servis nalaza
        private nalaziService: NalaziService,
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis dialoga
        private dialog: MatDialog
    ) { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit(){
        this.route.data.pipe(
            map(podatci => podatci.aktivan),
            tap(podatci => {
                //Ako pacijent NIJE aktivan
                if(podatci.success === "false"){
                    //Označavam da pacijent nije aktivan
                    this.isAktivan = false;
                }
                //Ako JE pacijent aktivan
                else{
                    //Označavam da je pacijent aktivan
                    this.isAktivan = true;
                    //Spremam ID aktivnog pacijenta
                    this.idPacijent = +podatci[0].idPacijent;
                    //Kreiram formu
                    this.forma = new FormGroup({
                        'filter': new FormControl("datum"),
                        'datum': new FormControl(null, [Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]),
                        'pretraga': new FormControl(null)
                    });
                    //Na početku onemogućavam filtriranje dok ne povučem podatke
                    this.filter.disable({emitEvent: false});
                    this.datum.disable({emitEvent: false});
                }
            }),
            takeUntil(this.pretplata)
        ).subscribe();

        //Ako JE pacijent aktivan
        if(this.isAktivan){
            const combined = merge(
              //Pretplaćujem se na završetak pregleda
              this.obradaService.obsZavrsenPregled.pipe(
                    tap(() => {
                        //Označavam da pacijent više nije aktivan
                        this.isAktivan = false;
                    }),
                    takeUntil(this.pretplata)
              ),
              this.datum.valueChanges.pipe(
                  switchMap(datum => {
                      //Ako datum nije null (stavljam ga na null kada stisnem "Povuci nalaze")
                      if(datum !== null){
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
                              })
                          );
                      }
                      else{
                          return of(null);
                      }
                  }),
                  takeUntil(this.pretplata)
              ),
              //Pretplaćujem se na promjene u polju tekstualne pretrage
              this.pretraga.valueChanges.pipe(
                  debounceTime(300),
                  distinctUntilChanged(),
                  switchMap(value => {
                      //Ako value nije null (stavljam ga na null kada stisnem "Povuci nalaze")
                      if(value !== null){
                          return this.nalaziService.dohvatiNalazePoTekstu(value, this.idPacijent).pipe(
                              tap(nalazi => {
                                  //Ako je server vratio nalaze
                                  if(nalazi.success !== "false"){
                                        //Resetiram poruku da nema nalaza
                                        this.nemaNalaza = null;
                                        //Punim listu nalaza
                                        this.napuniNalaze(nalazi);
                                    }
                                    //Ako je server vratio da nema rezultata
                                    else{
                                        this.nemaNalaza = 'Nema evidentiranih nalaza!';
                                    }
                                })
                            );
                        }
                        //Ako je value null, nastavljam stream
                        else{
                            return of(null);
                        }
                    }),
                    takeUntil(this.pretplata)
                )
            ).subscribe();
        }
    }

    //Metoda koja se aktivira kada liječnik klikne na button "Povuci nalaze"
    povuciNalaze(){
        //Ako je pacijent aktivan
        if(this.isAktivan){
            this.nalaziService.dohvatiSveNalaze(this.idPacijent).pipe(
                tap(nalazi => {
                    //Ako IMA nalaza za ovog aktivnog pacijenta
                    if(nalazi.length > 0){
                        //Punim listu nalaza
                        this.napuniNalaze(nalazi);
                        //Omogućavam pretragu
                        this.filter.enable({emitEvent: false});
                        this.datum.enable({emitEvent: false});
                        //Resetiram datum
                        this.datum.reset();
                        this.pretraga.reset();
                    }
                    //Ako NEMA nalaza za ovog aktivnog pacijenta
                    else{
                        //Otvaram dialog
                        this.dialog.open(DialogComponent, {data: {message: 'Aktivni pacijent nema primljenih nalaza!'}});
                    }
                })
            ).subscribe();
        }
        //Ako pacijent NIJE aktivan
        else{
            //Otvaram dialog
            this.dialog.open(DialogComponent, {data: {message: 'Pacijent nije aktivan u obradi!'}});
        }
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
    onChangeFilter($event: any){
        //Ako je vrijednost filtera datum:
        if($event.target.value === "datum"){
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
