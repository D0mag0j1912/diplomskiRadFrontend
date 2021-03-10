import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {catchError} from 'rxjs/operators';
import {handleError} from '../rxjs-error';
import {baseUrl} from '../../backend-path';

@Injectable({
    providedIn: 'root'
})
export class HeaderService{

    //Kreiram Subject koji će nositi tip prijavljenog korisnika u sebi
    tipKorisnika = new BehaviorSubject<string>(null);
    //Kreiram Observable od njega
    tipKorisnikaObs = this.tipKorisnika.asObservable();

    constructor(
        private http: HttpClient
    ){}

    //Metoda koja dohvaća ID liječnika
    getIDLijecnik(){
        //Šalje zahtjev serveru i vraća Observable u kojem se nalazi odgovor servera
        return this.http.get(baseUrl + 'lijecnik/getIDLijecnik.php').pipe(
            catchError(handleError)
        );
    }

    //Metoda koja dohvaća ID medicinske sestre
    getIDMedSestra(){
        //Šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor servera
        return this.http.get(baseUrl + 'med-sestra/getIDMedSestra.php').pipe(
            catchError(handleError)
        );
    }

}