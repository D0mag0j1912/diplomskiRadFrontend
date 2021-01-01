import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';

@Injectable({
    providedIn: 'root'
})
export class PacijentService{
    
    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http 
        private http: HttpClient
    ){}


    //Metoda koja šalje zahtjev serveru za osobnim podatcima pacijenta i vraća Observable u kojemu se nalaze podatci
    getPatientData(id: number){
        //Uz GET metodu šaljem dodatni parametar ID pacijenta
        const params = new HttpParams().append("id",id.toString());
        //Kreiram i vraćam Observable u kojem ću dohvatiti podatke za pacijenta iz baze
        return this.http.get<Pacijent>(this.baseUrl + 'getPatientData.php',{params: params}).pipe(
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