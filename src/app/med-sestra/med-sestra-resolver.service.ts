import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Korisnik } from '../shared/modeli/korisnik.model';
import { MedSestraService } from './med-sestra.service';

@Injectable({
    providedIn: 'root'
})
export class MedSestraResolverService implements Resolve<Korisnik>{

    constructor(
        //Dohvaćam servis medicinske sestre
        private medSestraService: MedSestraService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<Korisnik> | Promise<Korisnik> | Korisnik {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Korisnik 
        return this.medSestraService.getPersonalData();
    }
}