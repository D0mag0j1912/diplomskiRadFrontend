import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ZdravstveniPodatci } from 'src/app/shared/modeli/zdravstveniPodatci.model';
import {handleError} from '../../rxjs-error';
import {baseUrl} from '../../../backend-path';

@Injectable({
    providedIn: 'root'
})
export class ZdravstveniPodatciService{

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalaze svi ZDRAVSTVENI podatci pacijenta koji je aktivan u obradi
    getHealthDataPatient(tip: string){
        let params = new HttpParams().append("tip",tip);
        return this.http.get<ZdravstveniPodatci | any>(baseUrl + 'zdravstveniPodatciPacijent/getHealthDataPatient.php',{params: params}).pipe(
            catchError(handleError)
        );
    }

    //Metoda koja vraća odgovor servera na ažuriranje zdravstvenih podataka
    potvrdiZdravstvenePodatke(idPacijent: number, mbo: string, nositeljOsiguranja: string, drzavaOsiguranja: string, kategorijaOsiguranja: string,
                            trajnoOsnovno: string, osnovnoOsiguranjeOd: Date, osnovnoOsiguranjeDo: Date, brIskDopunsko: string,
                            dopunskoOsiguranjeOd: Date, dopunskoOsiguranjeDo: Date, oslobodenParticipacije: string, 
                            clanakParticipacija: string, trajnoParticipacija: string, participacijaDo: Date, sifUred: number){
        return this.http.put(baseUrl + 'zdravstveniPodatciPacijent/potvrdiZdravstvenePodatke.php',{
            idPacijent: idPacijent,
            mbo:mbo,
            nositeljOsiguranja: nositeljOsiguranja,
            drzavaOsiguranja: drzavaOsiguranja,
            kategorijaOsiguranja: kategorijaOsiguranja,
            trajnoOsnovno: trajnoOsnovno,
            osnovnoOsiguranjeOd: osnovnoOsiguranjeOd,
            osnovnoOsiguranjeDo: osnovnoOsiguranjeDo,
            brIskDopunsko: brIskDopunsko,
            dopunskoOsiguranjeOd: dopunskoOsiguranjeOd,
            dopunskoOsiguranjeDo: dopunskoOsiguranjeDo,
            oslobodenParticipacije: oslobodenParticipacije,
            clanakParticipacija: clanakParticipacija,
            trajnoParticipacija: trajnoParticipacija,
            participacijaDo: participacijaDo,
            sifUred: sifUred
        }).pipe(catchError(handleError)); 
    }
}
