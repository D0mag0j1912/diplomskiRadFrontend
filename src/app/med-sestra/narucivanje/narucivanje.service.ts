import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Time } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class NarucivanjeService{

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";
    //Kreiram BehaviourSubject da mogu prenijeti podatke narudžbe iz tablice u PROZOR NARUDŽBI
    podatciNarudzbe = new BehaviorSubject<{idNarudzba: string,vrijeme:Time,danUTjednu: string,datum: Date}>(null);
    //Kreiram Observable od Subjecta
    obsPodatciNarudzbe = this.podatciNarudzbe.asObservable();
    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalaze svi datumi i nazivi dana tih datuma 
    getDatumiNazivi(){

        return this.http.get<any>(this.baseUrl + 'narucivanje/getDatumiNazivi.php').pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze sva vremena u danu
    getVremena(){

        return this.http.get<any>(this.baseUrl + 'narucivanje/getVremena.php').pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze svi podatci za određenu narudžbu
    getNarudzba(idNarudzba: string){

        const params = new HttpParams().append("idNarudzba",idNarudzba);
        return this.http.get<any>(this.baseUrl + 'narucivanje/getNarudzba.php',{params: params}).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze svi pacijenti (IME I PREZIME)
    getPacijenti(){

        return this.http.get<any[]>(this.baseUrl + 'narucivanje/getPacijenti.php').pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze sve vrste pregleda i ostali podatci vezani za pacijenta i narudžbu
    getVrstaPregled(){

        return this.http.get<any[]>(this.baseUrl + 'narucivanje/getVrstaPregled.php').pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze sve RAZLIČITE vrste pregleda
    getRazliciteVrstePregleda(){

        return this.http.get<any[]>(this.baseUrl + 'narucivanje/getRazliciteVrstePregleda.php').pipe(catchError(this.handleError));
    }

    azurirajNarudzbu(idNarudzba: string,vrijeme: Time, vrstaPregleda: string, datum: Date, pacijent: string, napomena: string){

        return this.http.put<any>(this.baseUrl + 'narucivanje/azurirajNarudzbu.php',{
            idNarudzba,
            vrijeme,
            vrstaPregleda,
            datum,
            pacijent,
            napomena
        }).pipe(catchError(this.handleError));
    }
    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na AŽURIRANJE PODATAKA NARUDŽBE
    onAzurirajNarudzbu(vrijeme: Time, vrstaPregleda: string, datum: Date, pacijent: string, napomena: string){

        return this.obsPodatciNarudzbe.pipe(
            switchMap(podatci => {
                console.log(podatci.idNarudzba);
                //ID narudžbu iz Subjecta šaljem metodi za ažuriranje narudžbe
                return this.azurirajNarudzbu(podatci.idNarudzba,vrijeme,vrstaPregleda,datum,pacijent,napomena);
            })
        );
    }

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na NARUČIVANJE pacijenta
    naruciPacijenta(vrijeme: Time, vrstaPregleda: string, datum: Date,pacijent: string, napomena: string){

        return this.http.post<any>(this.baseUrl + 'narucivanje/naruciPacijenta.php',{
            vrijeme,
            vrstaPregleda,
            datum,
            pacijent,
            napomena
        }).pipe(catchError(this.handleError));
    }

    otkaziNarudbu(idNarudzba: string){

        const params = new HttpParams().append("idNarudzba",idNarudzba);
        return this.http.delete<any>(this.baseUrl + 'narucivanje/otkaziNarudzbu.php',{params:params}).pipe(catchError(this.handleError));
    }
    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na OTKAZIVANJE NARUDŽBE pacijenta
    onOtkaziNarudzbu(){

        return this.obsPodatciNarudzbe.pipe(
            switchMap(podatci => {
                return this.otkaziNarudbu(podatci.idNarudzba);
            })
        );
    }

    //Metoda koja vraća Observable u kojemu se nalazi datum za navedeni dan u tjednu
    dohvatiDatum(danUTjednu: string,datum: Date){

        let params = new HttpParams().append("danUTjednu",danUTjednu);
        params = params.append("datum",datum.toString());
        return this.http.get<Date>(this.baseUrl + 'narucivanje/dohvatiDatum.php',{params: params}).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi vrijeme narudžbe koje ću prikazati kada je ćelija prazna
    dohvatiVrijeme(vrijeme: Time){

        const params = new HttpParams().append("vrijeme",vrijeme.toString());
        return this.http.get<Time>(this.baseUrl + 'narucivanje/dohvatiVrijeme.php',{params: params}).pipe(catchError(this.handleError));
    }

    //Metoda koja uzima podatke od prvog Observable, prekida njegovu pretplatu te prosljeđuje te podatke tri preostale metode
    prikaziDetaljeNarudzbe(){
        //Vraćam polje u kojemu se nalazi DATUM narudžbe, VRIJEME narudžbe te detalji narudžbe
        return this.obsPodatciNarudzbe.pipe(
            switchMap(podatci => {
                return combineLatest([
                    this.dohvatiDatum(podatci.danUTjednu,podatci.datum),
                    this.getNarudzba(podatci.idNarudzba),
                    this.dohvatiVrijeme(podatci.vrijeme),
                    this.getVrstaPregled()
                ]);
            }),
            catchError(this.handleError)
        );
    }

    //Metoda koja vraća Observable u kojemu se nalazi današnji datum
    dohvatiDanasnjiDatum(){

        return this.http.get<Date>(this.baseUrl + 'narucivanje/dohvatiDanasnjiDatum.php').pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi NOVO STANJE TABLICE NAKON IZBORA DATUMA
    dohvatiNovoStanje(datum: Date){

        const params = new HttpParams().append("datum",datum.toString());
        return this.http.get<any>(this.baseUrl + 'narucivanje/dohvatiNovoStanje.php',{params:params}).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi NOVO STANJE DATUMA I NAZIVA DANA U TJEDNU NAKON IZBORA DATUMA
    dohvatiNovoStanjeDatumiNazivi(datum: Date){

        const params = new HttpParams().append("datum",datum.toString());
        return this.http.get<any>(this.baseUrl + 'narucivanje/dohvatiNovoStanjeDatumiNazivi.php',{params:params}).pipe(catchError(this.handleError));
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