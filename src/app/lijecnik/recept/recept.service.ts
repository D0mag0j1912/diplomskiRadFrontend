import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ReceptService{
    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable sa svim pacijentima za prikaz u tablici
    getAllPatients(){

        return this.http.get<any>(this.baseUrl + 'recept/getAllPatients.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja vraća Observable u kojemu se nalaze svi pacijenti koji odgovaraju pretrazi
    getPacijentiPretraga(value: string){
        let params = new HttpParams().append("pretraga",value);
        return this.http.get<any>(this.baseUrl + 'recept/getPacijentiPretraga.php',{params: params}).pipe(catchError(this.handleError));
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