import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import {baseUrl} from '../../backend-path';
import {handleError} from '../../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class UputnicaService {

    constructor(private http: HttpClient){}

    //Metoda koja dohvaća sve uputnice za sve pacijente koji odgovoraju unesenoj pretrazi
    getUputnicePretraga(pretraga: string){
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("pretraga",pretraga);
        return this.http.get<any>(baseUrl + 'uputnica/getUputnicePretraga.php',
        {
            params: params
        }).pipe(catchError(handleError));
    }

    //Metoda za dohvaćanje uputnica
    getUputnice(){
        return this.http.get<any>(baseUrl + 'uputnica/getUputnice.php').pipe(catchError(handleError));
    }
}
