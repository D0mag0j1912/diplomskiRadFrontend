import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Obrada } from 'src/app/shared/modeli/obrada.model';
import { ObradaService } from './obrada.service';
@Injectable({
    providedIn: 'root'
})
export class ObradaResolverService implements Resolve<Obrada | any>{

    constructor(
        //Dohvaćam servis obrade
        private obradaService: ObradaService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<Obrada | any> | Promise<Obrada | any> | Obrada | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Obrada ili any
        return this.obradaService.getPatientProcessing();
    }
}