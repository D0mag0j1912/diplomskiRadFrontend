import { HttpClient,HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { catchError } from 'rxjs/operators';
import {Time} from '@angular/common';
import {handleError} from '../rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class ObradaService{

    //Kreiram BehaviourSubject u kojega spremam ime i prezime pacijenta
    imePrezimePacijent = new BehaviorSubject<{ime: string, prezime: string,stranica: number}>({ime:'unknown',prezime:'unknown',stranica:1});
    zavrsenPregled = new BehaviorSubject<string>(null);
    obsZavrsenPregled = this.zavrsenPregled.asObservable();
    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalaze traženi pacijenti 
    getPatients(ime: string, prezime: string, trenutnaStranica: number){

        return this.http.post<any>(this.baseUrl + 'obrada/getObradaPatients.php',
        {
            ime: ime,
            prezime: prezime,
            trenutnaStranica: trenutnaStranica
        }).pipe(catchError(handleError));
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalaze dodatni podatci pacijenata
    getData(ime: string, prezime: string){

        return this.http.post(this.baseUrl + 'obrada/getObradaPatientsDodatno.php',
        {
            ime: ime,
            prezime: prezime  
        }).pipe(catchError(handleError));
    }

    //Metoda koja šalje zahtjev serveru za dodavanje pacijenta u obradu te vraća Observable u kojemu se nalazi odgovor servera
    addPatientToProcessing(tip: string,id: number){

        return this.http.post<any>(this.baseUrl + 'obrada/obrada.php',
        {
            id:id,
            tip:tip
        }).pipe(catchError(handleError));
    }

    //Metoda koja šalje zahtjev serveru za dohvaćanje pacijenta koji je trenutno u obradi aktivan
    getPatientProcessing(tip:string){
        let params = new HttpParams().append("tip",tip);
        return this.http.get<any>(this.baseUrl + 'obrada/obrada.php',{params: params}).pipe(
            catchError(handleError)
        );
    }


    //Metoda koja šalje zahtjev serveru za ažuriranje statusa pacijenta 
    editPatientStatus(idObrada: number,tip: string,id: number){

        return this.http.put<any>(this.baseUrl + 'obrada/obrada.php',
        {
            id:id,
            tip:tip,
            idObrada: idObrada
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi sljedeći pacijent koji čeka na pregled
    getSljedeciPacijent(tip: string){
        let params = new HttpParams().append("tip",tip);
        return this.http.get<any>(this.baseUrl + 'obrada/sljedeciPacijent.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi vrijeme narudžbe za aktivnog pacijenta da prikažem u formi obrade
    getVrijemeNarudzbe(tip: string){
        let params = new HttpParams().append("tip",tip);
        return this.http.get<Time>(this.baseUrl + 'obrada/getVrijemeNarudzba.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi informacija je li trenutno aktivni pacijent obrađen (opći podatci)
    getObradenOpciPodatci(id:number){
        if(id === null){
            return;
        }
        let params = new HttpParams().append("idPacijent",id.toString());
        return this.http.get<any>(this.baseUrl + 'obrada/getObradenOpciPodatci.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi informacija je li trenutno aktivni pacijent obrađen (povijest bolesti)
    getObradenPovijestBolesti(id:number){
        if(id === null){
            return;
        }
        let params = new HttpParams().append("idPacijent",id.toString());
        return this.http.get<any>(this.baseUrl + 'obrada/getObradenPovijestBolesti.php',{params: params}).pipe(catchError(handleError));
    }

}