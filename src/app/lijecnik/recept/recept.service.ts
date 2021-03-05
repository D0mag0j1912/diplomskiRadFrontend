import { Time } from "@angular/common";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { catchError } from "rxjs/operators";
import { Recept } from "src/app/shared/modeli/recept.model";
import {handleError} from '../../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class ReceptService{
    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";
    //Subject koji šalje poruku tablici pacijenata 
    messenger = new Subject<boolean>();
    messengerObs = this.messenger.asObservable();
    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na dodavanje recepta u bazu
    azurirajRecept(mkbSifraPrimarna: string,mkbSifraSekundarna: string[], osnovnaListaLijekDropdown: string,
        osnovnaListaLijekText: string, dopunskaListaLijekDropdown: string, dopunskaListaLijekText: string,
        osnovnaListaMagPripravakDropdown: string, osnovnaListaMagPripravakText: string, dopunskaListaMagPripravakDropdown: string,
        dopunskaListaMagPripravakText: string, kolicina: string, doziranje: string, dostatnost: string, hitnost: string, 
        ponovljiv: string, brojPonavljanja: string, sifraSpecijalist: string,idPacijent: string,datumRecept: Date, vrijemeRecept: Time){
        //Kodiram lijek koji je unesen
        if(osnovnaListaLijekDropdown){
            osnovnaListaLijekDropdown = encodeURIComponent(osnovnaListaLijekDropdown);
        }
        else if(osnovnaListaLijekText){
            osnovnaListaLijekText = encodeURIComponent(osnovnaListaLijekText);
        }
        else if(dopunskaListaLijekDropdown){
            dopunskaListaLijekDropdown = encodeURIComponent(dopunskaListaLijekDropdown);
        }
        else if(dopunskaListaLijekText){
            dopunskaListaLijekText = encodeURIComponent(dopunskaListaLijekText); 
        }
        
        return this.http.put<any>(this.baseUrl + 'recept/handleRecept/azurirajRecept.php',{
            mkbSifraPrimarna,
            mkbSifraSekundarna,
            osnovnaListaLijekDropdown,
            osnovnaListaLijekText,
            dopunskaListaLijekDropdown,
            dopunskaListaLijekText,
            osnovnaListaMagPripravakDropdown,
            osnovnaListaMagPripravakText,
            dopunskaListaMagPripravakDropdown,
            dopunskaListaMagPripravakText,
            kolicina,
            doziranje,
            dostatnost,
            hitnost,
            ponovljiv,
            brojPonavljanja,
            sifraSpecijalist,
            idPacijent,
            datumRecept,
            vrijemeRecept
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable sa svim podatcima recepta (Ažuriranje recepta)
    getRecept(recept: Recept){
        //Kreiram kopiju poslanog objekta recepta te tu kopiju prosljeđujem dalje backendu
        const pom = {...recept};
        //Kodiram proizvod
        pom.proizvod = encodeURIComponent(pom.proizvod); 
        let params = new HttpParams().append("dostatnost",pom.dostatnost);
        params = params.append("datumRecept", pom.datumRecept.toString());
        params = params.append("idPacijent",pom.idPacijent.toString());
        params = params.append("mkbSifraPrimarna",pom.mkbSifraPrimarna);
        params = params.append("proizvod", pom.proizvod);
        params = params.append("vrijemeRecept", pom.vrijemeRecept.toString());
        return this.http.get<any>(this.baseUrl + 'recept/handleRecept/getRecept.php',{params: params}) 
            .pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na prekoračenje maksimalne doze
    getMaksimalnaDoza(lijek: string,doza: string){
        //Kodiram specijalne znakove
        lijek = encodeURIComponent(lijek);
        doza = encodeURIComponent(doza);
        //Kreiram paramse da ih mogu poslati u backend
        let params = new HttpParams().append("lijek",lijek);
        params = params.append("doza",doza);
        return this.http.get<any>(this.baseUrl + 'recept/getMaksimalnaDoza.php',
        {
            params: params
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na dodavanje recepta u bazu
    dodajRecept(mkbSifraPrimarna: string,mkbSifraSekundarna: string[], osnovnaListaLijekDropdown: string,
                osnovnaListaLijekText: string, dopunskaListaLijekDropdown: string, dopunskaListaLijekText: string,
                osnovnaListaMagPripravakDropdown: string, osnovnaListaMagPripravakText: string, dopunskaListaMagPripravakDropdown: string,
                dopunskaListaMagPripravakText: string, kolicina: string, doziranje: string, dostatnost: string, hitnost: string, 
                ponovljiv: string, brojPonavljanja: string, 
                sifraSpecijalist: string,idPacijent: string,idLijecnik: number, 
                poslanaPrimarna: string, poslaniIDObrada: string){
        //Kodiram lijek koji je unesen
        if(osnovnaListaLijekDropdown){
            osnovnaListaLijekDropdown = encodeURIComponent(osnovnaListaLijekDropdown);
        }
        else if(osnovnaListaLijekText){
            osnovnaListaLijekText = encodeURIComponent(osnovnaListaLijekText);
        }
        else if(dopunskaListaLijekDropdown){
            dopunskaListaLijekDropdown = encodeURIComponent(dopunskaListaLijekDropdown);
        }
        else if(dopunskaListaLijekText){
            dopunskaListaLijekText = encodeURIComponent(dopunskaListaLijekText); 
        }
         
        return this.http.post<any>(this.baseUrl + 'recept/handleRecept/dodajRecept.php',{
            mkbSifraPrimarna,
            mkbSifraSekundarna,
            osnovnaListaLijekDropdown,
            osnovnaListaLijekText,
            dopunskaListaLijekDropdown,
            dopunskaListaLijekText,
            osnovnaListaMagPripravakDropdown,
            osnovnaListaMagPripravakText,
            dopunskaListaMagPripravakDropdown,
            dopunskaListaMagPripravakText,
            kolicina,
            doziranje,
            dostatnost,
            hitnost,
            ponovljiv,
            brojPonavljanja,
            sifraSpecijalist,
            idPacijent,
            idLijecnik,
            poslanaPrimarna,
            poslaniIDObrada
        }).pipe(catchError(handleError));
    }

    //Metoda koja šalje ID pacijenta te vraća Observable u kojemu se nalazi odgovor servera na dohvat dijagnoza za unos recepta
    getInicijalnoDijagnoze(id: number){
        const params = new HttpParams().append("idPacijent",id.toString());
        return this.http.get<any>(this.baseUrl + 'recept/getInicijalnoDijagnoze.php',
        {
            params: params
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi ukupno trajanje terapije
    getDostatnost(lijek: string, kolicina: string,doza: string,brojPonavljanja: string){
        //Kodiram specijalne znakove
        lijek = encodeURIComponent(lijek);
        kolicina = encodeURIComponent(kolicina);
        doza = encodeURIComponent(doza);
        brojPonavljanja = encodeURIComponent(brojPonavljanja);
        //Kreiram paramse da ih mogu poslati u backend
        let params = new HttpParams().append("lijek",lijek);
        params = params.append("kolicina",kolicina);
        params = params.append("doza",doza);
        params = params.append("brojPonavljanja",brojPonavljanja);
        return this.http.get<any>(this.baseUrl + 'recept/dostatnost/getDostatnost.php',
        {
            params: params
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi DATUM do kada vrijedi terapija
    getDatumDostatnost(dostatnost: string){
        let params = new HttpParams().append("dostatnost",dostatnost);
        return this.http.get<Date>(this.baseUrl + 'recept/dostatnost/getDatumDostatnost.php',
        {
            params: params
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi informacija je li MAGISTRALNI PRIPRAVAK ima oznaku "RS"
    getOznakaMagistralniPripravak(magPripravak: string){
        magPripravak = encodeURIComponent(magPripravak);
        let params = new HttpParams().append("magPripravak",magPripravak);
        return this.http.get<any>(this.baseUrl + 'recept/oznake/getOznakaMagPripravak.php',
        {
            params: params
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi informacija je li LIJEK ima oznaku "RS"
    getOznakaLijek(lijek: string){
        lijek = encodeURIComponent(lijek);
        let params = new HttpParams().append("lijek",lijek);
        return this.http.get<any>(this.baseUrl + 'recept/oznake/getOznakaLijek.php', 
        {
            params: params
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi cijena MAGISTRALNOG PRIPRAVKA sa DOPUNSKE LISTE
    getCijenaMagPripravakDL(magPripravak: string){
        magPripravak = encodeURIComponent(magPripravak);
        let params = new HttpParams().append("magPripravak",magPripravak);
        return this.http.get<any>(this.baseUrl + 'recept/cijene/getCijenaMagPripravakDL.php',
        {   
            params: params
        }).pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi cijena LIJEKA sa DOPUNSKE LISTE
    getCijenaLijekDL(lijek: string){
        lijek = encodeURIComponent(lijek);
        let params = new HttpParams().append("lijek",lijek);
        return this.http.get<any>(this.baseUrl + 'recept/cijene/getCijenaLijekDL.php',
            {params: params}
        ).pipe(catchError(handleError));
    }

}