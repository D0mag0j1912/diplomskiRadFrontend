import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Recept } from 'src/app/shared/modeli/recept.model';
import {handleError} from '../../../../shared/rxjs-error';

@Injectable({
  providedIn: 'root'
})
export class PrikazReceptService {
    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";
    constructor(
        //Dohvaćam http client
        private http: HttpClient
    ) { }

    //Metoda koja vraća Observable sa podatcima recepta i podatcima pacijenta koji je poslan iz liste recepata u prikaz recepta
    getPacijentRecept(recept: Recept){
        //Kodiram proizvod
        recept.proizvod = encodeURIComponent(recept.proizvod);
        let params = new HttpParams().append("dostatnost",recept.dostatnost);
        params = params.append("datumRecept", recept.datumRecept.toString());
        params = params.append("idPacijent",recept.idPacijent.toString());
        params = params.append("mkbSifraPrimarna",recept.mkbSifraPrimarna);
        params = params.append("proizvod", recept.proizvod);
        params = params.append("vrijemeRecept", recept.vrijemeRecept.toString());
        return this.http.get<any>(this.baseUrl + 'recept/prikaz-recept/getPacijentRecept.php',{params: params}) 
            .pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable sa podatcima zdravstvene ustanove 
    getZdrUst(){
        return this.http.get<any>(this.baseUrl + 'recept/prikaz-recept/getZdrUst.php').pipe(catchError(handleError));
    }
}
