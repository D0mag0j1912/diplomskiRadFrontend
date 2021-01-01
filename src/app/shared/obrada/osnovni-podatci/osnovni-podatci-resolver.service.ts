import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';
import { OsnovniPodatciService } from './osnovni-podatci.service';
@Injectable({
    providedIn: 'root'
})
export class OsnovniPodatciResolverService implements Resolve<Pacijent | any>{

    constructor(
        //Dohvaćam servis osnovnih podataka pacijenta
        private osnovniPodatciService: OsnovniPodatciService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<Pacijent | any> | Promise<Pacijent | any> | Pacijent | any{
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Pacijent ili any
        return this.osnovniPodatciService.getMainDataPatient();
    }
}