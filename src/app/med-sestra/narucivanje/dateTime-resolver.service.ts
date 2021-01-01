import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { NarucivanjeService } from './narucivanje.service';
import {map} from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class DateTimeResolverService implements Resolve<any | any[]>{

    constructor(
        //Dohvaćam servis naručivanja
        private narucivanjeService: NarucivanjeService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any | any[]> | Promise<any | any[]> | any | any[]{
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa any
        return forkJoin([
            this.narucivanjeService.getDatumiNazivi(),
            this.narucivanjeService.getVremena(),
            this.narucivanjeService.getPacijenti(),
            this.narucivanjeService.getRazliciteVrstePregleda(),
            this.narucivanjeService.dohvatiDanasnjiDatum()
        ]).pipe(
            map(result => {
                return {
                    datumiNazivi: result[0],
                    narudzbe: result[1],
                    pacijenti: result[2],
                    razliciteVrstePregleda: result[3],
                    danasnjiDatum: result[4]
                };    
            })
        );
    }
}