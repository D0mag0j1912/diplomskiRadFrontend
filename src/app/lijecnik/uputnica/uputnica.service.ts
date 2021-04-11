import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import {baseUrl} from '../../backend-path';
import {handleError} from '../../shared/rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class UputnicaService {

    constructor(private http: HttpClient){}

    //Metoda za dohvaćanje uputnica
    getUputnice(){
        return this.http.get<any>(baseUrl + 'uputnica/getUputnice.php').pipe(catchError(handleError));
    }
}
