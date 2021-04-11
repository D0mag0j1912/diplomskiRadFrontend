import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
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
    private pacijentiIDsSubject = new BehaviorSubject<number[]>([]);
    //Kreiram Observable od njega
    pacijentiIDsObs = this.pacijentiIDsSubject.asObservable();

    //Kreiram polje u koje ću spremati ID-ove pacijenata
    private pacijentiIDs: number[] = [];

    constructor(private http: HttpClient){}

    resetPacijentiIDs(){
        this.pacijentiIDs = [];
        this.pacijentiIDsSubject.next([...this.pacijentiIDs]);
    }

    //Metoda koja nadodava ID pacijenta u polje
    addPacijentiIDs(idPacijent: number){
        //Nadodavam novi element u polje
        this.pacijentiIDs.push(idPacijent);
        //Emitiram novo stanje polja Subjectom
        this.pacijentiIDsSubject.next([...this.pacijentiIDs]);
    }

    //Metoda koja briše ID pacijenta iz polja
    filterPacijentiIDs(idPacijent: string){
        //Filtriram polje ID-ova pacijenata kojima je dodana povijest bolesti
        const filtriranoPolje = this.pacijentiIDs.filter((element) => {
            //Izbacujem ID pacijenta iz polja kojemu je upravo dodan recept
            return element != +idPacijent;
        });
        //Vrijednost filtriranog polja prebacujem u svoje polje
        this.pacijentiIDs = [...filtriranoPolje];
        //Emitiram novo stanje polja Subjectom
        this.pacijentiIDsSubject.next([...this.pacijentiIDs]);
    }

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
