import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, of } from "rxjs";
import { catchError, switchMap, take, tap } from "rxjs/operators";
import {baseUrl} from '../backend-path';
import {handleError} from '../shared/rxjs-error';
import { ObradaService } from "./obrada/obrada.service";

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

    //Kreiram Subject koji sadrži cijenu pregleda
    private cijeneSubject = new BehaviorSubject<number>(0);
    //Kreiram Observable od njega
    cijeneObs = this.cijeneSubject.asObservable();

    constructor(
        private http: HttpClient,
        private obradaService: ObradaService
    ){}

    //Metoda koja čuva stanje cijena tijekom refresha
    cuvajCijenuPregleda(){
        //Dohvaćam vrijednost cijene iz LS
        const cijena = +JSON.parse(localStorage.getItem('trenutnaCijenaPregleda'));
        //Ako nema cijene
        if(!cijena){
            //Izađi
            return;
        }
        //Vrijednost cijene iz LS stavljam u Subject
        this.cijeneSubject.next(cijena);
    }

    //Metoda koja stavlja novu vrijednost cijena u BehaviorSubject
    postaviNovuCijenu(novaCijena: number, tipKorisnik: string){
        console.log(novaCijena);
        //Definiram varijable u koje će spremati kasnije cijene
        let staraCijena: number;
        let izracunataCijena: number;
        this.obradaService.getPatientProcessing(tipKorisnik).pipe(
            take(1),
            tap(podatci => {
                //Ako je pacijent aktivan
                if(podatci.success === "true"){
                    //Ako NE POSJEDUJE dopunsko osiguranje
                    if(!podatci[0].brojIskazniceDopunsko){
                        //Ako postoji zapisana cijena u LS
                        if(JSON.parse(localStorage.getItem("trenutnaCijenaPregleda"))){
                            //Dohvati je jer je to stara cijena
                            staraCijena = +JSON.parse(localStorage.getItem("trenutnaCijenaPregleda"));
                            //Računam novu cijenu
                            izracunataCijena = staraCijena + novaCijena;
                        }
                        //Ako ne postoji zapisana cijena u LS
                        else{
                            izracunataCijena = novaCijena;
                        }
                    }
                    //Ako POSJEDUJE dopunsko osiguranje
                    else{
                        izracunataCijena = novaCijena;
                    }
                    //Postavljam novu vrijednost cijene
                    this.cijeneSubject.next(izracunataCijena);
                    //Novu vrijednost cijene postavljam u LocalStorage
                    localStorage.setItem("trenutnaCijenaPregleda",JSON.stringify(izracunataCijena));
                }
            })
        ).subscribe();
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
