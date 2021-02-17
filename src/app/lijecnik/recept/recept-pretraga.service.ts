import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import {handleError} from '../../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class ReceptPretragaService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalaze rezultati za pretragu DOPUNSKE LISTE MAGISTRALNIH PRIPRAVAKA
    getMagPripravciDopunskaListaPretraga(pretraga: string){
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("pretraga",pretraga);
        return this.http.get<any>(this.baseUrl + 'recept/pretraga/getMagPripravakDopunskaListaPretraga.php',{
            params: params
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze rezultati za pretragu OSNOVNE LISTE MAGISTRALNIH PRIPRAVAKA
    getMagPripravciOsnovnaListaPretraga(pretraga: string){
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("pretraga",pretraga);
        return this.http.get<any>(this.baseUrl + 'recept/pretraga/getMagPripravakOsnovnaListaPretraga.php',{
            params: params
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze rezultati za pretragu OSNOVNE LISTE LIJEKOVA
    getLijekDopunskaListaPretraga(pretraga: string){
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("pretraga",pretraga);
        return this.http.get<any>(this.baseUrl + 'recept/pretraga/getLijekDopunskaListaPretraga.php',
        {
            params: params
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze rezultati za pretragu OSNOVNE LISTE LIJEKOVA
    getLijekOsnovnaListaPretraga(pretraga: string){
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("pretraga",pretraga);
        return this.http.get<any>(this.baseUrl + 'recept/pretraga/getLijekOsnovnaListaPretraga.php',
        {
            params: params
        }).pipe(catchError(handleError));
    }

}