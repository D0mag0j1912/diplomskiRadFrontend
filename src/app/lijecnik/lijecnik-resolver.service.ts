import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Korisnik } from '../shared/modeli/korisnik.model';
import { LijecnikService } from './lijecnik.service';

@Injectable({
    providedIn: 'root'
})
export class LijecnikResolverService implements Resolve<Korisnik>{

    constructor(
        //Dohvaćam liječnički servis
        private lijecnikService: LijecnikService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<Korisnik> | Promise<Korisnik> | Korisnik {
        //Pozivam metodu iz servisa i vraćam podatke tipa Korisnik 
        return this.lijecnikService.getPersonalData();
    }
}