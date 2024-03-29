import { Time } from "@angular/common";
import { HttpClient,HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import {handleError} from '../../shared/rxjs-error';
import {baseUrl} from '../../backend-path';

@Injectable({
    providedIn: 'root'
})
export class PovezaniPovijestBolestiService{

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalaze podatci za povezanu povijest bolesti
    getPovijestBolestiPovezanSlucaj(
        event: {
            datum: Date,
            razlogDolaska: string,
            primarnaDijagnoza: string,
            anamneza: string,
            vrijeme: Time,
            tipSlucaj: string
        },id: number){
        event.razlogDolaska = encodeURIComponent(event.razlogDolaska);
        event.anamneza = encodeURIComponent(event.anamneza);
        //Kreiram paramse
        let params = new HttpParams().append("datum",event.datum.toString());
        params = params.append("razlogDolaska",event.razlogDolaska);
        params = params.append("anamneza",event.anamneza);
        params = params.append("primarnaDijagnoza",event.primarnaDijagnoza);
        params = params.append("vrijeme",event.vrijeme.toString());
        params = params.append("tipSlucaj",event.tipSlucaj);
        params = params.append("id",id.toString());

        return this.http.get<any>(baseUrl + 'otvorenaPovijestBolesti/getPovijestBolestiPovezanSlucaj.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable sa svim podatcima povijesti bolesti za trenutno aktivnog pacijenta (BEZ SEKUNDARNIH DIJAGNOZA)
    getPovijestBolesti(id: number){

        let params = new HttpParams().append("id",id.toString());
        return this.http.get<any>(baseUrl + 'otvorenaPovijestBolesti/getPovijestBolesti.php',{params:params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable sa svim ŠIFRAMA I NAZIVIMA SEKUNDARNIH DIJAGNOZA za određenu povijest bolesti
    getSekundarneDijagnoze(
        datum: Date,
        vrijeme: Time,
        tipSlucaj: string,
        primarnaDijagnoza: string,
        idPacijent: number
    ){
        let params = new HttpParams().append("datum",datum.toString());
        params = params.append("vrijeme",vrijeme.toString());
        params = params.append("tipSlucaj",tipSlucaj);
        params = params.append("primarnaDijagnoza",primarnaDijagnoza);
        params = params.append("idPacijent",idPacijent.toString());
        return this.http.get<any>(baseUrl + 'otvorenaPovijestBolesti/getSekundarneDijagnoze.php',{params: params}).pipe(catchError(handleError))
    }

    //Metoda koja vraća Observable sa svim povijestima bolesti u kojima se nalazi vrijednost PRETRAGE korisnika
    getPovijestBolestiPretraga(id: number, pretraga: string){
        //Kodiram parametar pretrage
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("id",id.toString());
        params = params.append("pretraga",pretraga);
        return this.http.get<any>(baseUrl + 'otvorenaPovijestBolesti/getPovijestBolestiPretraga.php',{params: params}).pipe(catchError(handleError));
    }
}
