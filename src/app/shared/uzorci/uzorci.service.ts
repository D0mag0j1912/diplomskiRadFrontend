import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {handleError} from '../rxjs-error';
import {baseUrl} from '../../backend-path';
import { catchError } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class UzorciService {
    constructor(private http: HttpClient){}

    //Metoda koja vraća Observable sa svim slučajno generiranim vrijednostima uzoraka
    getUzorci(){
        return this.http.get<any>(baseUrl + 'uzorci/generirajSlucajneUzorke.php').pipe(catchError(handleError));
    }
}
