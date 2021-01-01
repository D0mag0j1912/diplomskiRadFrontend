import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {Injectable} from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Korisnik } from '../shared/modeli/korisnik.model';
import {Pacijent} from '../shared/modeli/pacijent.model';

@Injectable({
    providedIn: 'root'
})
export class LijecnikService{

    //Kreiram BehaviorSubject u koji spremam odgovor servera kad se dohvaćaju pacijenti preko pretrage
    pacijenti = new BehaviorSubject<Pacijent[]>(null);
    //Pravim Observable od Subjecta
    obsPacijenti = this.pacijenti.asObservable();
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

        return this.http.put<any>(this.baseUrl + 'lijecnik/lijecnik.php',
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

        return this.http.put(this.baseUrl + 'lijecnik/lijecnik.php',
        {
            id: id,
            trenutna: trenutna,
            nova: nova,
            potvrdaNova: potvrdaNova
        })
        .pipe(catchError(this.handleError));
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor servera za dodavanje novog pacijenta
    addPatient(ime: string, prezime: string, email: string, spol: string, starost: number){

        return this.http.post(this.baseUrl + 'lijecnik/lijecnik.php',
        {   
            ime: ime,
            prezime: prezime,
            email: email,
            spol: spol,
            starost: starost
        })
        .pipe(catchError(this.handleError));
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor servera za dohvaćanje svih pacijenata za pretragu
    getPatient(ime: string, prezime: string, mbo: number){

        return this.http.post<Pacijent[]>(this.baseUrl + 'pacijent.php', 
        {
            ime: ime,
            prezime: prezime,
            mbo: mbo    
        }).pipe(
            catchError(this.handleError));
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable sa svim registriranim pacijentima
    getAllPatients(){

        return this.http.get<Pacijent[]>(this.baseUrl + 'getAllPatients.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru za dohvaćanjem podataka pacijenta
    getPatientData(id: number){
        //Uz GET metodu šaljem dodatni parametar ID pacijenta
        const params = new HttpParams().append("id",id.toString());
        //Kreiram i vraćam Observable u kojem ću dohvatiti podatke za pacijenta iz baze
        return this.http.get<Pacijent>(this.baseUrl + 'pacijent.php',{params: params}).pipe(
            catchError(this.handleError)
            );
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor servera za ažuriranje pacijenta
    editPatient(id: number, ime: string, prezime: string, email: string, spol: string, starost: number){

        return this.http.put(this.baseUrl + 'pacijent.php',{
            id: id,
            ime: ime,
            prezime: prezime,
            email: email,
            spol: spol,
            starost: starost
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
        return this.http.get<number>(this.baseUrl + 'getCountPatient.php').pipe(catchError(this.handleError));
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