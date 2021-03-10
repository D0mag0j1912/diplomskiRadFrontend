import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError} from 'rxjs/operators';
import {handleError} from '../shared/rxjs-error';
import {baseUrl} from '../backend-path';

@Injectable({
    providedIn: 'root'
})
export class SignupService{

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
        return this.http.post<any>(baseUrl + 'auth/signup.php', 
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
                .pipe(catchError(handleError));
    }
}