import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import {baseUrl} from '../../backend-path';
import {handleError} from '../../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class SekundarniHeaderService{

    constructor(private http: HttpClient){}

    //Metoda koja dohvaća trenutnu cijenu pregleda
    getTrenutnaCijenaPregleda(idObrada: string, tipKorisnik: string){
        let params = new HttpParams().append("idObrada",idObrada);
        params = params.append("tipKorisnik",tipKorisnik);
        return this.http.get<string>(baseUrl + 'shared/getTrenutnaCijenaPregleda.php',{params: params}).pipe(
            catchError(handleError)
        );
    }

}
