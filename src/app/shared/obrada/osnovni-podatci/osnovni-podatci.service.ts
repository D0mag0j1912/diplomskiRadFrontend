import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import {handleError} from '../../rxjs-error';
import {baseUrl} from '../../../backend-path';

@Injectable({
    providedIn: 'root'
})
export class OsnovniPodatciService{

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}


    //Metoda koja vraća Observable u kojemu se nalaze svi OSNOVNI podatci pacijenta koji je aktivan u obradi
    getMainDataPatient(tip: string){
        let params = new HttpParams().append("tip",tip);
        return this.http.get<any>(baseUrl + 'osnovniPodatciPacijent/getMainDataPatient.php',{params: params}).pipe(
            catchError(handleError)
        );
    }

    //Metoda koja ažurira vrijednost osnovnih podataka pacijenta (Potvrdi podatke pacijenta)
    potvrdiOsnovnePodatke(idPacijent: number, ime: string, prezime: string, datRod: Date, adresa: string, oib: string,
                        email: string, spol: string, pbr: string, mobitel: string,
                        bracnoStanje: string, radniStatus: string, status: string){
        //Vraćam Observable u kojemu se nalazi odgovor servera na ažuriranje osnovnih podataka pacijenta
        return this.http.put(baseUrl + 'osnovniPodatciPacijent/potvrdiOsnovnePodatke.php',{
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
        }).pipe(catchError(handleError));
    }

}