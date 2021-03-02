import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { catchError } from "rxjs/operators";
import { Recept } from "src/app/shared/modeli/recept.model";
import {handleError} from '../../../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class ListaReceptiService{
    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";
    //Definiram Subject pomoću kojega ću prenijeti ID pacijenta s lijeve tablice u desnu tablicu
    prijenosnikUListuRecepata = new Subject<string[]>();
    //Kreiram Observable od njega
    prijenosnikUListuRecepataObs = this.prijenosnikUListuRecepata.asObservable();
    //Kreiram Subject kojim prenosim informaciju da liječnik želi ažurirati recept
    editMessenger = new BehaviorSubject<Recept>(null);
    //Kreiram Observable od njega
    editMessengerObs = this.editMessenger.asObservable();

    constructor(
        //Dohvaćam http
        private http: HttpClient
    ){}

    //Metoda koja vraća Observable u kojemu se nalaze svi recepti koji odgovaraju pacijentima čiji ID mi je poslan Subjectom
    getReceptiTablica(ids: string[]){
        let params = new HttpParams().append("ids",JSON.stringify(ids));
        return this.http.get<any>(this.baseUrl + 'recept/listaRecepti/getReceptiTablica.php',{params: params}) 
            .pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze svi recepti koji odgovaraju PRETRAZI
    getReceptiPretraga(pretraga: string){
        pretraga = encodeURIComponent(pretraga);
        let params = new HttpParams().append("pretraga",pretraga);
        return this.http.get<any>(this.baseUrl + 'recept/listaRecepti/getReceptiPretraga.php',{params: params}) 
            .pipe(catchError(handleError));
    }

    //Metoda koja vraća Observable u kojemu se nalaze svi recepti za INICIJALNO POSTAVLJENE PACIJENTE u LISTI RECEPATA
    getInicijalniRecepti(){

        return this.http.get<any>(this.baseUrl + 'recept/listaRecepti/getInicijalniRecepti.php')
        .pipe(
            catchError(handleError)
        );
    }

}