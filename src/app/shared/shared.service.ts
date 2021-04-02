import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
@Injectable({
    providedIn: 'root'
})
export class SharedService {

    //Kreiram Subject koji će napraviti razliku između izdavanja recepta i izdavanja uputnice
    receptIliUputnica = new BehaviorSubject<string>(null);
    //Kreiram Observable od njega
    receptIliUputnicaObs = this.receptIliUputnica.asObservable();
}