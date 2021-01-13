import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ZdravstveniPodatciService } from './zdravstveni-podatci.service';
import { ZdravstveniPodatci } from 'src/app/shared/modeli/zdravstveniPodatci.model';
import { HeaderService } from '../../header/header.service';
import { switchMap, take } from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class ZdravstveniPodatciResolverService implements Resolve<ZdravstveniPodatci | any>{

    constructor(
        //Dohvaćam servis zdravstvenih podataka
        private zdravstveniPodatciService: ZdravstveniPodatciService,
        //Dohvaćam header servis
        private headerService: HeaderService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<ZdravstveniPodatci | any> | Promise<ZdravstveniPodatci | any> | ZdravstveniPodatci | any{
        return this.headerService.tipKorisnikaObs.pipe(
            take(1),
            switchMap(tipKorisnik => {
                //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa ZdravstveniPodatci ili any
                return this.zdravstveniPodatciService.getHealthDataPatient(tipKorisnik);
            })
        );
    }
}