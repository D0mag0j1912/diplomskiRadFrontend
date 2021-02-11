import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {Injectable} from '@angular/core';
import { ReceptService } from './recept.service';
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
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Korisnik 
        return this.receptService.getInicijalnoAktivanPacijent();
    }
} 