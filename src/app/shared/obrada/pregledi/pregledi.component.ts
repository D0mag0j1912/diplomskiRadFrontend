import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { HeaderService } from '../../header/header.service';
import { PregledList } from '../../modeli/pregledList.model';
import { SekundarniHeaderService } from '../../sekundarni-header/sekundarni-header.service';
import { ObradaService } from '../obrada.service';
import { PreglediListService } from './pregledi-list/pregledi-list.service';
import { PreglediService } from './pregledi.service';

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
    imaLiPregleda: boolean = true;
    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis prethodnih pregleda
        private preglediService: PreglediService,
        //Dohvaćam servis sekundarnog headera
        private sekundarniHeaderService: SekundarniHeaderService,
        //Dohvaćam servis headera
        private headerService: HeaderService,
        //Dohvaćam servis liste prethodnih pregleda
        private preglediListService: PreglediListService
    ) { }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Pretplaćujem se na podatke Resolvera
        this.route.data.pipe(
            tap(podatci => {
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
                    }
                    //Kreiram novu formu
                    this.forma = new FormGroup({
                        'filter': new FormControl('datum',[Validators.required]),
                        'datum': new FormControl(podatci.pregledi[1]),
                        'pretraga': new FormControl(null)
                    });
                }
            }),
            takeUntil(this.pretplate)
        ).subscribe();

        //Ako je pacijent aktivan
        if(this.isAktivan){
            const combined = merge(
                //Pretplaćujem se na završetak pregleda
                this.obradaService.obsZavrsenPregled.pipe(
                    tap((pregled) => {
                            //Ako je pregled završen
                            if(pregled){
                                //Označavam da pacijent više nije aktivan
                                this.isAktivan = false;
                            }
                    }),
                    takeUntil(this.pretplate)
                ),
                //Pretplaćivam se na događaj klika buttona "Pregledi"
                this.sekundarniHeaderService.kliknutHeaderObs.pipe(
                    switchMap(vrijednost => {
                        //Ako je kliknut button "Pregledi" u sek. headeru
                        if(vrijednost){
                            //Pretplaćujem se na tip korisnika koji je logiran
                            return this.headerService.tipKorisnikaObs.pipe(
                                switchMap(tipKorisnik => {
                                    //Pretplaćujem se na podatke aktivnog korisnika
                                    return this.obradaService.getPatientProcessing(tipKorisnik).pipe(
                                        switchMap(podatci => {
                                            //Ako JE pacijent aktivan u obradi
                                            if(podatci["success"] !== "false"){
                                                return forkJoin([
                                                    this.preglediListService.dohvatiSvePreglede(tipKorisnik,+podatci[0].idPacijent),
                                                    this.preglediService.getNajnovijiDatum(tipKorisnik,+podatci[0].idPacijent)
                                                ]).pipe(
                                                    tap(podatci => {
                                                        //Ako aktivni pacijent NEMA evidentiranih pregleda
                                                        if(podatci[0] === null){
                                                            //Označavam da aktivni pacijent NEMA aktivnih pregleda
                                                            this.imaLiPregleda = false;
                                                        }
                                                        else{
                                                            //Restartam polje pregleda
                                                            this.pregledi = [];
                                                            //Označavam da aktivni pacijent IMA pregleda
                                                            this.imaLiPregleda = true;
                                                            //Inicijaliziram objekt tipa "PregledList"
                                                            let objektPregled: PregledList;
                                                            //Za svaki objekt u polju pregleda
                                                            for(const pregled of podatci[0]){
                                                                //Kreiram svoj objekt
                                                                objektPregled = new PregledList(pregled);
                                                                //Pusham ga u svoje polje pregleda
                                                                this.pregledi.push(objektPregled);
                                                            }
                                                        }
                                                        //Postavljam dohvaćeni najnoviji datum u formu
                                                        this.forma.get('datum').patchValue(podatci[1],{emitEvent: false});
                                                    }),
                                                    takeUntil(this.pretplate)
                                                );
                                            }
                                            //Ako pacijent NIJE aktivan u obradi
                                            else{
                                                return of(null);
                                            }
                                        })
                                    );
                                })
                            );
                        }
                        //Ako nije kliknut button "Pregledi"
                        else{
                            return of(null).pipe(
                                takeUntil(this.pretplate)
                            );
                        }
                    }),
                    takeUntil(this.pretplate)
                ),
                //Pretplaćujem se na informaciju je li ima pregleda za promijenjeni datum u filteru
                this.preglediService.nemaPregledaPoDatumuObs.pipe(
                    tap(vrijednost => {
                        //Ako je vrijednost == true, treba se prikazati poruka da pacijent nema pregleda za promijenjeni datum
                        if(vrijednost){
                            //Prikaži poruku na ekranu
                            this.imaLiPregleda = false;
                            //Odmah resetiram taj Subject 
                            this.preglediService.nemaPregledaPoDatumu.next(false);
                        }
                    })
                ),
                //Slušam promjene u filteru datuma
                this.forma.get('datum').valueChanges.pipe(
                    tap(datum => {
                        console.log(datum);
                        //Vrijednost forme prosljeđivam Subjectu
                        this.preglediService.dateChanged.next(datum);
                    }),
                    takeUntil(this.pretplate)
                )
            ).subscribe();
        }
    }

    //Metoda koja se poziva kada korisnik klikne na element liste (određeni pregled)
    onClickListItem($event){
        //Pretplaćivam se na formatirani datum
        this.preglediService.getFormattedDate($event).pipe(
            tap(datum => {
                //Postavi datum u formu
                this.forma.get('datum').patchValue(datum,{emitEvent: false});
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
        //Restartam Subject završenog pregleda
        this.obradaService.zavrsenPregled.next(false);
        //Restartam Subject dodanog pregleda
        this.preglediService.pregledDodan.next({isDodan: false, tipKorisnik:null});
        //Ažuriram stanje Local Storagea
        localStorage.setItem("isDodanPregled",JSON.stringify({isDodan: false, tipKorisnik:null}));
    }

}
