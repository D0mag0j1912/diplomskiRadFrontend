import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import {baseUrl} from '../../../backend-path';
import {handleError} from '../../../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class IzdajUputnicaService {
    constructor(private http: HttpClient){}

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na dodavanje uputnice
    izdajUputnicu(
        idZdrUst: string,
        sifDjel: string,
        idPacijent: number,
        sifraSpecijalist: string,
        mkbSifraPrimarna: string,
        mkbPolje: string[],
        vrstaPregled: string,
        molimTraziSe: string,
        napomena: string,
        poslanaPrimarna: string,
        poslaniIDObrada: string,
        poslaniTipSlucaj: string,
        poslanoVrijeme: string,
        idLijecnik: number
    ){
        molimTraziSe = encodeURIComponent(molimTraziSe);
        //Kodiram lijek koji je unesen
        if(napomena){
            napomena = encodeURIComponent(napomena);
        }
        return this.http.post<any>(baseUrl + 'uputnica/izdajUputnica/izdajUputnica.php',{
            idZdrUst,
            sifDjel,
            idPacijent,
            sifraSpecijalist,
            mkbSifraPrimarna,
            mkbPolje,
            vrstaPregled,
            molimTraziSe,
            napomena,
            poslanaPrimarna,
            poslaniIDObrada,
            poslaniTipSlucaj,
            poslanoVrijeme,
            idLijecnik
        }).pipe(catchError(handleError));
    }

    //Metoda koja dohvaća dijagnoze koje su postavljene u zadnjoj povijesti bolesti
    getInicijalneDijagnoze(idObrada: number, mboPacijent: string){
        let params = new HttpParams().append("mboPacijent",mboPacijent);
        params = params.append("idObrada",idObrada.toString());
        return this.http.get<any>(baseUrl + 'uputnica/izdajUputnica/getInicijalneDijagnoze.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable koji sadrži informaciju je li unesena povijest bolesti za ovu sesiju obrade
    isUnesenaPovijestBolesti(idObrada: number, mboPacijent: string){
        let params = new HttpParams().append("idObrada",idObrada.toString());
        params = params.append("mboPacijent",mboPacijent);
        return this.http.get<string>(baseUrl + 'uputnica/izdajUputnica/isUnesenaPovijestBolesti.php',{params: params}).pipe(catchError(handleError));
    }
}
