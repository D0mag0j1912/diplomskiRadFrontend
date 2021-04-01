import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
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
        //Dohvaćam servis liste prethodnih pregleda
        private preglediListService: PreglediListService,
        //Dohvaćam router
        private router: Router,
        //Dohvaćam servis detalja prethodnih pregleda
        private preglediDetailService: PreglediDetailService,
        //Dohvaćam login servis
        private loginService: LoginService
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
                        console.log("tu sam");
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
                            return this.loginService.user.pipe(
                                take(1),
                                switchMap(user => {
                                    //Pretplaćujem se na podatke aktivnog korisnika
                                    return this.obradaService.getPatientProcessing(user.tip).pipe(
                                        switchMap(podatci => {
                                            //Ako JE pacijent aktivan u obradi
                                            if(podatci["success"] !== "false"){
                                                return forkJoin([
                                                    this.preglediListService.dohvatiSvePreglede(user.tip,+podatci[0].idPacijent),
                                                    this.preglediService.getNajnovijiDatum(user.tip,+podatci[0].idPacijent)
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
                        return this.loginService.user.pipe(
                            take(1),
                            switchMap(user => {
                                //Pretplaćujem se na podatke aktivnog pacijenta
                                return this.obradaService.getPatientProcessing(user.tip).pipe(
                                    switchMap(podatci => {
                                        //Ako je pacijent AKTIVAN
                                        if(podatci["success"] !== "false"){
                                            //Dohvaćam sve pregleda za promijenjeni datum
                                            return this.preglediListService.dohvatiPregledePoDatumu(user.tip,+podatci[0].idPacijent,datum).pipe(
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
                                                        return this.preglediDetailService.getNajnovijiIDPregledZaDatum(user.tip,+podatci[0].idPacijent,datum).pipe(
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
                    debounceTime(300),
                    distinctUntilChanged(),
                    switchMap(value => {
                        //Pretplaćujem se na tip korisnika koji je logiran
                        return this.loginService.user.pipe(
                            take(1),
                            switchMap(user => {
                                //Pretplaćujem se na podatke aktivnog korisnika
                                return this.obradaService.getPatientProcessing(user.tip).pipe(
                                    switchMap(podatci => {
                                        //Ako JE pacijent aktivan u obradi
                                        if(podatci["success"] !== "false"){
                                            //Pretplaćivam se na sve preglede dobivene pretragom
                                            return forkJoin([
                                                this.preglediListService.dohvatiSvePregledePretraga(user.tip,+podatci[0].idPacijent,value),
                                                this.preglediDetailService.getNajnovijiIDPregledZaPretragu(user.tip,+podatci[0].idPacijent,value)
                                            ]).pipe(
                                                tap(pregledi => {
                                                    console.log(pregledi);
                                                    //Ako odgovor servera nije null, tj. ako ovaj pacijent IMA neke evidentirane preglede
                                                    if(pregledi[0] !== null){
                                                        //Ako ima pronađenih pregleda za pretragu
                                                        if(pregledi[0].success !== "false"){
                                                            //Restartam poruku da nema rezultata
                                                            this.porukaNemaRezultata = null;
                                                            //Označavam da aktivni pacijent IMA pregleda
                                                            this.imaLiPregleda = true;
                                                            //Restartam polje pregleda
                                                            this.pregledi = [];
                                                            //Inicijaliziram objekt tipa "PregledList"
                                                            let objektPregled: PregledList;
                                                            //Za svaki objekt u polju pregleda
                                                            for(const pregled of pregledi[0]){
                                                                //Kreiram svoj objekt
                                                                objektPregled = new PregledList(pregled);
                                                                //Pusham ga u svoje polje pregleda
                                                                this.pregledi.push(objektPregled);
                                                            }
                                                            //Preusmjeravam se na ID najnovijeg pregleda za zadanu pretragu (da prvi element liste postane aktivan)
                                                            this.router.navigate(['./',pregledi[1]],{relativeTo: this.route});
                                                        }
                                                        //Ako NEMA pronađenih pregleda za pretragu
                                                        else{
                                                            //Označavam da nema pregleda
                                                            this.imaLiPregleda = false;
                                                            //Spremam odgovor servera
                                                            this.porukaNemaRezultata = pregledi[0].message;
                                                        }
                                                    }
                                                    else{
                                                        //Označavam da pacijent nema pregleda
                                                        this.imaLiPregleda = false;
                                                        //Restartam poruku da nema rezultata pretrage
                                                        this.porukaNemaRezultata = null;
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

    //Metoda koja se aktivira kada se doda novi traženi pregled u listu
    onAzurirajPoljePregleda($event: PregledList[]){
        this.pregledi = $event;
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
