import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, merge, of, Subject, Subscription } from 'rxjs';
import { switchMap,take,takeUntil, tap } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { ObradaService } from '../obrada/obrada.service';
import { PreglediDetailService } from '../obrada/pregledi/pregledi-detail/pregledi-detail.service';
import { PreglediService } from '../obrada/pregledi/pregledi.service';
import { SharedService } from '../shared.service';
import { SekundarniHeaderService } from './sekundarni-header.service';

@Component({
  selector: 'app-sekundarni-header',
  templateUrl: './sekundarni-header.component.html',
  styleUrls: ['./sekundarni-header.component.css']
})
export class SekundarniHeaderComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Spremam pretplatu
    subs: Subscription;
    //Oznaka je li korisnik prijavljen
    prijavljen: boolean = false;
    //Oznaka je li korisnik liječnik
    isLijecnik: boolean = false;
    //Oznaka je li korisnik medicinska sestra
    isMedSestra: boolean = false;
    //Označavam je li pacijent aktivan
    isAktivan: boolean = false;
    //Označavam je li pacijent ima pregleda
    imaLiPregleda: boolean = false;
    //Spremam ID pregleda na koji se preusmjeravam klikom na link "Pregledi" AKO pacijent ima evidentiranih pregleda
    idPregled: number;
    //Definiram formu
    forma: FormGroup;
    //Spremam broj iskazice dopunskog osiguranja aktivnog pacijenta
    brojIskazniceDopunsko: string = null;

    constructor(
        //Dohvaćam login servis
        private loginService: LoginService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis sekundarnog headera
        private sekundarniHeaderService: SekundarniHeaderService,
        //Dohvaćam router
        private router: Router,
        //Dohvaćam servis pregleda
        private preglediService: PreglediService,
        //Dohvaćam servis detalja prethodnih pregleda
        private preglediDetailService: PreglediDetailService,
        //Dohvaćam shared servis
        private sharedService: SharedService
    ) { }

    ngOnInit() {

        //Kreiram formu
        this.forma = new FormGroup({
            'cijena': new FormControl(null)
        });

        const combined = merge(
            //Pretplaćujem se na Subject iz login servisa
            this.loginService.user.pipe(
                tap((user) => {
                    //Ako postoji user u Subjectu, to znači da je prijavljen, ako ne postoji, prijavljen = false
                    this.prijavljen = !user ? false : true;
                    //Ako je korisnik prijavljen
                    if(this.prijavljen){
                        //Ako je tip prijavljenog korisnika "lijecnik":
                        if(user["tip"] == "lijecnik"){
                            //Označavam da se liječnik prijavio
                            this.isLijecnik = true;
                        } else if(user["tip"] == "sestra"){
                            //Označavam da se medicinska sestra prijavila
                            this.isMedSestra = true;
                        }
                    }
                }),
                //Tip prijavljenog korisnika prosljeđujem metodi koja dohvaća podatke aktivnog pacijenta u obradi
                switchMap(user => {
                    //Ako je korisnik prijavljen:
                    if(user){
                        //Dohvaćam podatke aktivnog pacijenta u obradi
                        return this.obradaService.getPatientProcessing(user.tip).pipe(
                            switchMap(odgovor => {
                                //Ako je pacijent aktivan u obradi
                                if(odgovor.success !== "false"){
                                    //Označavam da je pacijent aktivan u obradi
                                    this.isAktivan = true;
                                    //Dohvaćam ID aktivnog pacijenta
                                    const idPacijent = +odgovor[0].idPacijent;
                                    //Spremam broj iskaznice dopunskog osiguranja
                                    if(odgovor[0].brojIskazniceDopunsko){
                                        this.brojIskazniceDopunsko = odgovor[0].brojIskazniceDopunsko;
                                    }
                                    return forkJoin([
                                        this.preglediDetailService.getNajnovijiIDPregled(user.tip,idPacijent),
                                        this.sekundarniHeaderService.getTrenutnaCijenaPregleda(odgovor[0].idObrada, user.tip)
                                    ]).pipe(
                                        tap(podatci => {
                                            console.log(podatci);
                                            //Ako pacijent nema evidentiranih pregleda
                                            if(podatci[0] === null){
                                                //Označavam da pacijent NEMA evidentiranih pregleda
                                                this.imaLiPregleda = false;
                                            }
                                            else{
                                                //Označavam da pacijent IMA evidentiranih pregleda
                                                this.imaLiPregleda = true;
                                                //Spremam ID najnovijeg pregleda za aktivnog pacijenta
                                                this.idPregled = +podatci[0];
                                            }
                                            //Ako je baza vratila null za iznos pregleda
                                            if(podatci[1] === null){
                                                //Emitiram inicijalnu vrijednost iznosa pregleda Subjectom
                                                this.sharedService.emitirajNoviIznosPregleda(parseFloat('0.00'));
                                            }
                                            //Ako je baza vratila neki iznos pregleda
                                            else{
                                                //Emitiram inicijalnu vrijednost iznosa pregleda Subjectom
                                                this.sharedService.emitirajNoviIznosPregleda(parseFloat(podatci[1]));
                                            }
                                        }),
                                        takeUntil(this.pretplateSubject)
                                    );
                                }
                                //Ako pacijent NIJE aktivan u obradi
                                else{
                                    //Označavam da pacijent nije aktivan u obradi
                                    this.isAktivan = false;
                                    return of(null).pipe(
                                        takeUntil(this.pretplateSubject)
                                    );
                                }
                            }),
                            takeUntil(this.pretplateSubject)
                        );
                    }
                    //Ako korisnik nije prijavljen:
                    else{
                        return of(null).pipe(
                            takeUntil(this.pretplateSubject)
                        );
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na Observable da vidim je li novi pregled dodan
            this.preglediService.pregledDodanObs.pipe(
                switchMap(pregledDodan => {
                    //Ako je dodan novi pregled u povijesti bolesti ili općim podatcima pregleda
                    if(pregledDodan.isDodan && pregledDodan.tipKorisnik){
                        //Dohvaćam podatke aktivnog pacijenta u obradi
                        return this.obradaService.getPatientProcessing(pregledDodan.tipKorisnik).pipe(
                            switchMap(odgovor => {
                                //Ako je pacijent aktivan u obradi
                                if(odgovor.success !== "false"){
                                    //Označavam da je pacijent aktivan u obradi
                                    this.isAktivan = true;
                                    //Dohvaćam ID aktivnog pacijenta
                                    const idPacijent = +odgovor[0].idPacijent;
                                    return this.preglediDetailService.getNajnovijiIDPregled(pregledDodan.tipKorisnik,idPacijent).pipe(
                                        tap(idPregled => {
                                            //Ako pacijent nema evidentiranih pregleda
                                            if(idPregled === null){
                                                //Označavam da pacijent NEMA evidentiranih pregleda
                                                this.imaLiPregleda = false;
                                            }
                                            else{
                                                //Označavam da pacijent IMA evidentiranih pregleda
                                                this.imaLiPregleda = true;
                                                //Spremam ID najnovijeg pregleda za aktivnog pacijenta
                                                this.idPregled = +idPregled;
                                            }
                                        }),
                                        takeUntil(this.pretplateSubject)
                                    );
                                }
                                //Ako pacijent NIJE aktivan u obradi
                                else{
                                    //Označavam da pacijent nije aktivan u obradi
                                    this.isAktivan = false;
                                    return of(null).pipe(
                                        takeUntil(this.pretplateSubject)
                                    );
                                }
                            }),
                            takeUntil(this.pretplateSubject)
                        );
                    }
                    else{
                        return of(null).pipe(
                            takeUntil(this.pretplateSubject)
                        );
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na informaciju je li završio pregled
            this.obradaService.obsZavrsenPregled.pipe(
                tap((pregled) => {
                    //Ako je pregled završen
                    if(pregled){
                        //Označavam da pacijent više nije aktivan
                        this.isAktivan = false;
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na informaciju koliko pregled košta
            this.sharedService.cijeneObs.pipe(
                tap(trenutnaCijena => {
                    //Primam naplaćenu cijenu te je stavljam u polje forme
                    this.cijena.patchValue(trenutnaCijena.toFixed(2) + ' kn', {emitEvent: false});
                }),
                takeUntil(this.pretplateSubject)
            )
        ).subscribe();
    }

    //Metoda koja preusmjerava korisnika na stranicu pregleda
    preumjeriNaPregled(){
        //Ako je prijavljen liječnik
        if(this.isLijecnik){
            //Ako je pacijent aktivan
            if(this.isAktivan){
                //Ako pacijent IMA evidentiranih pregleda
                if(this.imaLiPregleda){
                    //Emitiram vrijednost Subjectom da je kliknut "Pregledi"
                    this.sekundarniHeaderService.kliknutHeader.next(true);
                    //Preusmjeravam se na detail stranicu sa ID-em za najnoviji pregled
                    this.router.navigate(['/lijecnik/obrada/pregledi',this.idPregled]);
                }
                //Ako pacijent NEMA evidentiranih pregleda
                else{
                    this.router.navigate(['/lijecnik/obrada/pregledi']);
                }
            }
            //Ako pacijent nije aktivan
            else{
                this.router.navigate(['/lijecnik/obrada/pregledi']);
            }
        }
        //Ako je prijavljena medicinska sestra
        else{
            //Ako je pacijent aktivan
            if(this.isAktivan){
                //Ako pacijent IMA evidentiranih pregleda
                if(this.imaLiPregleda){
                    //Emitiram vrijednost Subjectom da je kliknut "Pregledi"
                    this.sekundarniHeaderService.kliknutHeader.next(true);
                    //Preusmjeravam se na detail stranicu sa ID-em za najnoviji pregled
                    this.router.navigate(['/med-sestra/obrada/pregledi',this.idPregled]);
                }
                //Ako pacijent NEMA evidentiranih pregleda
                else{
                    this.router.navigate(['/med-sestra/obrada/pregledi']);
                }
            }
            //Ako pacijent nije aktivan
            else{
                this.router.navigate(['/med-sestra/obrada/pregledi']);
            }
        }
    }

    //Metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

    get cijena(): FormControl{
        return this.forma.get('cijena') as FormControl;
    }
}
