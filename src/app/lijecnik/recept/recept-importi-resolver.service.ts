import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {Injectable} from '@angular/core';
import {forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';
import { ReceptImportiService } from './recept-import.service';
import { ImportService } from 'src/app/med-sestra/import.service';
@Injectable({
    providedIn: 'root'
})
export class ReceptImportiResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam importi recept servis
        private receptImportiService: ReceptImportiService,
        //Dohvaćam importi service
        private importService: ImportService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Korisnik 
        return forkJoin([
            this.importService.getDijagnoze(),
            this.receptImportiService.getLijekoviOsnovnaLista(),
            this.receptImportiService.getLijekoviDopunskaLista(),
            this.receptImportiService.getMagistralniPripravciOsnovnaLista(),
            this.receptImportiService.getMagistralniPripravciDopunskaLista()
        ]).pipe(
            map(result => {
                return {
                    dijagnoze: result[0],
                    lijekoviOsnovnaLista: result[1],
                    lijekoviDopunskaLista: result[2],
                    magistralniPripravciOsnovnaLista: result[3],
                    magistralniPripravciDopunskaLista: result[4]
                };    
            })
        );
    }
} 