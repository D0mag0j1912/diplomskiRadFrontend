import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { MedSestraService } from 'src/app/med-sestra/med-sestra.service';
import { Obrada } from 'src/app/shared/modeli/obrada.model';
import { ObradaService } from './obrada.service';
@Injectable({
    providedIn: 'root'
})
export class ObradaResolverService implements Resolve<Obrada | any>{

    constructor(
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis medicinske sestre
        private medSestraService: MedSestraService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<Obrada | any> | Promise<Obrada | any> | Obrada | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Obrada ili any
        return forkJoin([
            this.obradaService.getPatientProcessing(),
            this.medSestraService.getHealthData()
        ]).pipe(
            map(result => {
                return {
                    pacijent: result[0],
                    podatci: result[1]
                };    
            })    
        );
    }
}