import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BracnoStanje } from '../shared/modeli/bracnoStanje.model';
import { Dijagnoza } from '../shared/modeli/dijagnoza.model';
import { DrzavaOsiguranja } from '../shared/modeli/drzavaOsiguranja.model';
import { KategorijaOsiguranja } from '../shared/modeli/kategorijaOsiguranja.model';
import { Mjesto } from '../shared/modeli/mjesto.model';
import { Participacija } from '../shared/modeli/participacija.model';
import { PodrucniUred } from '../shared/modeli/podrucniUred.model';
import { RadniStatus } from '../shared/modeli/radniStatus.model';
import { StatusPacijent } from '../shared/modeli/statusPacijent.model';

@Injectable({
    providedIn: 'root'
})
export class ImportService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih područnih ureda
    getPodrucniUred(){

        //Dohvaća i vraća Observable sa svim područnim uredima
        return this.http.get<PodrucniUred[]>(this.baseUrl + 'zdravstveniPodatciPacijent/getPodrucniUred.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih kategorija osiguranja
    getKategorijaOsiguranja(){

        //Dohvaća i vraća Observable sa svim kategorijama osiguranja
        return this.http.get<KategorijaOsiguranja[]>(this.baseUrl + 'zdravstveniPodatciPacijent/getKategorijaOsiguranja.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih dijagnoza
    getDijagnoze(){
      
        //Dohvaća i vraća Observable sa svim dijagnozama
        return this.http.get<Dijagnoza[]>(this.baseUrl + 'getAllDiagnosis.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih država osiguranja
    getDrzavaOsiguranja(){
      
        //Dohvaća i vraća Observable sa svim dijagnozama
        return this.http.get<DrzavaOsiguranja[]>(this.baseUrl + 'zdravstveniPodatciPacijent/getDrzavaOsiguranja.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih mjesta
    getMjesto(){

        return this.http.get<Mjesto[]>(this.baseUrl + 'osnovniPodatciPacijent/getMjesto.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih bračnih stanja
    getBracnoStanje(){

        return this.http.get<BracnoStanje[]>(this.baseUrl + 'osnovniPodatciPacijent/getBracnoStanje.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih radnih statusa
    getRadniStatus(){

        return this.http.get<RadniStatus[]>(this.baseUrl + 'osnovniPodatciPacijent/getRadniStatus.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih statusa pacijenata
    getStatusPacijent(){

        return this.http.get<StatusPacijent[]>(this.baseUrl + 'osnovniPodatciPacijent/getStatusPacijent.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih participacija 
    getParticipacija(){

        return this.http.get<Participacija[]>(this.baseUrl + 'zdravstveniPodatciPacijent/getParticipacija.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda za errore
    private handleError(error: HttpErrorResponse){
        if(error.error instanceof ErrorEvent){
            console.error("An error occured: "+error.error.message);
        }
        else{
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
            `Backend returned code ${error.status}, ` +
            `body was: ${error.error}`);
        }
        // Return an observable with a user-facing error message.
        return throwError(
            'Something bad happened; please try again later.');
    }
}