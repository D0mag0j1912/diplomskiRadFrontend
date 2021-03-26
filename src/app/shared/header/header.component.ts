import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subject} from 'rxjs';
import { LoginService } from 'src/app/login/login.service';
import {switchMap, take, takeUntil, tap} from 'rxjs/operators';
import { HeaderService } from './header.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Deklariram varijablu koja dava informaciju je li korisnik prijavljen ili nije
    prijavljen: boolean = false;

    //Deklariram varijablu koja dava informaciju je li korisnik lijecnik ili nije
    isLijecnik: boolean = false;
    //Deklariram varijablu koja dava informaciju je li korisnik medicinska sestra ili nije
    isMedSestra: boolean = false;
    //Spremam ID liječnika
    idLijecnik: number;
    //Spremam ID medicinske sestre
    idMedSestra: number;

    constructor(
        //Dohvaćam login servis
        private loginService: LoginService,
        //Dohvaćam header servis
        private headerService: HeaderService,
        //Dohvaćam router
        private router: Router
    ) 
    {}
    //Kada se komponenta loada
    ngOnInit(){
      
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
                    this.idLijecnik = +response[0][0].idLijecnik;
                }
                //Ako ima evidentiranih medicinskih sestara
                if(response[1]["success"] !== "false"){
                    //Dohvaćam ID medicinske sestre
                    this.idMedSestra = +response[1][0].idMedSestra;
                }
          }),
          takeUntil(this.pretplateSubject)
      ).subscribe();

    }

    //Metoda se poziva kada korisnik klikne button "Logout"
    onLogout(){

        //Pretplaćivam se na klik logout buttona
        this.loginService.logout().pipe(
            switchMap(() => {
                return this.loginService.user.pipe(
                    tap(user => {
                        //Ako je tip korisnik "lijecnik":
                        if(user.tip === "lijecnik"){
                            //Postavljam varijablu isLijecnik = false da označim da korisnik više nije liječnik i da se header liječnika skrije
                            this.isLijecnik = false;
                        }
                        //Ako je tip korisnika "sestra":
                        else if(user.tip === "sestra"){
                            //Postavljam varijablu isMedSestra = false da označim da korisnik više nije medicinska sestra i da se header medicinske sestre skrije
                            this.isMedSestra = false;
                        }
                    }),
                    takeUntil(this.pretplateSubject)
                );
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }

    //Kada se klikne na "Logo" u headeru
    goToObrada(){
        //Ako je prijavljen liječnik
        if(this.isLijecnik){
            //Preusmjeri me na obradu liječnika
            this.router.navigateByUrl('/lijecnik/obrada/povijestBolesti');
        }
        //Ako je prijavljena medicinska sestra
        else if(this.isMedSestra){
            //Preusmjeri me na obradu medicinske sestre
            this.router.navigateByUrl('/med-sestra/obrada/opciPodatci');
        }
        //Ako nitko nije prijavljen
        else{
            //Preumjeri me na login stranicu
            this.router.navigateByUrl('/login');
        }
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
      this.pretplateSubject.next(true);
      this.pretplateSubject.complete();
    }

}
