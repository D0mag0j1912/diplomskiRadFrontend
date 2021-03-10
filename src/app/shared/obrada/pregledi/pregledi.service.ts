import { Time } from "@angular/common";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import {baseUrl} from '../../../backend-path';
import {handleError} from '../../rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class PreglediService {
    constructor(
        private http: HttpClient
    ){}

    //Metoda koja vraća sve sekundarne dijagnoze za zadani ID pregleda ili ID povijesti bolesti
    dohvatiSekundarneDijagnoze(datum: Date,vrijeme: Time,mkbSifraPrimarna: string, tipSlucaj: string, idPacijent: number,tipKorisnik: string){
        let params = new HttpParams().append("datum",datum.toString());
        params = params.append("vrijeme",vrijeme.toString());
        params = params.append("mkbSifraPrimarna",mkbSifraPrimarna);
        params = params.append("tipSlucaj",tipSlucaj);
        params = params.append("idPacijent",idPacijent.toString());
        params = params.append("tipKorisnik",tipKorisnik);
        return this.http.get<any>(baseUrl + 'pregledi/pregledi-detail/dohvatiSekundarneDijagnoze.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable sa svim podatcima pregleda (ili opći podatci ili povijest bolesti, zavisi od tipa korisnika)
    dohvatiCijeliPregled(id: number,tipKorisnik: string){
        let params = new HttpParams().append("id",id.toString());
        params = params.append("tipKorisnik",tipKorisnik);
        return this.http.get<any>(baseUrl + 'pregledi/pregledi-detail/dohvatiCijeliPregled.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća sve preglede za listu 
    dohvatiSvePreglede(tipKorisnik: string, idPacijent: number, datum: Date){
        let params = new HttpParams().append("tipKorisnik",tipKorisnik);
        params = params.append("idPacijent",idPacijent.toString());
        params = params.append("datum",datum.toString());

        return this.http.get<any>(baseUrl + 'pregledi/dohvatiSvePregledePoDatumu.php',{params: params}).pipe(catchError(handleError));
    }
}