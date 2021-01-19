import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";

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

    //Metoda koja vraća Observable sa svim lijekovima sa osnovne liste
    getLijekoviOsnovnaLista(){
        return this.http.get<any>(this.baseUrl + 'recept/importi/getLijekoviOsnovnaLista.php').pipe(catchError(this.handleError));
    }
    //Metoda koja vraća Observable sa svim lijekovima sa dopunske liste
    getLijekoviDopunskaLista(){
        return this.http.get<any>(this.baseUrl + 'recept/importi/getLijekoviDopunskaLista.php').pipe(catchError(this.handleError));
    }
    //Metoda koja vraća Observable sa svim lijekovima sa osnovne liste
    getMagistralniPripravciOsnovnaLista(){
        return this.http.get<any>(this.baseUrl + 'recept/importi/getMagistralniPripravciOsnovnaLista.php').pipe(catchError(this.handleError));
    }
    //Metoda koja vraća Observable sa svim lijekovima sa osnovne liste
    getMagistralniPripravciDopunskaLista(){
        return this.http.get<any>(this.baseUrl + 'recept/importi/getMagistralniPripravciDopunskaLista.php').pipe(catchError(this.handleError));
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