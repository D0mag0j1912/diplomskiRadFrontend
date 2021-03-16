import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';
import { HeaderService } from '../../header/header.service';
import { PregledList } from '../../modeli/pregledList.model';
import { SekundarniHeaderService } from '../../sekundarni-header/sekundarni-header.service';
import { ObradaService } from '../obrada.service';
import { PreglediDetailService } from './pregledi-detail/pregledi-detail.service';
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
    //Kreiram varijablu u kojoj spremam poruku servera u slučaju da nema rezultata za pretragu
    porukaNemaRezultata: string = null;

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
        private preglediListService: PreglediListService,
        //Dohvaćam router
        private router: Router,
        //Dohvaćam servis detalja prethodnih pregleda
        private preglediDetailService: PreglediDetailService
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
                //Slušam promjene u filteru datuma
                this.forma.get('datum').valueChanges.pipe(
                    debounceTime(100),
                    distinctUntilChanged(),
                    switchMap(datum => {
                        //Pretplaćujem se na trenutni tip logiranog korisnika
                        return this.headerService.tipKorisnikaObs.pipe(
                            switchMap(tipKorisnik => {
                                //Pretplaćujem se na podatke aktivnog pacijenta
                                return this.obradaService.getPatientProcessing(tipKorisnik).pipe(
                                    switchMap(podatci => {
                                        //Ako je pacijent AKTIVAN
                                        if(podatci["success"] !== "false"){
                                            //Dohvaćam sve pregleda za promijenjeni datum
                                            return this.preglediListService.dohvatiPregledePoDatumu(tipKorisnik,+podatci[0].idPacijent,datum).pipe(
                                                mergeMap(pregledi => {
                                                    //Ako aktivni pacijent IMA evidentiranih pregleda za taj datum
                                                    if(pregledi !== null){
                                                        //Označavam da ima pregleda
                                                        this.imaLiPregleda = true;
                                                        //Praznim polje pregleda 
                                                        this.pregledi = [];
                                                        let objektPregled;
                                                        //Prolazim kroz sve preglede u odgovoru servera
                                                        for(const pregled of pregledi){
                                                            //Za svaki odgovor servera, kreiram svoj objekt
                                                            objektPregled = new PregledList(pregled);
                                                            //Dodavam ga u polje koje ažurira template
                                                            this.pregledi.push(objektPregled);
                                                        }
                                                        return this.preglediDetailService.getNajnovijiIDPregledZaDatum(tipKorisnik,+podatci[0].idPacijent,datum).pipe(
                                                            tap(idPregled => {
                                                                //Ako pacijent IMA evidentiranih pregleda za PROMIJENJENI DATUM U FILTERU
                                                                if(idPregled !== null){
                                                                    //Preusmjeravam se na detail stranicu sa ID-em najnovijeg pregleda za promijenjeni datum
                                                                    this.router.navigate(['./',idPregled],{relativeTo: this.route});
                                                                }
                                                            }),
                                                            takeUntil(this.pretplate) 
                                                        );
                                                    }
                                                    //Ako aktivni pacijent NEMA evidentiranih pregleda za taj datum
                                                    else{
                                                        //Označavam da NEMA pregleda
                                                        this.imaLiPregleda = false;
                                                        return of(null).pipe(
                                                            takeUntil(this.pretplate)
                                                        );
                                                    }
                                                }),
                                                takeUntil(this.pretplate)
                                            );
                                        }
                                        //Ako pacijent NIJE AKTIVAN
                                        else{
                                            return of(null).pipe(
                                                takeUntil(this.pretplate)
                                            );
                                        }
                                    }),
                                    takeUntil(this.pretplate)
                                );
                            })
                        );
                    }),
                    takeUntil(this.pretplate)
                ),
                //Pretplaćujem se promjene u pretrazi
                this.forma.get('pretraga').valueChanges.pipe(
                    debounceTime(200),
                    distinctUntilChanged(),
                    switchMap(value => {
                        //Pretplaćujem se na tip korisnika koji je logiran
                        return this.headerService.tipKorisnikaObs.pipe(
                            switchMap(tipKorisnik => {
                                //Pretplaćujem se na podatke aktivnog korisnika
                                return this.obradaService.getPatientProcessing(tipKorisnik).pipe(
                                    switchMap(podatci => {
                                        //Ako JE pacijent aktivan u obradi
                                        if(podatci["success"] !== "false"){
                                            //Pretplaćivam se na sve preglede dobivene pretragom
                                            return this.preglediListService.dohvatiSvePregledePretraga(tipKorisnik,+podatci[0].idPacijent,value).pipe(
                                                tap(pregledi => {
                                                    //Ako ima pronađenih pregleda za pretragu
                                                    if(pregledi.success !== "false"){
                                                        //Restartam poruku da nema rezultata
                                                        this.porukaNemaRezultata = null;
                                                        //Označavam da aktivni pacijent IMA pregleda
                                                        this.imaLiPregleda = true;
                                                        //Restartam polje pregleda
                                                        this.pregledi = [];
                                                        //Inicijaliziram objekt tipa "PregledList"
                                                        let objektPregled: PregledList;
                                                        //Za svaki objekt u polju pregleda
                                                        for(const pregled of pregledi){
                                                            //Kreiram svoj objekt
                                                            objektPregled = new PregledList(pregled);
                                                            //Pusham ga u svoje polje pregleda
                                                            this.pregledi.push(objektPregled);
                                                        } 
                                                    }
                                                    //Ako NEMA pronađenih pregleda za pretragu
                                                    else{
                                                        //Označavam da nema pregleda
                                                        this.imaLiPregleda = false;
                                                        //Spremam odgovor servera
                                                        this.porukaNemaRezultata = pregledi.message;
                                                    }
                                                }),
                                                takeUntil(this.pretplate)
                                            );
                                        }
                                        //Ako pacijent nije aktivan u obradi
                                        else{
                                            return of(null).pipe(
                                                takeUntil(this.pretplate)
                                            );
                                        }
                                    }),
                                    takeUntil(this.pretplate)
                                );
                            }),
                            takeUntil(this.pretplate)
                        );
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
