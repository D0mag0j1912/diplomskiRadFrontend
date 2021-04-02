import { HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import {handleError} from './rxjs-error';
import {baseUrl} from '../backend-path';

@Injectable({
    providedIn: 'root'
})
export class ImportService{

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Dohvaćam MBO pacijent na osnovu njegovog ID-a
    getMBOPacijent(idPacijent: number){
        let params = new HttpParams().append("idPacijent",idPacijent.toString());
        return this.http.get<string>(baseUrl + 'uputnica/izdajUputnica/getMBOPacijent.php',{params: params}).pipe(catchError(handleError));
    }

    //Dohvaćam ID pacijenta na osnovu njegovog MBO-a
    getIDPacijent(mboPacijent: string){
        let params = new HttpParams().append("mboPacijent",mboPacijent);
        return this.http.get<string>(baseUrl + 'uputnica/izdajUputnica/getIDPacijent.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze sve zdravstvene djelatnosti
    getZdravstveneDjelatnosti(){
        return this.http.get<any>(baseUrl + 'uputnica/importi/getZdravstveneDjelatnosti.php').pipe(catchError(handleError));
    }
    //Metoda koja vraća Observable u kojemu se nalaze svi pacijenti (IME I PREZIME)
    getPacijenti(){
        return this.http.get<any>(baseUrl + 'narucivanje/getPacijenti.php').pipe(catchError(handleError));
    }

    //Metoda koja dohvaća sve zdravstvene ustanove
    getZdravstveneUstanove(){
        return this.http.get<any>(baseUrl + 'uputnica/importi/getZdravstveneUstanove.php').pipe(catchError(handleError));
    }

    //Metoda koja šalje zahtjev serveru te od njega traži dohvati svih tipova zdravstvenih radnika
    getZdravstveniRadnici(){
        //Vraća Observable sa svim zdravstvenim radnicima
        return this.http.get<any>(baseUrl + 'recept/importi/getZdravstveniRadnici.php').pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable sa svim lijekovima sa osnovne liste
    getLijekoviOsnovnaLista(){
        return this.http.get<any>(baseUrl + 'recept/importi/getLijekoviOsnovnaLista.php').pipe(catchError(handleError));
    }
    //Metoda koja vraća Observable sa svim lijekovima sa dopunske liste
    getLijekoviDopunskaLista(){
        return this.http.get<any>(baseUrl + 'recept/importi/getLijekoviDopunskaLista.php').pipe(catchError(handleError));
    }
    //Metoda koja vraća Observable sa svim lijekovima sa osnovne liste
    getMagistralniPripravciOsnovnaLista(){
        return this.http.get<any>(baseUrl + 'recept/importi/getMagistralniPripravciOsnovnaLista.php').pipe(catchError(handleError));
    }
    //Metoda koja vraća Observable sa svim lijekovima sa osnovne liste
    getMagistralniPripravciDopunskaLista(){
        return this.http.get<any>(baseUrl + 'recept/importi/getMagistralniPripravciDopunskaLista.php').pipe(catchError(handleError));
    }

    //Metoda koja dohvaća sve specijalizacije
    getSpecijalizacije(){
        return this.http.get<any>(baseUrl + 'recept/importi/getZdravstveniRadnici.php').pipe(catchError(handleError));
    }

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

    //Metoda koja šalje zahtjev serveru te u njemu traži dohvat svih evidentiraih dijagnoza
    getDijagnoze(){
        //Vraća Observable u kojemu se nalaze sve evidentirane dijagnoze
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