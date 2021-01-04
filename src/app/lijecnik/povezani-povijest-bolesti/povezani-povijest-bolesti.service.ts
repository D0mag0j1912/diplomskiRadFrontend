import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class PovezaniPovijestBolestiService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalaze podatci za povezanu povijest bolesti
    getPovijestBolestiPovezanSlucaj(event: {datum: Date,razlogDolaska: string,mkbSifraPrimarna: string},id: number){
        //Kreiram paramse
        let params = new HttpParams().append("datum",event.datum.toString());
        params = params.append("razlogDolaska",event.razlogDolaska);
        params = params.append("mkbSifraPrimarna",event.mkbSifraPrimarna);
        params = params.append("id",id.toString());

        return this.http.get<any>(this.baseUrl + 'otvorenaPovijestBolesti/getPovijestBolestiPovezanSlucaj.php',{params: params}).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable sa svim podatcima povijesti bolesti za trenutno aktivnog pacijenta (BEZ SEKUNDARNIH DIJAGNOZA)
    getPovijestBolesti(id: number){

        let params = new HttpParams().append("id",id.toString());
        return this.http.get<any>(this.baseUrl + 'otvorenaPovijestBolesti/getPovijestBolesti.php',{params:params}).pipe(catchError(this.handleError));
    }
    //Metoda koja vraća Observable sa ŠIFRAMA I NAZIVIMA SEKUNDARNIH DIJAGNOZA za određenu povijest bolesti
    getNazivSekundarna(mkbSifra: string){
        let params = new HttpParams().append("mkbSifra", mkbSifra);
        return this.http.get<any>(this.baseUrl + 'otvorenaPovijestBolesti/getNazivSekundarna.php',{params: params}).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable sa svim povijestima bolesti u kojima se nalazi vrijednost PRETRAGE korisnika
    getPovijestBolestiPretraga(id: number, pretraga: string){

        let params = new HttpParams().append("id",id.toString());
        params = params.append("pretraga",pretraga);
        return this.http.get<any>(this.baseUrl + 'otvorenaPovijestBolesti/getPovijestBolestiPretraga.php',{params: params}).pipe(catchError(this.handleError));
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