import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {Injectable} from '@angular/core';
import { ImportService } from '../../import.service';
import {forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class OsnovniPodatciImportResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis importa
        private importService: ImportService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Korisnik 
        return forkJoin([
            this.importService.getMjesto(),
            this.importService.getBracnoStanje(),
            this.importService.getRadniStatus(),
            this.importService.getStatusPacijent()
        ]).pipe(
            map(result => {
                return {
                    mjesta: result[0],
                    bracnaStanja: result[1],
                    radniStatusi: result[2],
                    statusiPacijent: result[3]
                };    
            })
        );
    }
} 