import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError, switchMap, take } from "rxjs/operators";
import { HeaderService } from "src/app/shared/header/header.service";
import {handleError} from '../../../rxjs-error';
import { PreglediDetailService } from "./pregledi-detail.service";

@Injectable({
    providedIn: 'root'
})
export class PreglediDetailResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis headera
        private headerService: HeaderService,
        //Dohvaćam servis pregleda
        private preglediDetailService: PreglediDetailService
    ){}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): 
            Observable<any> | Promise<any> | any{
        return this.headerService.tipKorisnikaObs.pipe(
            take(1),
            switchMap(tipKorisnik => {
                return this.preglediDetailService.dohvatiCijeliPregled(+route.params['id'],tipKorisnik).pipe(
                    catchError(handleError)
                );
            })
        );
    }
}