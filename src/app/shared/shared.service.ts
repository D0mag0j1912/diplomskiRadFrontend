import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { catchError, switchMap, take, tap } from "rxjs/operators";
import {baseUrl} from '../backend-path';
import {handleError} from '../shared/rxjs-error';
import { ObradaService } from "./obrada/obrada.service";

@Injectable({
    providedIn: 'root'
})
export class SharedService {

    //Kreiram Subject koji će obavjestiti "ObradaComponent" da su potvrđeni ili osnovni ili zdravstveni podatci
    potvrdeniPodatci = new Subject<void>();

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

    //Metoda koja ažurira vrijednost ukupne cijene pregleda u bazi
    azurirajUkupnuCijenuPregleda(
        idObrada: string,
        novaCijena: number,
        tipKorisnik: string,
        usluge: {
            idRecept: number,
            idUputnica: number,
            idBMI: number,
            idUzorak: number
        }){
        return this.http.put<number>(baseUrl + 'shared/azurirajUkupnuCijenuPregleda.php',
        {
            idObrada,
            novaCijena,
            tipKorisnik,
            usluge
        }).pipe(catchError(handleError));
    }

    //Metoda koja stavlja novu vrijednost cijena u BehaviorSubject
    postaviNovuCijenu(
        idObrada: string,
        novaCijena: number,
        tipKorisnik: string,
        usluge: {
            idRecept: number,
            idUputnica: number,
            idBMI: number,
            idUzorak: number
        },
        idPacijent: number){
        //Pretplaćujem se na podatke aktivnog pacijenta
        this.obradaService.getPatientProcessing(tipKorisnik).pipe(
            take(1),
            switchMap(podatci => {
                return this.azurirajUkupnuCijenuPregleda(
                    idObrada,
                    novaCijena,
                    tipKorisnik,
                    usluge).pipe(
                    take(1),
                    tap(konacnaCijenaPregleda => {
                        console.log(konacnaCijenaPregleda);
                        //Ako je pacijent aktivan te se naplaćiva usluga aktivnom pacijentu, emitiram novu vrijednost
                        if(podatci.success !== "false" && +podatci[0].idPacijent === +idPacijent){
                            //Postavljam novu vrijednost cijene
                            this.cijeneSubject.next(konacnaCijenaPregleda);
                        }
                    })
                );
            })
        ).subscribe();
    }

    //Metoda koja će emitirati novu vrijednost Subjectom
    emitirajNoviIznosPregleda(noviIznos: number){
        this.cijeneSubject.next(noviIznos);
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
        //Stavljam novo stanje polja ID-eva pacijenata kojima je dodana povijest bolesti kada pacijent nije aktivan u LS
        localStorage.setItem("pacijentiIDs",JSON.stringify([...this.pacijentiIDs]));
    }

    //Metoda koja dohvaća dopunsko osiguranje za zadani ID pacijenta
    getDopunsko(idPacijent: number){
        const params = `?idPacijent=${idPacijent.toString()}`;
        return this.http.get<string>(baseUrl + 'getDopunsko.php' + params).pipe(catchError(handleError));
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
