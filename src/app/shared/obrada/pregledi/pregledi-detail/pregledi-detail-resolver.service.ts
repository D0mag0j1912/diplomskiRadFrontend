import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError, switchMap, take } from "rxjs/operators";
import { HeaderService } from "src/app/shared/header/header.service";
import { PreglediService } from "../pregledi.service";
import {handleError} from '../../../rxjs-error';

@Injectable({
    providedIn: 'root'
})
export class PreglediDetailResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis headera
        private headerService: HeaderService,
        //Dohvaćam servis pregleda
        private preglediService: PreglediService
    ){}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): 
            Observable<any> | Promise<any> | any{
        return this.headerService.tipKorisnikaObs.pipe(
            take(1),
            switchMap(tipKorisnik => {
                return this.preglediService.dohvatiCijeliPregled(+route.params['id'],tipKorisnik).pipe(
                    catchError(handleError)
                );
            })
        );
    }
}