import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import {Injectable} from '@angular/core';
import { ReceptService } from './recept.service';
import { map } from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class ReceptResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis recepta
        private receptService: ReceptService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Korisnik 
        return forkJoin([
            this.receptService.getInicijalnoAktivanPacijent(),
            this.receptService.getInicijalniRecepti()
        ]).pipe(
            map(result => {
                return {
                    pacijenti: result[0],
                    recepti: result[1]
                };
            })
        );
    }
} 