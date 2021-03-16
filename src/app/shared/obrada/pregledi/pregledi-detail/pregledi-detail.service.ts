import { Injectable } from "@angular/core";
import {handleError} from '../../../rxjs-error';
import {baseUrl} from '../../../../backend-path';
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Time } from "@angular/common";

@Injectable({
    providedIn: 'root'
})
export class PreglediDetailService{
    constructor(
        private http: HttpClient
    ){}

    //Metoda koja dohvaća najnoviji ID pregleda za ZADANI DATUM (kada se filtrira datum)
    getNajnovijiIDPregledZaDatum(tipKorisnik: string, idPacijent: number,datum: Date){
        let params = new HttpParams().append("tipKorisnik",tipKorisnik);
        params = params.append("idPacijent",idPacijent.toString());
        params = params.append("datum",datum.toString());
        return this.http.get<any>(baseUrl + 'pregledi/najnoviji/dohvatiNajnovijiIDPregledZaDatum.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja dohvaća ID najnovnijeg pregleda 
    getNajnovijiIDPregled(tipKorisnik: string, idPacijent: number){
        let params = new HttpParams().append("tipKorisnik",tipKorisnik);
        params = params.append("idPacijent",idPacijent.toString());
        return this.http.get<any>(baseUrl + 'pregledi/najnoviji/dohvatiNajnovijiIDPregled.php',{params: params}).pipe(catchError(handleError));
    }

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
}   