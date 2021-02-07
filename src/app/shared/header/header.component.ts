import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { LoginService } from 'src/app/login/login.service';
import {takeUntil, tap} from 'rxjs/operators';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Kreiram varijable u kojoj pohranjujem pretplatu
    subs: Subscription;
    subLogout: Subscription;
    subsCombined: Subscription;
    //Deklariram varijablu koja dava informaciju je li korisnik prijavljen ili nije
    prijavljen: boolean = false;

    //Deklariram varijablu koja dava informaciju je li korisnik lijecnik ili nije
    isLijecnik: boolean = false;
    //Deklariram varijablu koja dava informaciju je li korisnik medicinska sestra ili nije
    isMedSestra: boolean = false;
    //Deklariram token timer koji kad istekne, liječnički header se diže
    private tokenExpirationTimer: any;
    //Spremam ID liječnika
    idLijecnik: number;
    //Spremam ID medicinske sestre
    idMedSestra: number;

    constructor(
      //Dohvaćam login servis
      private loginService: LoginService,
      //Dohvaćam header servis
      private headerService: HeaderService
    ) 
    {}
    //Kada se komponenta loada
    ngOnInit(){
      
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
                  //U Subject stavljam tip korisnika da ostale komponente mogu vidjeti tu informaciju
                  this.headerService.tipKorisnika.next(user["tip"]);
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
          }),
          takeUntil(this.pretplateSubject)
      ).subscribe();
      
      //Kombiniram dva Observable-a te dohvaćam odgovor servera
      const combined = forkJoin([
          this.headerService.getIDLijecnik(),
          this.headerService.getIDMedSestra()
      ]).pipe(
          tap(
            //Dohvaćam odgovor servera
            (response) => {
                //Ako ima evidentiranih liječnika:
                if(response[0]["success"] !== "false"){
                    //Dohvaćam ID liječnika
                    this.idLijecnik = response[0][0].idLijecnik;
                }
                //Ako ima evidentiranih medicinskih sestara
                if(response[1]["success"] !== "false"){
                    //Dohvaćam ID medicinske sestre
                    this.idMedSestra = response[1][0].idMedSestra;
                }
          }),
          takeUntil(this.pretplateSubject)
      ).subscribe();

    }

    //Metoda se poziva kada korisnik klikne button "Logout"
    onLogout(){

        this.loginService.logout().pipe(
            tap(podatci => {
                  //Ako postoji aktivan timer, kada se ručno odlogiramo, resetiraj timer
                  if(this.tokenExpirationTimer){
                    clearTimeout(this.tokenExpirationTimer);
                  }
                  this.tokenExpirationTimer = null;
              }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe(
            (podatci) => {
              console.log(podatci);
              //Postavljam varijablu isLijecnik = false da označim da korisnik više nije liječnik i da se header liječnika skrije
              this.isLijecnik = false;
              //Postavljam varijablu isMedSestra = false da označim da korisnik više nije medicinska sestra i da se header medicinske sestre skrije
              this.isMedSestra = false;
            }
        );
    }

    //Kada se klikne na "Logo" u headeru, praznim Session storage
    onClearStorage(){
        sessionStorage.removeItem('userData');
        //Postavljam varijablu isLijecnik = false da označim da korisnik više nije liječnik i da se header liječnika skrije
        this.isLijecnik = false;
        //Postavljam varijablu isMedSestra = false da označim da korisnik više nije medicinska sestra i da se header medicinske sestre skrije
        this.isMedSestra = false;
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
      this.pretplateSubject.next(true);
      this.pretplateSubject.complete();
      this.headerService.tipKorisnika.next(null);
    }

}
