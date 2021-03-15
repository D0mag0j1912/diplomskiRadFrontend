import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { of, Subject, Subscription } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { ObradaService } from '../obrada/obrada.service';
import { PreglediService } from '../obrada/pregledi/pregledi.service';
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
    //Deklariram token timer koji kad istekne, liječnički header se diže
    private tokenExpirationTimer: any;
    //Spremam ID pregleda na koji se preusmjeravam klikom na link "Pregledi" AKO pacijent ima evidentiranih pregleda
    idPregled: number;

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
        private preglediService: PreglediService
    ) { }

    ngOnInit() {
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
                  //Dohvaćam korisnikove podatke iz Session Storagea
                  const userData: {
                      tip: string;
                      email: string;
                      _tokenExpirationDate: Date;
                      lozinka: string;
                      _token: string;
                  } = JSON.parse(sessionStorage.getItem('userData'));
                  
                  //Ako ne postoje nikakvi korisnikovi podatci u spremištu
                  if(!userData){
                      //Izađi iz ove metode
                      return;
                  }
                  //Računam koliki je rok trajanja tokena 
                  let expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
                  //Postavljam timer na taj interval vremena i kada istekne, poziva se metoda u kojoj skidam liječničke propertye iz headera
                  this.tokenExpirationTimer = setTimeout(() => {
                      //Ako je tip prijavljenog korisnika "lijecnik":
                      if(user["tip"] == "lijecnik"){
                          //Gasim liječnički header
                          this.isLijecnik = false;
                      } else if(user["tip"] == "sestra"){
                          //Gasim sestrin header
                          this.isMedSestra = false;
                      }
                  },expirationDuration);

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
                                return this.sekundarniHeaderService.getNajnovijiIDPregled(user.tip,idPacijent).pipe(
                                    tap(idPregled => {
                                        console.log(idPregled);
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
                //Ako korisnik nije prijavljen:
                else{
                    return of(null).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                }
            }), 
            takeUntil(this.pretplateSubject)
        ).subscribe();
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
                                return this.sekundarniHeaderService.getNajnovijiIDPregled(pregledDodan.tipKorisnik,idPacijent).pipe(
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
                    this.sekundarniHeaderService.ugasiPorukuDaNemaPregleda.next(true);
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

}
