import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, throwError } from "rxjs";
import { Cekaonica } from "../modeli/cekaonica.model";
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CekaonicaService{
    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";
    //Kreiram BehaviourSubject da mogu poslati podatke iz čekaonice u detalje pregleda
    podatciPregleda = new BehaviorSubject<{idObrada: number}>(null);
    //Pretvaram Subject u Observable
    obsPodatciPregleda = this.podatciPregleda.asObservable();
    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja šalje zahtjev serveru za dodavanje pacijenta u čekaonicu te vraća Observable u kojemu se nalazi odgovor servera
    addToWaitingRoom(id: number){

        return this.http.post<any>(this.baseUrl + 'cekaonica/cekaonica.php',
        {   
            id: id
        }).pipe(catchError(this.handleError));
    }

    //Metoda koja šalje zahtjev serveru za dohvaćanje pacijenata iz čekaonice te vraća Observable u kojemu se nalaze pronađeni pacijenti
    getPatientsWaitingRoom(){

        return this.http.get<Cekaonica[]>(this.baseUrl + 'cekaonica/cekaonica.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru za prikazom 10 pacijenata iz čekaonice
    getTenLast(){

        //Vraćam Observable u kojemu se nalazi odgovor servera na dohvat 10 zadnjih pacijenata
        return this.http.get<Cekaonica[]>(this.baseUrl + 'cekaonica/getTenLastWaitingRoom.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja vraća Observable u kojemu se nalaze pacijenti onoga statusa kojega korisnik klikne
    getPatientByStatus(statusi: string[]){

        return this.http.post<Cekaonica[]>(this.baseUrl + 'cekaonica/getPatientByStatus.php',
        {   
            statusi: statusi
        }).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na brisanje pacijenta iz čekaonice
    onDeleteCekaonica(idObrada: number,idCekaonica: number){
        //Uz DELETE metodu šaljem dodatni parametar ID čekaonice
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: {
                idObrada: idObrada,
                idCekaonica: idCekaonica
            }
        };
        //Kreiram i vraćam Observable za brisanje pacijenta 
        return this.http.delete(this.baseUrl + 'cekaonica/izbrisiPacijentCekaonica.php', options).pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera koliko ima još pacijenata u čekaonici
    checkCountCekaonica(){

        return this.http.get<number>(this.baseUrl + 'cekaonica/checkCountCekaonica.php').pipe(catchError(this.handleError));
    }

    //Metoda koja dohvaća ime, prezime te datum pregleda pacijenta u svrhu prikazivanja na detaljima pregleda
    getImePrezimeDatum(idObrada: number){

        let params = new HttpParams().append("idObrada",idObrada.toString());
        return this.http.get<any>(this.baseUrl + 'cekaonica/detalji-pregleda/getImePrezimeDatum.php',
                                {params: params}).
                                pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze NAZIVI i ŠIFRE sekundarnih dijagnoza na osnovu šifre sek. dijagnoze
    getNazivSifraPovijestBolesti(mkbSifraSekundarna: string){

        let params = new HttpParams().append("mkbSifraSekundarna",mkbSifraSekundarna.toString());
        return this.http.get<any>(this.baseUrl + 'cekaonica/detalji-pregleda/getNazivSifraPovijestBolesti.php',
                                {params: params})
                                .pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze NAZIVI i ŠIFRE sekundarnih dijagnoza na osnovu šifre sek. dijagnoze
    getNazivSifraOpciPodatci(mkbSifraSekundarna: string){

        let params = new HttpParams().append("mkbSifraSekundarna",mkbSifraSekundarna.toString());
        return this.http.get<any>(this.baseUrl + 'cekaonica/detalji-pregleda/getNazivSifraOpciPodatci.php',
                                {params: params})
                                .pipe(catchError(this.handleError));
    }

    //Metoda koja dohvaća podatke povijesti bolesti za određeni ID čekaonice
    getPovijestBolesti(idObrada: number){

        let params = new HttpParams().append("idObrada",idObrada.toString());
        return this.http.get<any>(this.baseUrl + 'cekaonica/detalji-pregleda/getPovijestBolesti.php',
                                {params: params}).
                                pipe(catchError(this.handleError));
    }

    //Metoda koja dohvaća opće podatke pregleda za određeni ID čekaonice
    getOpciPodatci(idObrada: number){

        let params = new HttpParams().append("idObrada",idObrada.toString());
        return this.http.get<any>(this.baseUrl + 'cekaonica/detalji-pregleda/getOpciPodatci.php',
                                {params: params}).
                                pipe(catchError(this.handleError));
    }

    //Metoda koja dohvaća odgovore servera više metoda te ih kombinira
    prikaziDetaljePregleda(){
        return this.obsPodatciPregleda.pipe(
            switchMap(podatci => {
                console.log(podatci.idObrada);
                return combineLatest([
                    this.getImePrezimeDatum(podatci.idObrada),
                    this.getOpciPodatci(podatci.idObrada),
                    this.getPovijestBolesti(podatci.idObrada)
                ]);
            })
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