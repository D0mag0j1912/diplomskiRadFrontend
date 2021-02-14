import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import {Injectable} from '@angular/core';
import { ReceptService } from './recept.service';
import { map } from 'rxjs/operators';
import { ListaReceptiService } from './lista-recepti/lista-recepti.service';
@Injectable({
    providedIn: 'root'
})
export class ReceptResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis recepta
        private receptService: ReceptService,
        //Dohvaćam servis liste recepata
        private listaReceptiService: ListaReceptiService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Korisnik 
        return forkJoin([
            this.receptService.getInicijalnoAktivanPacijent(),
            this.listaReceptiService.getInicijalniRecepti()
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