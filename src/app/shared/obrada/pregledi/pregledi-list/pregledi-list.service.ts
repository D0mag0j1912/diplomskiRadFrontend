import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import {baseUrl} from '../../../../backend-path';
import {handleError} from '../../../rxjs-error';


@Injectable({providedIn: 'root'})
export class PreglediListService{
    
    constructor(
        private http: HttpClient
    ){}


    //Metoda koja vraća Observable u kojemu se nalaze svi pregledi za zadanu pretragu
    dohvatiSvePregledePretraga(tipKorisnik: string, idPacijent: number, pretraga: string){
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("tipKorisnik",tipKorisnik);
        params = params.append("idPacijent",idPacijent.toString());
        params = params.append("pretraga", pretraga);
        return this.http.get<any>(baseUrl + 'pregledi/lista-pregleda/dohvatiSvePregledePretraga.php',{params: params}).pipe(catchError(handleError));    
    }
    
    //Metoda koja dohvaća sve preglede za aktivnog pacijenta ZA ZADANI DATUM
    dohvatiPregledePoDatumu(tipKorisnik: string, idPacijent: number, datum: Date){
        let params = new HttpParams().append("tipKorisnik",tipKorisnik);
        params = params.append("idPacijent",idPacijent.toString());
        params = params.append("datum",datum.toString());
        return this.http.get<any>(baseUrl + 'pregledi/lista-pregleda/dohvatiPregledePoDatumu.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća sve preglede za listu 
    dohvatiSvePreglede(tipKorisnik: string, idPacijent: number){
        let params = new HttpParams().append("tipKorisnik",tipKorisnik);
        params = params.append("idPacijent",idPacijent.toString());
        return this.http.get<any>(baseUrl + 'pregledi/lista-pregleda/dohvatiSvePreglede.php',{params: params}).pipe(catchError(handleError));
    }
}