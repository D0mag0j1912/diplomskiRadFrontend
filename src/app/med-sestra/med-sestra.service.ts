import { HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import {handleError} from '../shared/rxjs-error';
import {baseUrl} from '../backend-path';

@Injectable({
    providedIn: 'root'
})
export class MedSestraService{

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalaze osobni podatci medicinske sestre
    getPersonalData(){
        return this.http.get<any>(baseUrl + 'med-sestra/medSestra.php').pipe(
            catchError(handleError)
        );    
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor backenda na ažuriranje osobnih podataka medicinske sestre
    editPersonalData(id: number, email: string, ime: string, prezime: string, adresa: string, specijalizacija: string){

        return this.http.put<any>(baseUrl + 'med-sestra/azurirajOsobnePodatke.php',
        {
            id: id,
            email: email,
            ime: ime,
            prezime: prezime,
            adresa: adresa,
            specijalizacija: specijalizacija
        })
        .pipe(catchError(handleError));
    }

    //Metoda koja šalje zahtjev serveru i vraća Observable u kojemu se nalazi odgovor backenda za ažuriranje lozinke medicinske sestre
    editPassword(id: number,trenutna: string, nova: string, potvrdaNova: string){

        return this.http.put(baseUrl + 'med-sestra/azurirajLozinka.php',
        {
            id: id,
            trenutna: trenutna,
            nova: nova,
            potvrdaNova: potvrdaNova
        });
    }

    //Metoda koja šalje serveru sve podatke koji se tiču općih podataka pregleda 
    sendVisitData(idMedSestra: number, idPacijent: number, nacinPlacanja: string, podrucniUredHZZO: string, 
                podrucniUredOzljeda: string, nazivPoduzeca: string,
                oznakaOsiguranika: string, nazivDrzave: string, mbo: string, brIskDopunsko: string,
                mkbPrimarnaDijagnoza: string, mkbSifre: string[], tipSlucaj: string,idObrada: number, 
                prosliPregled: string, proslaBoja: string){

        //Vraćam Observable u kojemu se nalazi odgovor servera na slanje općih podataka pregleda
        return this.http.post<any>(baseUrl + 'med-sestra/opciPodatciPregleda.php', 
        {
            idMedSestra: idMedSestra,
            idPacijent: idPacijent,
            nacinPlacanja: nacinPlacanja,
            oznakaOsiguranika: oznakaOsiguranika,
            nazivDrzave: nazivDrzave,
            mbo: mbo,
            tipSlucaj: tipSlucaj,
            mkbPrimarnaDijagnoza: mkbPrimarnaDijagnoza,
            mkbSifre: mkbSifre,
            brIskDopunsko: brIskDopunsko,
            podrucniUredHZZO: podrucniUredHZZO,
            podrucniUredOzljeda: podrucniUredOzljeda,
            nazivPoduzeca: nazivPoduzeca,
            idObrada: idObrada,
            prosliPregled: prosliPregled,
            proslaBoja: proslaBoja
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable sa ID-em pregleda kojega povezujem
    getIDPregled(mboPacijent: string, idObrada: number, mkbSifraPrimarna){
        let params = new HttpParams().append("mboPacijent",mboPacijent);
        params = params.append("idObrada",idObrada.toString());
        params = params.append("mkbSifraPrimarna",mkbSifraPrimarna);
        return this.http.get<any>(baseUrl + 'med-sestra/getIDPregled.php',{params: params}).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze zdravstveni podatci trenutno aktivnog pacijenta
    getHealthData(tip: string){
        let params = new HttpParams().append("tip",tip);
        return this.http.get<any>(baseUrl + 'med-sestra/getZdravstveniPodatci.php',{params: params}).pipe(catchError(handleError));
    }

}