import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Pacijent } from '../shared/modeli/pacijent.model';
import { LijecnikService } from './lijecnik.service';

@Injectable({
    providedIn: 'root'
})
export class LijecnikDohvatiPacijentaResolverService implements Resolve<Pacijent>{

    constructor(
        //Dohvaćam liječnički servis
        private lijecnikService: LijecnikService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<Pacijent> | Promise<Pacijent> | Pacijent {
        //Pozivam metodu iz servisa, dohvaćam ID pacijenta iz URL-a te se pretplaćujem na dohvaćene podatke 
        return this.lijecnikService.getPatientData(+route.paramMap.get('id'));
    }
}