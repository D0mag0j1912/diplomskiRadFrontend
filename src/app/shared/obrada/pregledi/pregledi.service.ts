import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { catchError } from "rxjs/operators";
import {baseUrl} from '../../../backend-path';
import {handleError} from '../../rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class PreglediService {
    //Kreiram Subject koji će obavjestiti sekundarni header da je novi pregled dodan
    pregledDodan = new Subject<{isDodan: boolean, tipKorisnik: string}>();
    //Kreiram Observable od njega
    pregledDodanObs = this.pregledDodan.asObservable();

    constructor(
        private http: HttpClient
    ){}

    //Metoda koja dohvaća DATUM najnovijeg pregleda
    getNajnovijiDatum(tipKorisnik: string, idPacijent: number){
        let params = new HttpParams().append("tipKorisnik",tipKorisnik);
        params = params.append("idPacijent",idPacijent.toString());
        return this.http.get<Date>(baseUrl + 'pregledi/najnoviji/dohvatiNajnovijiDatum.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća formatirani datum za postavljanje na filter prethodnih pregleda
    getFormattedDate(datum: Date){
        let params = new HttpParams().append("datum",datum.toString());
        return this.http.get<any>(baseUrl + 'pregledi/formatirajDatum.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja se poziva kada se dogodi refresh (da sačuvam podatke Subjecta)
    refreshOnDodanPregled(){
        const podatci: {
            isDodan: boolean;
            tipKorisnik: string;
        } = JSON.parse(localStorage.getItem("isDodanPregled"));
        if(!podatci){
            return;
        }
        this.pregledDodan.next(podatci);
    }

}
