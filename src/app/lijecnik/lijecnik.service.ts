import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Injectable} from '@angular/core';
import { catchError } from 'rxjs/operators';
import {handleError} from '../shared/rxjs-error';
import {baseUrl} from '../backend-path';

@Injectable({
    providedIn: 'root'
})
export class LijecnikService{

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja šalje zahtjev serveru za dohvaćanjem osobnih podataka liječnika
    getPersonalData(){
        //Kreiram i vraćam Observable u kojem ću dohvatiti osobne podatke liječnika iz baze
        return this.http.get<any>(baseUrl + 'lijecnik/lijecnik.php').pipe(
            catchError(handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor backenda na ažuriranje osobnih podataka liječnika
    editPersonalData(id: number, email: string, ime: string, prezime: string, adresa: string, specijalizacija: string){

        return this.http.put<any>(baseUrl + 'lijecnik/azurirajOsobnePodatke.php',
        {
            id: id,
            email: email,
            ime: ime,
            prezime: prezime,
            adresa: adresa,
            specijalizacija: specijalizacija
        })
        .pipe(catchError(handleError));
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor backenda za ažuriranje lozinke liječnika
    editPassword(id: number,trenutna: string, nova: string, potvrdaNova: string){

        return this.http.put(baseUrl + 'lijecnik/azurirajLozinka.php',
        {
            id: id,
            trenutna: trenutna,
            nova: nova,
            potvrdaNova: potvrdaNova
        })
        .pipe(catchError(handleError));
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
        return this.http.delete(baseUrl + 'pacijent.php', options).pipe(
            catchError(handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru u kojem traži trenutni broj pacijenata u sustavu
    checkCountPatient(){

        //Kreiram i vraćam Observable u kojem će se nalaziti trenutni broj pacijenata
        return this.http.get<number>(baseUrl + 'lijecnik/getCountPatient.php').pipe(catchError(handleError));
    }

}