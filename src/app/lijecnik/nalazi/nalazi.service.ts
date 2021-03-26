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

    //Metoda koja dohvaća sve nalaze te ih stavlja u listu
    dohvatiSveNalaze(idPacijent: number){
        let params = new HttpParams().append("idPacijent",idPacijent.toString());
        return this.http.get<any>(baseUrl + 'nalazi/lista-nalaza/dohvatiSveNalaze.php',{params: params}).pipe(catchError(handleError));
    }
}