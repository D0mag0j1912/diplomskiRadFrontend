import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Pacijent } from '../../shared/modeli/pacijent.model';
import { PacijentService } from './pacijent.service';

@Injectable({
    providedIn: 'root'
})
export class PacijentResolverService implements Resolve<Pacijent>{

    constructor(
        //Dohvaćam liječnički servis
        private pacijentService: PacijentService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<Pacijent> | Promise<Pacijent> | Pacijent {
        //Pozivam metodu iz servisa, dohvaćam ID pacijenta iz URL-a te se pretplaćujem na dohvaćene podatke 
        return this.pacijentService.getPatientData(+route.paramMap.get('id'));
    }
}