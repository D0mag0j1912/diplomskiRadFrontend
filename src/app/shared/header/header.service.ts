import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import {catchError} from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class HeaderService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        private http: HttpClient
    ){}

    //Metoda koja dohvaća ID liječnika
    getIDLijecnik(){
        //Šalje zahtjev serveru i vraća Observable u kojem se nalazi odgovor servera
        return this.http.get(this.baseUrl + 'lijecnik/getIDLijecnik.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja dohvaća ID medicinske sestre
    getIDMedSestra(){
        //Šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor servera
        return this.http.get(this.baseUrl + 'med-sestra/getIDMedSestra.php').pipe(
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