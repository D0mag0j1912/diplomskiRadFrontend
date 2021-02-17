import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { MedSestraService } from './med-sestra.service';

@Injectable({
    providedIn: 'root'
})
export class MedSestraResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis medicinske sestre
        private medSestraService: MedSestraService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa any 
        return this.medSestraService.getPersonalData();
    }
}