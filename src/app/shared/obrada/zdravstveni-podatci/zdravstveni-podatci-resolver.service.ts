import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ZdravstveniPodatciService } from './zdravstveni-podatci.service';
import { ZdravstveniPodatci } from 'src/app/shared/modeli/zdravstveniPodatci.model';
@Injectable({
    providedIn: 'root'
})
export class ZdravstveniPodatciResolverService implements Resolve<ZdravstveniPodatci | any>{

    constructor(
        //Dohvaćam servis zdravstvenih podataka
        private zdravstveniPodatciService: ZdravstveniPodatciService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<ZdravstveniPodatci | any> | Promise<ZdravstveniPodatci | any> | ZdravstveniPodatci | any{
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa ZdravstveniPodatci ili any
        return this.zdravstveniPodatciService.getHealthDataPatient();
    }
}