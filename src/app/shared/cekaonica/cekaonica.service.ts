import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest } from "rxjs";
import { catchError, switchMap } from 'rxjs/operators';
import {handleError} from '../rxjs-error';
import {baseUrl} from '../../backend-path';

@Injectable({
    providedIn: 'root'
})
export class CekaonicaService{
    
    //Kreiram BehaviourSubject da mogu poslati podatke iz čekaonice u detalje pregleda
    podatciPregleda = new BehaviorSubject<{tip:string,idObrada: number}>(null);
    //Pretvaram Subject u Observable
    obsPodatciPregleda = this.podatciPregleda.asObservable();
    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja šalje zahtjev serveru za dodavanje pacijenta u čekaonicu te vraća Observable u kojemu se nalazi odgovor servera
    addToWaitingRoom(tip: string,id: number){

        return this.http.post<any>(baseUrl + 'cekaonica/cekaonica.php',
        {   
            id: id,
            tip:tip
        }).pipe(catchError(handleError));
    }

    //Metoda koja šalje zahtjev serveru za dohvaćanje pacijenata iz čekaonice te vraća Observable u kojemu se nalaze pronađeni pacijenti
    getPatientsWaitingRoom(tip: string){
        let params = new HttpParams().append("tip",tip);
        return this.http.get<any>(baseUrl + 'cekaonica/cekaonica.php',{params: params}).pipe(
            catchError(handleError)
        );
    }

    //Metoda koja šalje zahtjev serveru za prikazom 10 pacijenata iz čekaonice
    getTenLast(tip: string){
        let params = new HttpParams().append("tip",tip);
        //Vraćam Observable u kojemu se nalazi odgovor servera na dohvat 10 zadnjih pacijenata
        return this.http.get<any>(baseUrl + 'cekaonica/getTenLastWaitingRoom.php',{params: params}).pipe(
            catchError(handleError)
        );
    }

    //Metoda koja vraća Observable u kojemu se nalaze pacijenti onoga statusa kojega korisnik klikne
    getPatientByStatus(tip: string,statusi: string[]){
        let params = new HttpParams().append("tip",tip);
        params = params.append("statusi",JSON.stringify(statusi));
        return this.http.get<any>(baseUrl + 'cekaonica/getPatientByStatus.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na brisanje pacijenta iz čekaonice
    onDeleteCekaonica(tip: string,idCekaonica: number){
        //Uz DELETE metodu šaljem dodatni parametar ID čekaonice
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: {
                tip: tip,
                idCekaonica: idCekaonica
            }
        };
        //Kreiram i vraćam Observable za brisanje pacijenta 
        return this.http.delete(baseUrl + 'cekaonica/izbrisiPacijentCekaonica.php', options).pipe(
            catchError(handleError)
        );
    }

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera koliko ima još pacijenata u čekaonici
    checkCountCekaonica(){

        return this.http.get<number>(baseUrl + 'cekaonica/checkCountCekaonica.php').pipe(catchError(handleError));
    }

    //Metoda koja dohvaća ime, prezime te datum pregleda pacijenta u svrhu prikazivanja na detaljima pregleda
    getImePrezimeDatum(tip: string,idObrada: number){

        let params = new HttpParams().append("idObrada",idObrada.toString());
        params = params.append("tip",tip);
        return this.http.get<any>(baseUrl + 'cekaonica/detalji-pregleda/getImePrezimeDatum.php',
                                {params: params}).
                                pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze NAZIVI i ŠIFRE sekundarnih dijagnoza na osnovu šifre sek. dijagnoze
    getNazivSifraSekundarnaDijagnoza(tip: string,mkbSifraSekundarna: string,idObrada: number){

        let params = new HttpParams().append("mkbSifraSekundarna",mkbSifraSekundarna.toString());
        params = params.append("idObrada",idObrada.toString());
        params = params.append("tip",tip);
        return this.http.get<any>(baseUrl + 'cekaonica/detalji-pregleda/getNazivSifraSekundarnaDijagnoza.php',
                                {params: params})
                                .pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze ILI opći podatci pregleda ILI povijest bolesti pacijenta
    getPodatciPregleda(tip: string, idObrada: number){
        let params = new HttpParams().append("tip",tip);
        params = params.append("idObrada",idObrada.toString());
        return this.http.get<any>(baseUrl + 'cekaonica/detalji-pregleda/getPodatciPregleda.php',
                                {params: params})
                                .pipe(catchError(handleError));
    }

    //Metoda koja dohvaća odgovore servera više metoda te ih kombinira
    prikaziDetaljePregleda(){
        return this.obsPodatciPregleda.pipe(
            switchMap(podatci => {
                console.log(podatci.idObrada);
                return combineLatest([
                    this.getImePrezimeDatum(podatci.tip,podatci.idObrada),
                    this.getPodatciPregleda(podatci.tip,podatci.idObrada)
                ]).pipe(catchError(handleError));
            })
        );   
    }

}