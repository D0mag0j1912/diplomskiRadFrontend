import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import { ZdravstveniRadnik } from "src/app/shared/modeli/zdravstveniRadnik.model";
import {handleError} from '../../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class ReceptImportiService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja šalje zahtjev serveru te od njega traži dohvati svih tipova zdravstvenih radnika
    getZdravstveniRadnici(){
        //Vraća Observable sa svim zdravstvenim radnicima
        return this.http.get<ZdravstveniRadnik[]>(this.baseUrl + 'recept/importi/getZdravstveniRadnici.php').pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable sa svim lijekovima sa osnovne liste
    getLijekoviOsnovnaLista(){
        return this.http.get<any>(this.baseUrl + 'recept/importi/getLijekoviOsnovnaLista.php').pipe(catchError(handleError));
    }
    //Metoda koja vraća Observable sa svim lijekovima sa dopunske liste
    getLijekoviDopunskaLista(){
        return this.http.get<any>(this.baseUrl + 'recept/importi/getLijekoviDopunskaLista.php').pipe(catchError(handleError));
    }
    //Metoda koja vraća Observable sa svim lijekovima sa osnovne liste
    getMagistralniPripravciOsnovnaLista(){
        return this.http.get<any>(this.baseUrl + 'recept/importi/getMagistralniPripravciOsnovnaLista.php').pipe(catchError(handleError));
    }
    //Metoda koja vraća Observable sa svim lijekovima sa osnovne liste
    getMagistralniPripravciDopunskaLista(){
        return this.http.get<any>(this.baseUrl + 'recept/importi/getMagistralniPripravciDopunskaLista.php').pipe(catchError(handleError));
    }

}