import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {handleError} from '../rxjs-error';
import {baseUrl} from '../../backend-path';
import { catchError } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class UzorciService {
    constructor(private http: HttpClient){}

    //Metoda koja dohvaća podatke uputnice na osnovu njezinog ID-a da ih prikažem ispod dropdowna
    getPodatciUputnica(idUputnica: number){
        const params = `?idUputnica=${idUputnica.toString()}`;
        return this.http.get<any>(baseUrl + 'uzorci/getPodatciUputnica.php' + params).pipe(catchError(handleError));
    }

    //Metoda koja dohvaća ZDR. USTANOVE iz uputnica za koje još nisu dodani uzorci
    getUstanoveUzorci(idPacijent: number){
        const params = `?idPacijent=${idPacijent.toString()}`;
        return this.http.get<any>(baseUrl + 'uzorci/getUstanoveUzorci.php' + params).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable sa odgovorom servera na slanje uzoraka
    spremiUzorke(
        idUputnica: number,
        eritrociti: number,
        hemoglobin: number,
        hematokrit: number,
        mcv: number,
        mch: number,
        mchc: number,
        rdw: number,
        leukociti: number,
        trombociti: number,
        mpv: number,
        trombokrit: number,
        pdw: number,
        neutrofilniGranulociti: number,
        monociti: number,
        limfociti: number,
        eozinofilniGranulociti: number,
        bazofilniGranulociti: number,
        retikulociti: number
    ){
        return this.http.post<any>(baseUrl + 'uzorci/spremiUzorke.php',
        {
            idUputnica,
            eritrociti,
            hemoglobin,
            hematokrit,
            mcv,
            mch,
            mchc,
            rdw,
            leukociti,
            trombociti,
            mpv,
            trombokrit,
            pdw,
            neutrofilniGranulociti,
            monociti,
            limfociti,
            eozinofilniGranulociti,
            bazofilniGranulociti,
            retikulociti
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable sa svim slučajno generiranim vrijednostima uzoraka
    getUzorci(){
        return this.http.get<any>(baseUrl + 'uzorci/generirajSlucajneUzorke.php').pipe(catchError(handleError));
    }
}
