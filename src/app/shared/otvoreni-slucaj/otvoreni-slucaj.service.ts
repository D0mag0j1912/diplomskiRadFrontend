import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {handleError} from '../rxjs-error';
import {baseUrl} from '../../backend-path';

@Injectable({
    providedIn: 'root'
})
export class OtvoreniSlucajService{

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalaze svi podatci za otvoreni slučaj trenutno aktivnog pacijenta
    getOtvoreniSlucaj(id: number) : Observable<any>{

        let params = new HttpParams().append("id",id.toString());
        return this.http.get<any>(baseUrl + 'otvoreniSlucajevi/getOtvoreniSlucaj.php', {params: params}).pipe(
            catchError(handleError)
        ); 
    }

    //Metoda koja vraća Observable u kojemu se nalaze svi podatci SEKUNDARNIH DIJAGNOZA trenutno aktivnog pacijenta
    getSekundarneDijagnoze(id: number) : Observable<any>{

        let params = new HttpParams().append("id",id.toString());
        return this.http.get<any>(baseUrl + 'otvoreniSlucajevi/getSekundarneDijagnoze.php', {params: params}).pipe(
            catchError(handleError)
        ); 
    }

    //Metoda koja vraća Observable u kojemu se nalazi naziv primarne dijagnoze i njezine sekundarne dijagnoze
    getDijagnozePovezanSlucaj(event: {mkbSifraPrimarna: string, datumPregled: Date,odgovornaOsoba: string}, id: number){
        //Pipremam parametre slanja na backend pomoću params (mkbSifra i ID pacijenta)
        let params = new HttpParams().append("mkbSifra", event.mkbSifraPrimarna);
        params = params.append("datumPregled", event.datumPregled.toString());
        params = params.append("odgovornaOsoba",event.odgovornaOsoba)
        params = params.append("id", id.toString());

        return this.http.get<any>(baseUrl + 'otvoreniSlucajevi/getDijagnozePovezanSlucaj.php', {params: params}).pipe(
            catchError(handleError)
        );
    }

    //Metoda koja vraća Observable u kojemu se nalaze DATUM PREGLEDA, ODGOVORNA OSOBA, MKB ŠIFRA I NAZIV PRIMARNE DIJAGNOZE ZA NAVEDENU PRETRAGU
    getOtvoreniSlucajPretraga(pretraga: string,id: number){
        //Kodiram parametar pretrage
        pretraga = encodeURIComponent(pretraga);
        //Pipremam parametre slanja na backend pomoću params (vrijednost pretrage i ID pacijenta)
        let params = new HttpParams().append("pretraga", pretraga);
        params = params.append("id", id.toString());
        return this.http.get<any>(baseUrl + 'otvoreniSlucajevi/getOtvoreniSlucajPretraga.php', {params: params}).pipe(
            catchError(handleError)
        );
    }

    //Metoda koja vraća Observable u kojemu se nalaze SVE SEKUNDARNE DIJAGNOZE ZA NAVEDENU PRETRAGU
    getSekundarneDijagnozePretraga(pretraga: string,id: number){
        //Kodiram parametar pretrage
        pretraga = encodeURIComponent(pretraga);
        //Pipremam parametre slanja na backend pomoću params (vrijednost pretrage i ID pacijenta)
        let params = new HttpParams().append("pretraga", pretraga);
        params = params.append("id", id.toString());

        return this.http.get<any>(baseUrl + 'otvoreniSlucajevi/getSekundarneDijagnozePretraga.php', {params: params}).pipe(
            catchError(handleError)
        );
    }

}