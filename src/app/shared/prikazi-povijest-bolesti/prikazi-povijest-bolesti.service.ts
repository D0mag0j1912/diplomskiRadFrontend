import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError } from "rxjs/operators";
import {baseUrl} from '../../backend-path';
import {handleError} from '../rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class PrikaziPovijestBolestiService {

    constructor(
        private http: HttpClient
    ){}

    //Metoda koja dohvaća zadnje dodani ID obrade (random dodani)
    getRandomIDObrada(){
        return this.http.get<string>(baseUrl + 'shared/getRandomIDObrada.php').pipe(
            catchError(handleError)
        );
    }
}