import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ListaReceptiService{
    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";
    //Definiram BehaviourSubject pomoću kojega ću prenijeti ID pacijenta s lijeve tablice u desnu tablicu
    prijenosnik = new Subject<number>();
    //Kreiram Observable od njega
    prijenosnikObs = this.prijenosnik.asObservable();

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalaze svi recepti koji odgovaraju pacijentima čiji ID mi je poslan Subjectom
    getReceptiTablica(ids: number[]){
        let params = new HttpParams().append("ids",JSON.stringify(ids));
        return this.http.get<any>(this.baseUrl + 'recept/listaRecepti/getReceptiTablica.php',{params: params}) 
            .pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze svi recepti koji odgovaraju PRETRAZI
    getReceptiPretraga(pretraga: string){
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("pretraga",pretraga);
        return this.http.get<any>(this.baseUrl + 'recept/listaRecepti/getReceptiPretraga.php',{params: params}) 
            .pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze svi recepti za INICIJALNO POSTAVLJENE PACIJENTE u LISTI RECEPATA
    getInicijalniRecepti(){

        return this.http.get<any>(this.baseUrl + 'recept/listaRecepti/getInicijalniRecepti.php')
        .pipe(
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