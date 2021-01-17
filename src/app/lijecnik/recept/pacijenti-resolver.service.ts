import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { ReceptService } from "./recept.service";

@Injectable({
    providedIn: 'root'
})
export class PacijentiResolverService implements Resolve<any>{
    constructor(
        //Dohvaćam servis recepta
        private receptService: ReceptService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        //Vrati sve registrirane pacijente
        return this.receptService.getAllPatients();
    }
}