import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SekundarniHeaderService{

    //Kreiram Subject koji će obavjestiti "PreglediComponent" da je kliknut button "Pregledi"
    kliknutHeader = new Subject<boolean>();
    kliknutHeaderObs = this.kliknutHeader.asObservable();
    
}