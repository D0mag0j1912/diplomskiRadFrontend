import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
import { Posjet } from 'src/app/shared/modeli/posjet.model';

@Injectable({
    providedIn: 'root'
})
export class PosjeteService{

     //Kreiram varijablu koja pohranjuje baseUrl
     baseUrl: string = "http://localhost:8080/angularPHP/";

     constructor(
         //Dohvaćam http 
         private http: HttpClient
     ){}

     //Metoda koja dohvaća sve dijagnoze iz baze i vraća ih umotane u Observable
     getAllDiagnosis(){

        //Vraćam Observable u kojemu se nalaze sve dijagnoze
        return this.http.get<Dijagnoza[]>(this.baseUrl + 'getAllDiagnosis.php').pipe(
            catchError(this.handleError)
        ); 
     }


     //Metoda koja šalje zahtjev serveru za dodavanje podataka posjeta i vraća odgovor servera
     addVisit(posjet: Posjet){

        return this.http.post<Posjet>(this.baseUrl + 'posjet.php',
        {
            datumPosjet: posjet.datumPosjet,
            dijagnoza: posjet.dijagnoza,
            razlog: posjet.razlog,
            anamneza: posjet.anamneza,
            status: posjet.status,
            preporuka: posjet.preporuka
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