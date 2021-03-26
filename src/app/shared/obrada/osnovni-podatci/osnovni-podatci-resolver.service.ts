import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { OsnovniPodatciService } from './osnovni-podatci.service';
@Injectable({
    providedIn: 'root'
})
export class OsnovniPodatciResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis osnovnih podataka pacijenta
        private osnovniPodatciService: OsnovniPodatciService,
        //Dohvaćam login servis
        private loginService: LoginService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any{
        return this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Pacijent ili any
                return this.osnovniPodatciService.getMainDataPatient(user.tip);
            })
        );
    }
}