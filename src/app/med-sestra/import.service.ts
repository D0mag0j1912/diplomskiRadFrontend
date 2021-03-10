import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import {handleError} from '../shared/rxjs-error';
import {baseUrl} from '../backend-path';

@Injectable({
    providedIn: 'root'
})
export class ImportService{

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih područnih ureda
    getPodrucniUred(){

        //Dohvaća i vraća Observable sa svim područnim uredima
        return this.http.get<any>(baseUrl + 'zdravstveniPodatciPacijent/getPodrucniUred.php').pipe(
            catchError(handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih kategorija osiguranja
    getKategorijaOsiguranja(){

        //Dohvaća i vraća Observable sa svim kategorijama osiguranja
        return this.http.get<any>(baseUrl + 'zdravstveniPodatciPacijent/getKategorijaOsiguranja.php').pipe(
            catchError(handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih dijagnoza
    getDijagnoze(){
      
        //Dohvaća i vraća Observable sa svim dijagnozama
        return this.http.get<any>(baseUrl + 'getAllDiagnosis.php').pipe(
            catchError(handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih država osiguranja
    getDrzavaOsiguranja(){
      
        //Dohvaća i vraća Observable sa svim dijagnozama
        return this.http.get<any>(baseUrl + 'zdravstveniPodatciPacijent/getDrzavaOsiguranja.php').pipe(
            catchError(handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih mjesta
    getMjesto(){

        return this.http.get<any>(baseUrl + 'osnovniPodatciPacijent/getMjesto.php').pipe(
            catchError(handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih bračnih stanja
    getBracnoStanje(){

        return this.http.get<any>(baseUrl + 'osnovniPodatciPacijent/getBracnoStanje.php').pipe(
            catchError(handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih radnih statusa
    getRadniStatus(){

        return this.http.get<any>(baseUrl + 'osnovniPodatciPacijent/getRadniStatus.php').pipe(
            catchError(handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih statusa pacijenata
    getStatusPacijent(){

        return this.http.get<any>(baseUrl + 'osnovniPodatciPacijent/getStatusPacijent.php').pipe(
            catchError(handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvat svih participacija 
    getParticipacija(){

        return this.http.get<any>(baseUrl + 'zdravstveniPodatciPacijent/getParticipacija.php').pipe(
            catchError(handleError)
        );
    }

}