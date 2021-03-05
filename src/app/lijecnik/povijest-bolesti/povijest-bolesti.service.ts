import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class PovijestBolestiService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na potvrdu povijesti bolesti
    potvrdiPovijestBolesti(idLijecnik:number,idPacijent: number,razlogDolaska: string, anamneza: string,
                        status: string, nalaz: string, mkbPrimarnaDijagnoza: string, mkbSifre: string[],
                        tipSlucaj: string, terapija: string, preporukaLijecnik: string, napomena: string, 
                        idObrada: number,poslanaPrimarna: string,poslaniIDObrada: string){
        return this.http.post<any>(this.baseUrl + 'lijecnik/povijestBolesti.php',{
            idLijecnik,
            idPacijent,
            razlogDolaska,
            anamneza,
            status,
            nalaz,
            mkbPrimarnaDijagnoza,
            mkbSifre,
            tipSlucaj,
            terapija,
            preporukaLijecnik,
            napomena,
            idObrada,
            poslanaPrimarna,
            poslaniIDObrada
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