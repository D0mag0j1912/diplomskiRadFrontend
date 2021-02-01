import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';

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
    //Deklariram token timer koji kad istekne, liječnički header se diže
    private tokenExpirationTimer: any;
    constructor(
      //Dohvaćam login servis
      private loginService: LoginService
    ) { }

    ngOnInit() {
      //Pretplaćujem se na Subject iz login servisa
      this.loginService.user.pipe(
          tap(
            (user) => {
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
                    console.log("istekao sam");
                },expirationDuration);

              }
            }
          ),
          takeUntil(this.pretplateSubject)
      ).subscribe();
    }

    //Metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

}
