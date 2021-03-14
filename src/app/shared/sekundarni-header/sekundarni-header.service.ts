import { Injectable } from "@angular/core";
import {handleError} from '../rxjs-error';
import {baseUrl} from '../../backend-path';
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SekundarniHeaderService{

    ugasiPorukuDaNemaPregleda = new Subject<boolean>();
    ugasiPorukuDaNemaPregledaObs = this.ugasiPorukuDaNemaPregleda.asObservable();
    constructor(
        private http: HttpClient
    ){}

    //Metoda koja dohvaća ID najnovnijeg pregleda 
    getNajnovijiIDPregled(tipKorisnik: string, idPacijent: number){
        let params = new HttpParams().append("tipKorisnik",tipKorisnik);
        params = params.append("idPacijent",idPacijent.toString());
        return this.http.get<any>(baseUrl + 'pregledi/najnoviji/dohvatiNajnovijiIDPregled.php',{params: params}).pipe(catchError(handleError));
    }
}