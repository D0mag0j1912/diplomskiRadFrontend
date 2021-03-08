import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { catchError,takeUntil,tap } from 'rxjs/operators';
import { Korisnik } from '../shared/modeli/korisnik.model';
import {handleError} from '../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})

export class LoginService implements OnDestroy{
    //Kreiram Subject koji poništava pretplate
    pretplateSubject = new Subject<boolean>();
    //Kreiram boolean varijablu u kojoj ću označiti je li se korisnik automatski odjavio. Ako jest, vrijednost će biti true i neće se prikazati liječnički header
    isAutologin: boolean = false;
    //Varijabla koja označava je li došao odgovor od servera
    response: boolean = false;
    //Varijabla u koju spremam odgovor servera
    responsePoruka: string = null;

    //Kreiram BehaviorSubject u kojega spremam prijavljenog korisnika i pomoću njega možemo dohvaćati podatke prijavljenog korisnika
    user = new BehaviorSubject<Korisnik>(null);

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    private tokenExpirationTimer: any;

    constructor(
        //Dohvaćam http da mogu raditi http requestove sa backendom
        private http: HttpClient,
        //Dohvaćam router da se mogu preusmjeravati
        private router: Router
    ){}

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na unos lozinke
    getLozinka(email: string, lozinka: string){
        let params = new HttpParams().append("email",email);
        params = params.append("lozinka",lozinka);
        return this.http.get<any>(this.baseUrl + 'auth/provjeriPassword.php',{params: params}).pipe(catchError(handleError));
    }   

    //Metoda koja vraća Observable u kojemu se nalaze svi registrirani emailovi
    getAllEmails(){
        return this.http.get<any>(this.baseUrl + 'auth/provjeriEmail.php').pipe(catchError(handleError));
    }

    //Metoda koja služi za prijavu korisnika
    login(email: string, lozinka: string){

        //Šaljem HTTP request backendu i vraćam Observable
        return this.http.post<any>(this.baseUrl + 'auth/login.php',
            {
                email: email,
                lozinka: lozinka
            }
            //Provjeravam greške
            ).pipe(catchError(handleError));
    }

    //Metoda koja sprema novo prijavljenog korisnika u Subject
    public handleLogin(
        email: string,
        lozinka: string,
        token: string,
        tip: string,
        expiresIn: number
    ){
        //Uzimamo trenutni datum i nadodavamo rok trajanja tokena i tako kreiram novi Date objekt u kojemu stoji rok trajanja tokena
        const expirationDate = new Date(new Date().getTime() + expiresIn*1000);
        //Kreiram pomoćni objekt u kojega ću spremiti podatke koje prosljeđujem konstruktoru modela "Korisnik"
        const objekt: any = {tip:tip,email:email,_tokenExpirationDate: expirationDate,lozinka: lozinka,_token:token};
        //Kreiram novog prijavljenog korisnika
        const user = new Korisnik(objekt);
        //Spremam prijavljenog korisnika u Subject
        this.user.next(user);
        //Čim se korisnik prijavi, odmah pozivam metodu za automatsku odjavu
        this.autologout(expiresIn * 1000);
        //Spremam podatke u Session Storage
        sessionStorage.setItem('userData',JSON.stringify(user));
        
    }

    //Metoda za odjavu korisnika
    logout(){
        //Dohvaćam token i tip prijavljenog korisnika
        //Dohvaćam korisnikove podatke iz Session Storagea
        const userData:{
            tip: string;
            email: string;
            _tokenExpirationDate: Date;
            lozinka: string;
            _token: string;
        } = JSON.parse(sessionStorage.getItem('userData'));
        
        //Ako ne postoje nikakvi korisnikovi podatci u spremištu
        if(!userData){
            return;
        }

        //Šaljem podatke (token i tip) backendu i vraćam Observable
        return this.http.post<any>(this.baseUrl + 'auth/logout.php',
            {
                tip: userData.tip,
                token: userData._token  
            }).pipe(
                catchError(handleError),
                tap(podatci=> {
                    //U BehaviorSubject stavljam vrijednost null
                    this.user.next(null);
                    //Preusmjeravam korisnika na login stranicu
                    this.router.navigate(['/login']);
                    //Praznim Session storage
                    sessionStorage.removeItem('userData');
                    
                    //Ako postoji aktivan timer, kada se ručno odlogiramo, resetiraj timer
                    if(this.tokenExpirationTimer){
                        clearTimeout(this.tokenExpirationTimer);
                    }
                    this.tokenExpirationTimer = null;
                }));
    }

    //Kreiram metodu koja će automatski odjaviti korisnika kada token istekne (argument je rok trajanja u ms)
    autologout(expirationDuration: number){
        //Nakon isteka roka trajanja, odjavi korisnika
        this.tokenExpirationTimer = setTimeout(() => {
            //Pretplaćujem se na logout() metodu da mogu uspješno spremiti podatke u bazu
            this.logout().pipe(
                takeUntil(this.pretplateSubject)
            ).subscribe();
        },expirationDuration);
    }

    //Metoda koja se poziva kada se apk refresha (da korisnik ostane prijavljen)
    refreshLogin(){
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
            return;
        }
        //Ako podatci postoje, kreiraj novi objekt korisnika koji je trenutno prijavljen
        const loadedUser = new Korisnik(userData);
        //Ako postoji token korisnika:
        if(loadedUser.token){
            //Spremi u Subject prijavljenog korisnika
            this.user.next(loadedUser);
            //Kada će token isteći budućnosti - današnji datum (u ms)
            const expDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.autologout(expDuration);
        }
    }


    //Pozivam ovu metodu kada se servis uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}