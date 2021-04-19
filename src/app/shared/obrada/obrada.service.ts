import { HttpClient,HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { catchError } from 'rxjs/operators';
import {Time} from '@angular/common';
import {handleError} from '../rxjs-error';
import {baseUrl} from '../../backend-path';

@Injectable({
    providedIn: 'root'
})
export class ObradaService{

    //Kreiram BehaviourSubject u kojega spremam ime i prezime pacijenta
    imePrezimePacijent = new BehaviorSubject<{ime: string, prezime: string,stranica: number}>({ime:'unknown',prezime:'unknown',stranica:1});
    //Kreiram Subject kojim ću obavjestiti komponentu obrade da je pregled završio
    zavrsenPregled = new Subject<boolean>();
    obsZavrsenPregled = this.zavrsenPregled.asObservable();
    //Kreiram Subject kojim ću prenijeti trenutni ID obrade u komponentu "PrikaziPovijestBolestiComponent"
    podatciObrada = new BehaviorSubject<number>(null);
    podatciObradaObs = this.podatciObrada.asObservable();

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable sa odgovorom servera na spremanje BMI-a
    spremiBMI(
        visina: string,
        tezina: string,
        bmi: string,
        idPacijent: number,
        idObrada: number){
        return this.http.post<string>(baseUrl + 'obrada/spremiBMI.php',
        {
            visina,
            tezina,
            bmi,
            idPacijent,
            idObrada
        }).pipe(catchError(handleError));
    }

    //Metoda koja dohvaća ID obrade iz Local Storagea te ga stavlja u Subject
    refreshPodatciObrada(){
        const idObrada = +JSON.parse(localStorage.getItem("idObrada"));
        //Ako je slučajno generirana obrada, zanemari
        if(!idObrada || idObrada > 999){
            return;
        }
        //Uzimam samo ID obrade generiran preko baze
        this.podatciObrada.next(idObrada);
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalaze traženi pacijenti
    getPatients(ime: string, prezime: string, trenutnaStranica: number){

        return this.http.post<any>(baseUrl + 'obrada/getObradaPatients.php',
        {
            ime: ime,
            prezime: prezime,
            trenutnaStranica: trenutnaStranica
        }).pipe(catchError(handleError));
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalaze dodatni podatci pacijenata
    getData(ime: string, prezime: string){

        return this.http.post(baseUrl + 'obrada/getObradaPatientsDodatno.php',
        {
            ime: ime,
            prezime: prezime
        }).pipe(catchError(handleError));
    }

    //Metoda koja šalje zahtjev serveru za dodavanje pacijenta u obradu te vraća Observable u kojemu se nalazi odgovor servera
    addPatientToProcessing(tip: string,id: number){

        return this.http.post<any>(baseUrl + 'obrada/obrada.php',
        {
            id:id,
            tip:tip
        }).pipe(catchError(handleError));
    }

    //Metoda koja šalje zahtjev serveru za dohvaćanje pacijenta koji je trenutno u obradi aktivan
    getPatientProcessing(tip:string){
        let params = new HttpParams().append("tip",tip);
        return this.http.get<any>(baseUrl + 'obrada/obrada.php',{params: params}).pipe(
            catchError(handleError)
        );
    }


    //Metoda koja šalje zahtjev serveru za ažuriranje statusa pacijenta
    editPatientStatus(idObrada: number,tip: string,id: number){

        return this.http.put<any>(baseUrl + 'obrada/obrada.php',
        {
            id:id,
            tip:tip,
            idObrada: idObrada
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi sljedeći pacijent koji čeka na pregled
    getSljedeciPacijent(tip: string){
        let params = new HttpParams().append("tip",tip);
        return this.http.get<any>(baseUrl + 'obrada/sljedeciPacijent.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi vrijeme narudžbe za aktivnog pacijenta da prikažem u formi obrade
    getVrijemeNarudzbe(tip: string){
        let params = new HttpParams().append("tip",tip);
        return this.http.get<Time>(baseUrl + 'obrada/getVrijemeNarudzba.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi informacija je li trenutno aktivni pacijent obrađen (opći podatci)
    getObradenOpciPodatci(id:number){
        let params = new HttpParams().append("idPacijent",id.toString());
        return this.http.get<any>(baseUrl + 'obrada/getObradenOpciPodatci.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi informacija je li trenutno aktivni pacijent obrađen (povijest bolesti)
    getObradenPovijestBolesti(id:number){
        let params = new HttpParams().append("idPacijent",id.toString());
        return this.http.get<any>(baseUrl + 'obrada/getObradenPovijestBolesti.php',{params: params}).pipe(catchError(handleError));
    }

}
