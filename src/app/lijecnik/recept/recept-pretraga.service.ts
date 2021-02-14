import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";

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
        }).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze rezultati za pretragu OSNOVNE LISTE MAGISTRALNIH PRIPRAVAKA
    getMagPripravciOsnovnaListaPretraga(pretraga: string){
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("pretraga",pretraga);
        return this.http.get<any>(this.baseUrl + 'recept/pretraga/getMagPripravakOsnovnaListaPretraga.php',{
            params: params
        }).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze rezultati za pretragu OSNOVNE LISTE LIJEKOVA
    getLijekDopunskaListaPretraga(pretraga: string){
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("pretraga",pretraga);
        return this.http.get<any>(this.baseUrl + 'recept/pretraga/getLijekDopunskaListaPretraga.php',
        {
            params: params
        }).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze rezultati za pretragu OSNOVNE LISTE LIJEKOVA
    getLijekOsnovnaListaPretraga(pretraga: string){
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("pretraga",pretraga);
        return this.http.get<any>(this.baseUrl + 'recept/pretraga/getLijekOsnovnaListaPretraga.php',
        {
            params: params
        }).pipe(catchError(this.handleError));
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