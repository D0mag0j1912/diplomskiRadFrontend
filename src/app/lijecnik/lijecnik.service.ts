import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Korisnik } from '../shared/modeli/korisnik.model';

@Injectable({
    providedIn: 'root'
})
export class LijecnikService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja šalje zahtjev serveru za dohvaćanjem osobnih podataka liječnika
    getPersonalData(){
        //Kreiram i vraćam Observable u kojem ću dohvatiti osobne podatke liječnika iz baze
        return this.http.get<Korisnik>(this.baseUrl + 'lijecnik/lijecnik.php').pipe(
            catchError(this.handleError)
            );
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor backenda na ažuriranje osobnih podataka liječnika
    editPersonalData(id: number, email: string, ime: string, prezime: string, adresa: string, specijalizacija: string){

        return this.http.put<any>(this.baseUrl + 'lijecnik/azurirajOsobnePodatke.php',
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

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor backenda za ažuriranje lozinke liječnika
    editPassword(id: number,trenutna: string, nova: string, potvrdaNova: string){

        return this.http.put(this.baseUrl + 'lijecnik/azurirajLozinka.php',
        {
            id: id,
            trenutna: trenutna,
            nova: nova,
            potvrdaNova: potvrdaNova
        })
        .pipe(catchError(this.handleError));
    }

    //Metoda koja šalje zahtjev serveru za brisanje pacijenta i vraća Observable koji sadrži odgovor servera
    deletePatient(id: number){
        //Uz DELETE metodu šaljem dodatni parametar ID pacijenta
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: {
                id: id
            }
        };
        //Kreiram i vraćam Observable za brisanje pacijenta 
        return this.http.delete(this.baseUrl + 'pacijent.php', options).pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru u kojem traži trenutni broj pacijenata u sustavu
    checkCountPatient(){

        //Kreiram i vraćam Observable u kojem će se nalaziti trenutni broj pacijenata
        return this.http.get<number>(this.baseUrl + 'lijecnik/getCountPatient.php').pipe(catchError(this.handleError));
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