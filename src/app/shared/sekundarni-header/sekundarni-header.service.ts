import { Injectable } from "@angular/core";
import {handleError} from '../rxjs-error';
import {baseUrl} from '../../backend-path';
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SekundarniHeaderService{

    //Kreiram Subject koji će obavjestiti "PreglediComponent" da je kliknut button "Pregledi"
    kliknutHeader = new Subject<boolean>();
    kliknutHeaderObs = this.kliknutHeader.asObservable();
    
    constructor(
        private http: HttpClient
    ){}
}