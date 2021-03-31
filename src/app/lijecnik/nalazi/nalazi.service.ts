import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import {baseUrl} from '../../backend-path';
import {handleError} from '../../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class NalaziService {

    constructor(private http: HttpClient){}

    //Metoda koja pretraživa nalaze po text pretrazi
    dohvatiNalazePoTekstu(pretraga: string, idPacijent: number){
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("pretraga",pretraga);
        params = params.append("idPacijent",idPacijent.toString());
        return this.http.get<any>(baseUrl + 'nalazi/lista-nalaza/dohvatiNalazePoTekstu.php', {params: params}).pipe(catchError(handleError));
    }

    //Metoda koja pretraživa nalaze po datumu
    dohvatiNalazePoDatumu(datum: Date, idPacijent: number){
        let params = new HttpParams().append("datum",datum.toString());
        params = params.append("idPacijent",idPacijent.toString());
        return this.http.get<any>(baseUrl + 'nalazi/lista-nalaza/dohvatiNalazePoDatumu.php', {params: params}).pipe(catchError(handleError));
    }

    //Metoda koja dohvaća sve nalaze te ih stavlja u listu
    dohvatiSveNalaze(idPacijent: number){
        let params = new HttpParams().append("idPacijent",idPacijent.toString());
        return this.http.get<any>(baseUrl + 'nalazi/lista-nalaza/dohvatiSveNalaze.php',{params: params}).pipe(catchError(handleError));
    }
}