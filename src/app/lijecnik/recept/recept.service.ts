import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ReceptService{
    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";
    
    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na dodavanje recepta u bazu
    dodajRecept(mkbSifraPrimarna: string,mkbSifraSekundarna: string[], osnovnaListaLijekDropdown: string,
                osnovnaListaLijekText: string, dopunskaListaLijekDropdown: string, dopunskaListaLijekText: string,
                osnovnaListaMagPripravakDropdown: string, osnovnaListaMagPripravakText: string, dopunskaListaMagPripravakDropdown: string,
                dopunskaListaMagPripravakText: string, kolicina: string, doziranje: string, dostatnost: string, hitnost: string, 
                ponovljiv: string, brojPonavljanja: string){
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
         
        return this.http.post<any>(this.baseUrl + 'recept/dodajRecept.php',{
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
            brojPonavljanja
        }).pipe(catchError(this.handleError));
    }

    //Metoda koja šalje ID pacijenta te vraća Observable u kojemu se nalazi odgovor servera na dohvat dijagnoza za unos recepta
    getInicijalnoDijagnoze(id: number){
        const params = new HttpParams().append("idPacijent",id.toString());
        return this.http.get<any>(this.baseUrl + 'recept/getInicijalnoDijagnoze.php',
        {
            params: params
        }).pipe(catchError(this.handleError));
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
        }).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi DATUM do kada vrijedi terapija
    getDatumDostatnost(dostatnost: string){
        let params = new HttpParams().append("dostatnost",dostatnost);
        return this.http.get<any>(this.baseUrl + 'recept/dostatnost/getDatumDostatnost.php',
        {
            params: params
        }).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi informacija je li MAGISTRALNI PRIPRAVAK ima oznaku "RS"
    getOznakaMagistralniPripravak(magPripravak: string){
        magPripravak = encodeURIComponent(magPripravak);
        let params = new HttpParams().append("magPripravak",magPripravak);
        return this.http.get<any>(this.baseUrl + 'recept/oznake/getOznakaMagPripravak.php',
        {
            params: params
        }).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi informacija je li LIJEK ima oznaku "RS"
    getOznakaLijek(lijek: string){
        lijek = encodeURIComponent(lijek);
        let params = new HttpParams().append("lijek",lijek);
        return this.http.get<any>(this.baseUrl + 'recept/oznake/getOznakaLijek.php', 
        {
            params: params
        }).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi cijena MAGISTRALNOG PRIPRAVKA sa DOPUNSKE LISTE
    getCijenaMagPripravakDL(magPripravak: string){
        magPripravak = encodeURIComponent(magPripravak);
        let params = new HttpParams().append("magPripravak",magPripravak);
        return this.http.get<any>(this.baseUrl + 'recept/cijene/getCijenaMagPripravakDL.php',
        {   
            params: params
        }).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalazi cijena LIJEKA sa DOPUNSKE LISTE
    getCijenaLijekDL(lijek: string){
        lijek = encodeURIComponent(lijek);
        let params = new HttpParams().append("lijek",lijek);
        return this.http.get<any>(this.baseUrl + 'recept/cijene/getCijenaLijekDL.php',
            {params: params}
        ).pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable sa svim pacijentima za prikaz u tablici
    getAllPatients(){

        return this.http.get<any>(this.baseUrl + 'recept/getAllPatients.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja vraća Observable u kojemu se nalaze svi pacijenti koji odgovaraju pretrazi
    getPacijentiPretraga(value: string){
        let params = new HttpParams().append("pretraga",value);
        return this.http.get<any>(this.baseUrl + 'recept/getPacijentiPretraga.php',{params: params}).pipe(catchError(this.handleError));
    }

    //Metoda za errore
    private handleError(error: HttpErrorResponse){
        if(error.error instanceof ErrorEvent){
            console.error("An error occured: "+error.error.message);
        }
        else{
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
            `Backend returned code ${error.status}, ` +
            `body was: ${error.error}`);
        }
        // Return an observable with a user-facing error message.
        return throwError(
            'Something bad happened; please try again later.');
    }
}