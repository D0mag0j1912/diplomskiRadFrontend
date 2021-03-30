import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { catchError } from "rxjs/operators";
import {baseUrl} from '../../../../backend-path';
import {handleError} from '../../../../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class NalaziDetailService {

    //Kreiram Subject koji ću emitirati da liječnik želi izaći iz prozora detalja nalaza
    close = new Subject<boolean>();
    closeObs = this.close.asObservable();
    
    constructor(
        private http: HttpClient
    ){}

    //Metoda koja dohvaća sve sekundarne dijagnoze za prikaz u detaljima nalaza
    getSekundarneDijagnoze(idNalaz: number){
        let params = new HttpParams().append("idNalaz",idNalaz.toString());
        return this.http.get<any>(baseUrl + 'nalazi/nalazi-detail/getSekundarneDijagnoze.php', {params: params}).pipe(catchError(handleError));
    }

    //Metoda koja dohvaća sve podatke koji su vezani za nalaz koji je kliknut u listi
    getNalaz(idNalaz: number){
        let params = new HttpParams().append("idNalaz",idNalaz.toString());
        return this.http.get<any>(baseUrl + 'nalazi/nalazi-detail/getNalaz.php', {params: params}).pipe(catchError(handleError));
    }
}