import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { ImportService } from '../shared/import.service';
import { MedSestraService } from './med-sestra.service';

@Injectable({
    providedIn: 'root'
})
export class MedSestraResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis medicinske sestre
        private medSestraService: MedSestraService,
        //Dohvaćam servis importa
        private importService: ImportService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa any 
        return forkJoin([
            this.medSestraService.getPersonalData(),
            this.importService.getSpecijalizacije()
        ]);
    }
}