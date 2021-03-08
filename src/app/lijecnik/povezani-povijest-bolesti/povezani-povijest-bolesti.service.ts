import { Time } from "@angular/common";
import { HttpClient,HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { catchError } from "rxjs/operators";
import {handleError} from '../../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class PovezaniPovijestBolestiService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";
    //Kreiram Subject koji će obavjestiti komponentu "PovezaniPovijestBolestiComponent" je li se u nju ušlo preko obrade ili preko recepta
    isObrada = new BehaviorSubject<boolean>(false);
    isObradaObs = this.isObrada.asObservable();
    
    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalaze podatci za povezanu povijest bolesti
    getPovijestBolestiPovezanSlucaj(event: {datum: Date,razlogDolaska: string,mkbSifraPrimarna: string, vrijeme: Time,tipSlucaj: string},id: number){
        event.razlogDolaska = encodeURIComponent(event.razlogDolaska);
        //Kreiram paramse
        let params = new HttpParams().append("datum",event.datum.toString());
        params = params.append("razlogDolaska",event.razlogDolaska);
        params = params.append("mkbSifraPrimarna",event.mkbSifraPrimarna);
        params = params.append("vrijeme",event.vrijeme.toString());
        params = params.append("tipSlucaj",event.tipSlucaj);
        params = params.append("id",id.toString());

        return this.http.get<any>(this.baseUrl + 'otvorenaPovijestBolesti/getPovijestBolestiPovezanSlucaj.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable sa svim podatcima povijesti bolesti za trenutno aktivnog pacijenta (BEZ SEKUNDARNIH DIJAGNOZA)
    getPovijestBolesti(id: number){

        let params = new HttpParams().append("id",id.toString());
        return this.http.get<any>(this.baseUrl + 'otvorenaPovijestBolesti/getPovijestBolesti.php',{params:params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable sa svim ŠIFRAMA I NAZIVIMA SEKUNDARNIH DIJAGNOZA za određenu povijest bolesti
    getSekundarneDijagnoze(datum: string, razlogDolaska: string, mkbSifraPrimarna: string, 
                        tipSlucaj: string, vrijeme: string, idPacijent: number){
        razlogDolaska = encodeURIComponent(razlogDolaska);
        let params = new HttpParams().append("datum",datum);
        params = params.append("razlogDolaska",razlogDolaska);
        params = params.append("mkbSifraPrimarna",mkbSifraPrimarna);
        params = params.append("tipSlucaj",tipSlucaj);
        params = params.append("vrijeme",vrijeme);
        params = params.append("idPacijent",idPacijent.toString());
        return this.http.get<any>(this.baseUrl + 'otvorenaPovijestBolesti/getSekundarneDijagnoze.php',{params: params}).pipe(catchError(handleError))
    }

    //Metoda koja vraća Observable sa svim povijestima bolesti u kojima se nalazi vrijednost PRETRAGE korisnika
    getPovijestBolestiPretraga(id: number, pretraga: string){
        //Kodiram parametar pretrage
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("id",id.toString());
        params = params.append("pretraga",pretraga);
        return this.http.get<any>(this.baseUrl + 'otvorenaPovijestBolesti/getPovijestBolestiPretraga.php',{params: params}).pipe(catchError(handleError));
    } 
}