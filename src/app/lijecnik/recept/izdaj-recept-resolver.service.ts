import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {Injectable} from '@angular/core';
import {forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';
import { ReceptImportiService } from './recept-import.service';
import { ImportService } from 'src/app/med-sestra/import.service';
import { ReceptService } from './recept.service';
@Injectable({
    providedIn: 'root'
})
export class IzdajReceptResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam importi recept servis
        private receptImportiService: ReceptImportiService,
        //Dohvaćam importi service
        private importService: ImportService,
        //Dohvaćam servis recepta
        private receptService: ReceptService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Korisnik 
        return forkJoin([
            this.importService.getDijagnoze(),
            this.receptImportiService.getLijekoviOsnovnaLista(),
            this.receptImportiService.getLijekoviDopunskaLista(),
            this.receptImportiService.getMagistralniPripravciOsnovnaLista(),
            this.receptImportiService.getMagistralniPripravciDopunskaLista(),
            this.receptService.getDatumDostatnost("30"),
            this.receptService.getInicijalnoDijagnoze(+route.params['id'])
        ]).pipe(
            map(result => {
                return {
                    dijagnoze: result[0],
                    lijekoviOsnovnaLista: result[1],
                    lijekoviDopunskaLista: result[2],
                    magistralniPripravciOsnovnaLista: result[3],
                    magistralniPripravciDopunskaLista: result[4],
                    datum: result[5],
                    inicijalneDijagnoze: result[6]
                };    
            })
        );
    }
} 