import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import {handleError} from '../../shared/rxjs-error';
import {baseUrl} from '../../backend-path';

@Injectable({
    providedIn: 'root'
})
export class PovijestBolestiService{

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja dohvaća zadnje uneseni ID povijesti bolesti za povezan slučaj
    getIDPovijestBolesti(idPacijent: number, idObrada: number, mkbSifraPrimarna: string){
        let params = new HttpParams().append("idPacijent",idPacijent.toString());
        params = params.append("idObrada",idObrada.toString());
        params = params.append("mkbSifraPrimarna",mkbSifraPrimarna);
        return this.http.get<any>(baseUrl + 'lijecnik/getIDPovijestBolesti.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na potvrdu povijesti bolesti
    potvrdiPovijestBolesti(idLijecnik:number,idPacijent: number,razlogDolaska: string, anamneza: string,
                        status: string, nalaz: string, mkbPrimarnaDijagnoza: string, mkbSifre: string[],
                        tipSlucaj: string, terapija: string, preporukaLijecnik: string, napomena: string, 
                        idObrada: number,prosliPregled: string, proslaBoja: string){
        return this.http.post<any>(baseUrl + 'lijecnik/povijestBolesti.php',{
            idLijecnik,
            idPacijent,
            razlogDolaska,
            anamneza,
            status,
            nalaz,
            mkbPrimarnaDijagnoza,
            mkbSifre,
            tipSlucaj,
            terapija,
            preporukaLijecnik,
            napomena,
            idObrada,
            prosliPregled,
            proslaBoja
        }).pipe(catchError(handleError));
    }

}