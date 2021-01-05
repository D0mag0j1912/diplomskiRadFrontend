import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Korisnik } from '../shared/modeli/korisnik.model';

@Injectable({
    providedIn: 'root'
})
export class MedSestraService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalaze osobni podatci medicinske sestre
    getPersonalData(){
        return this.http.get<Korisnik>(this.baseUrl + 'med-sestra/medSestra.php').pipe(
            catchError(this.handleError)
        );    
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor backenda na ažuriranje osobnih podataka medicinske sestre
    editPersonalData(id: number, email: string, ime: string, prezime: string, adresa: string, specijalizacija: string){

        return this.http.put<any>(this.baseUrl + 'med-sestra/medSestra.php',
        {
            id: id,
            email: email,
            ime: ime,
            prezime: prezime,
            adresa: adresa,
            specijalizacija: specijalizacija
        })
        .pipe(catchError(this.handleError));
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor backenda za ažuriranje lozinke medicinske sestre
    editPassword(id: number,trenutna: string, nova: string, potvrdaNova: string){

        return this.http.put(this.baseUrl + 'med-sestra/medSestra.php',
        {
            id: id,
            trenutna: trenutna,
            nova: nova,
            potvrdaNova: potvrdaNova
        });
    }

    //Metoda koja šalje serveru sve podatke koji se tiču općih podataka pregleda 
    sendVisitData(idMedSestra: number, idPacijent: number, nacinPlacanja: string, podrucniUredHZZO: string, podrucniUredOzljeda: string, nazivPoduzeca: string,
                oznakaOsiguranika: string, nazivDrzave: string, mbo: string, brIskDopunsko: string,
                primarnaDijagnoza: string, sekundarnaDijagnoza: string[], tipSlucaj: string){

        //Vraćam Observable u kojemu se nalazi odgovor servera na slanje općih podataka pregleda
        return this.http.post<any>(this.baseUrl + 'med-sestra/opciPodatciPregleda.php', 
        {
            idMedSestra: idMedSestra,
            idPacijent: idPacijent,
            nacinPlacanja: nacinPlacanja,
            oznakaOsiguranika: oznakaOsiguranika,
            nazivDrzave: nazivDrzave,
            mbo: mbo,
            tipSlucaj: tipSlucaj,
            primarnaDijagnoza: primarnaDijagnoza,
            sekundarnaDijagnoza: sekundarnaDijagnoza,
            brIskDopunsko: brIskDopunsko,
            podrucniUredHZZO: podrucniUredHZZO,
            podrucniUredOzljeda: podrucniUredOzljeda,
            nazivPoduzeca: nazivPoduzeca
        }).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze zdravstveni podatci trenutno aktivnog pacijenta
    getHealthData(){

        return this.http.get<any>(this.baseUrl + 'med-sestra/getZdravstveniPodatci.php').pipe(catchError(this.handleError));
    }
    
    /* //Metoda koja šalje serveru zahtjev za dohvaćanjem MBO-a trenutno aktivnog pacijenta
    getPatientMBO(id: number){

        const params = new HttpParams().append("id",id.toString());
        //Vraćam Observable u kojemu se nalazi odgovor servera za zahtjev frontenda
        return this.http.get<Pacijent>(this.baseUrl + 'getPatientData.php',{params: params}).pipe(
            catchError(this.handleError)
        );
    } */

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