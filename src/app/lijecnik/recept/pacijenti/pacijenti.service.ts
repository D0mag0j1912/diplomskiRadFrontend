import { HttpParams, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PacijentiService {

    //Kreiram varijablu koja pohranjuje baseUrl
    baseUrl: string = "http://localhost:8080/angularPHP/";
    //Definiram Subject pomoću kojega ću prenijeti ID-ove pacijenata s desne u lijevu tablicu
    prijenosnikUTablicuPacijenata = new Subject<string[]>();
    //Kreriram Observable od njega
    prijenosnikUTablicuPacijenataObs = this.prijenosnikUTablicuPacijenata.asObservable();
    
    constructor(private http: HttpClient) { }

    //Metoda koja vraća Observable sa svim pacijentima čiji se recepti nalaze u listi trenutno
    getPacijenti(ids: string[]){
        let params = new HttpParams().append("ids",JSON.stringify(ids));
        return this.http.get<any>(this.baseUrl + 'recept/pacijenti/getPacijenti.php',{params: params}) 
            .pipe(catchError(this.handleError));
    }

    //Metoda koja vraća Observable sa svim pacijentima za prikaz u tablici
    getInicijalnoAktivanPacijent(){

        return this.http.get<any>(this.baseUrl + 'recept/pacijenti/getInicijalnoAktivanPacijent.php').pipe(
            catchError(this.handleError)
        );
    }

    //Metoda koja vraća Observable u kojemu se nalaze svi pacijenti koji odgovaraju pretrazi
    getPacijentiPretraga(value: string){
        let params = new HttpParams().append("pretraga",value);
        return this.http.get<any>(this.baseUrl + 'recept/pacijenti/getPacijentiPretraga.php',{params: params}).pipe(catchError(this.handleError));
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
