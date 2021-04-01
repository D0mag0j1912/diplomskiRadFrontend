import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { ImportService } from '../shared/import.service';
import { LijecnikService } from './lijecnik.service';

@Injectable({
    providedIn: 'root'
})
export class LijecnikResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam liječnički servis
        private lijecnikService: LijecnikService,
        //Dohvaćam import servis
        private importService: ImportService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        //Pozivam metodu iz servisa i vraćam podatke tipa any 
        return forkJoin([
            this.lijecnikService.getPersonalData(),
            this.importService.getSpecijalizacije()
        ]);
    }
}