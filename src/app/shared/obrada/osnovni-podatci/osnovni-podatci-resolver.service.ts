import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';
import { HeaderService } from '../../header/header.service';
import { OsnovniPodatciService } from './osnovni-podatci.service';
@Injectable({
    providedIn: 'root'
})
export class OsnovniPodatciResolverService implements Resolve<Pacijent | any>{

    constructor(
        //Dohvaćam servis osnovnih podataka pacijenta
        private osnovniPodatciService: OsnovniPodatciService,
        //Dohvaćam header servis
        private headerService: HeaderService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<Pacijent | any> | Promise<Pacijent | any> | Pacijent | any{
        return this.headerService.tipKorisnikaObs.pipe(
            take(1),
            switchMap(tipKorisnik => {
                //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Pacijent ili any
                return this.osnovniPodatciService.getMainDataPatient(tipKorisnik);
            })
        );
    }
}