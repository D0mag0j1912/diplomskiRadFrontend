import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {Injectable} from '@angular/core';
import { ImportService } from './import.service';
import {forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class ImportiResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis importa
        private importService: ImportService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Korisnik 
        return forkJoin([
            this.importService.getPodrucniUred(),
            this.importService.getKategorijaOsiguranja(),
            this.importService.getDijagnoze(),
            this.importService.getDrzavaOsiguranja(),
            this.importService.getParticipacija()
        ]).pipe(
            map(result => {
                return {
                    uredi: result[0],
                    kategorijeOsiguranja: result[1],
                    dijagnoze: result[2],
                    drzave: result[3],
                    participacije: result[4]
                };    
            })
        );
    }
} 