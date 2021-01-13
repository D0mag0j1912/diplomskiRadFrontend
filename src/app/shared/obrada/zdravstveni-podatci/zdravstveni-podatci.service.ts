import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ZdravstveniPodatci } from 'src/app/shared/modeli/zdravstveniPodatci.model';

@Injectable({
    providedIn: 'root'
})
export class ZdravstveniPodatciService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalaze svi ZDRAVSTVENI podatci pacijenta koji je aktivan u obradi
    getHealthDataPatient(tip: string){
        let params = new HttpParams().append("tip",tip);
        return this.http.get<ZdravstveniPodatci | any>(this.baseUrl + 'zdravstveniPodatciPacijent/getHealthDataPatient.php',{params: params}).pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja vraća odgovor servera na ažuriranje zdravstvenih podataka
    potvrdiZdravstvenePodatke(idPacijent: number, mbo: string, nositeljOsiguranja: string, drzavaOsiguranja: string, kategorijaOsiguranja: string,
                            trajnoOsnovno: string, osnovnoOsiguranjeOd: Date, osnovnoOsiguranjeDo: Date, brIskDopunsko: string,
                            dopunskoOsiguranjeOd: Date, dopunskoOsiguranjeDo: Date, oslobodenParticipacije: string, 
                            clanakParticipacija: string, trajnoParticipacija: string, participacijaDo: Date, sifUred: number){
        return this.http.put(this.baseUrl + 'zdravstveniPodatciPacijent/potvrdiZdravstvenePodatke.php',{
            idPacijent: idPacijent,
            mbo:mbo,
            nositeljOsiguranja: nositeljOsiguranja,
            drzavaOsiguranja: drzavaOsiguranja,
            kategorijaOsiguranja: kategorijaOsiguranja,
            trajnoOsnovno: trajnoOsnovno,
            osnovnoOsiguranjeOd: osnovnoOsiguranjeOd,
            osnovnoOsiguranjeDo: osnovnoOsiguranjeDo,
            brIskDopunsko: brIskDopunsko,
            dopunskoOsiguranjeOd: dopunskoOsiguranjeOd,
            dopunskoOsiguranjeDo: dopunskoOsiguranjeDo,
            oslobodenParticipacije: oslobodenParticipacije,
            clanakParticipacija: clanakParticipacija,
            trajnoParticipacija: trajnoParticipacija,
            participacijaDo: participacijaDo,
            sifUred: sifUred
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
