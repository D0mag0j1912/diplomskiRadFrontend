import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';

@Injectable({
    providedIn: 'root'
})
export class OsnovniPodatciService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}


    //Metoda koja vraća Observable u kojemu se nalaze svi OSNOVNI podatci pacijenta koji je aktivan u obradi
    getMainDataPatient(tip: string){
        let params = new HttpParams().append("tip",tip);
        return this.http.get<Pacijent | any>(this.baseUrl + 'osnovniPodatciPacijent/getMainDataPatient.php',{params: params}).pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja ažurira vrijednost osnovnih podataka pacijenta (Potvrdi podatke pacijenta)
    potvrdiOsnovnePodatke(idPacijent: number, ime: string, prezime: string, datRod: Date, adresa: string, oib: string,
                        email: string, spol: string, pbr: string, mobitel: string,
                        bracnoStanje: string, radniStatus: string, status: string){
        //Vraćam Observable u kojemu se nalazi odgovor servera na ažuriranje osnovnih podataka pacijenta
        return this.http.put(this.baseUrl + 'osnovniPodatciPacijent/potvrdiOsnovnePodatke.php',{
            idPacijent: idPacijent,
            ime: ime,
            prezime: prezime,
            datRod: datRod,
            adresa: adresa,
            oib: oib,
            email: email,
            spol: spol,
            pbr: pbr,
            mobitel: mobitel,
            bracnoStanje: bracnoStanje,
            radniStatus: radniStatus,
            status: status
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