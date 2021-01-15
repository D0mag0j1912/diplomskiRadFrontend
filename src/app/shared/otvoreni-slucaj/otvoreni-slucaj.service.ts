import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class OtvoreniSlucajService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalaze svi podatci za otvoreni slučaj trenutno aktivnog pacijenta
    getOtvoreniSlucaj(tip:string,id: number){

        let params = new HttpParams().append("id",id.toString());
        params = params.append("tip",tip);
        return this.http.get<any>(this.baseUrl + 'otvoreniSlucajevi/getOtvoreniSlucaj.php', {params: params}).pipe(
            catchError(this.handleError)
        ); 
    }

    //Metoda koja vraća Observable u kojemu se nalaze svi podatci SEKUNDARNIH DIJAGNOZA trenutno aktivnog pacijenta
    getSekundarneDijagnoze(tip: string,id: number){

        let params = new HttpParams().append("id",id.toString());
        params = params.append("tip",tip);
        return this.http.get<any>(this.baseUrl + 'otvoreniSlucajevi/getSekundarneDijagnoze.php', {params: params}).pipe(
            catchError(this.handleError)
        ); 
    }

    //Metoda koja vraća Observable u kojemu se nalazi naziv primarne dijagnoze i njezine sekundarne dijagnoze
    getDijagnozePovezanSlucaj(event: {mkbSifraPrimarna: string, datumPregled: Date,odgovornaOsoba: string}, id: number){
        //Pipremam parametre slanja na backend pomoću params (mkbSifra i ID pacijenta)
        let params = new HttpParams().append("mkbSifra", event.mkbSifraPrimarna);
        params = params.append("datumPregled", event.datumPregled.toString());
        params = params.append("odgovornaOsoba",event.odgovornaOsoba)
        params = params.append("id", id.toString());

        return this.http.get<any>(this.baseUrl + 'otvoreniSlucajevi/getDijagnozePovezanSlucaj.php', {params: params}).pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja vraća Observable u kojemu se nalaze DATUM PREGLEDA, ODGOVORNA OSOBA, MKB ŠIFRA I NAZIV PRIMARNE DIJAGNOZE ZA NAVEDENU PRETRAGU
    getOtvoreniSlucajPretraga(tip: string,pretraga: string,id: number){

        //Pipremam parametre slanja na backend pomoću params (vrijednost pretrage i ID pacijenta)
        let params = new HttpParams().append("pretraga", pretraga);
        params = params.append("id", id.toString());
        params = params.append("tip",tip);
        return this.http.get<any>(this.baseUrl + 'otvoreniSlucajevi/getOtvoreniSlucajPretraga.php', {params: params}).pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja vraća Observable u kojemu se nalaze SVE SEKUNDARNE DIJAGNOZE ZA NAVEDENU PRETRAGU
    getSekundarneDijagnozePretraga(pretraga: string,id: number){

        //Pipremam parametre slanja na backend pomoću params (vrijednost pretrage i ID pacijenta)
        let params = new HttpParams().append("pretraga", pretraga);
        params = params.append("id", id.toString());

        return this.http.get<any>(this.baseUrl + 'otvoreniSlucajevi/getSekundarneDijagnozePretraga.php', {params: params}).pipe(
            catchError(this.handleError)
        );
    }

    //Metoda za errore
    private handleError(error: HttpErrorResponse){
        if(error.error instanceof ErrorEvent){
            console.error("An error occured: "+error.error.message);
        }
        else{
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
            `Backend returned code ${error.status}, ` +
            `body was: ${error.error}`);
        }
        // Return an observable with a user-facing error message.
        return throwError(
            'Something bad happened; please try again later.');
    }
}