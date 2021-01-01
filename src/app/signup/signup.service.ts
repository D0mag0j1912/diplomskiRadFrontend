import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import {Korisnik} from '../shared/modeli/korisnik.model';
import {catchError} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SignupService{

    //Kreiram varijablu u kojoj ću pohraniti bazni URL za slanje na backend
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        private http: HttpClient
    ){}

    //Metoda za registraciju
    signup(tip:string, 
        ime: string, 
        prezime: string,
        adresa: string, 
        specijalizacija: string, 
        email: string, 
        lozinka: string, 
        ponovnoLozinka: string){
        
        //Vraćam Observable u kojemu se nalaze podatci koje je PHP vratio
        return this.http.post<Korisnik>(this.baseUrl + 'auth/signup.php', 
                {
                    tip: tip,
                    ime: ime,
                    prezime: prezime,
                    adresa: adresa,
                    specijalizacija: specijalizacija,
                    email: email,
                    lozinka: lozinka,
                    ponovnoLozinka: ponovnoLozinka
                })
                .pipe(catchError(this.handleError));
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