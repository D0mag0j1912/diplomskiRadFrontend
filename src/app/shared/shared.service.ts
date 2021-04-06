import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { catchError } from "rxjs/operators";
import {baseUrl} from '../backend-path';
import {handleError} from '../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class SharedService {

    //Kreiram Subject koji će napraviti razliku između izdavanja recepta i izdavanja uputnice pri ulasku u povijest bolesti kada pacijent NIJE aktivan
    receptIliUputnica = new BehaviorSubject<string>(null);
    //Kreiram Observable od njega
    receptIliUputnicaObs = this.receptIliUputnica.asObservable();
    //Kreiram Subject koji sadrži sve ID-ove pacijenata kojima je napisana povijest bolesti kada pacijent NIJE aktivan
    pacijentiIDsSubject = new BehaviorSubject<number[]>([]);
    //Kreiram Observable od njega
    pacijentiIDsObs = this.pacijentiIDsSubject.asObservable();

    //Kreiram polje u koje ću spremati ID-ove pacijenata
    pacijentiIDs: number[] = [];

    constructor(private http: HttpClient){}

     //Metoda koja dohvaća zadnje dodani ID obrade (random dodani) za pacijenta
     getRandomIDObrada(idPacijent: number){
        let params = new HttpParams().append("idPacijent",idPacijent.toString());
        return this.http.get<string>(baseUrl + 'shared/getRandomIDObrada.php',{params: params}).pipe(
            catchError(handleError)
        );
    }

    //Metoda koja se poziva kada se refresha preglednik
    refreshPacijentiIDs(){
        //Dohvaćam trenutno polje ID-ova pacijenata iz LS
        const pacijentiIDs: number[] = JSON.parse(localStorage.getItem("pacijentiIDs"));
        if(!pacijentiIDs){
            return;
        }
        //Kopiram to cijelo polje u svoje iz servisa
        this.pacijentiIDs = [...pacijentiIDs];
        //Polje iz LS stavljam u Subject
        this.pacijentiIDsSubject.next(pacijentiIDs); 
    }
 
}