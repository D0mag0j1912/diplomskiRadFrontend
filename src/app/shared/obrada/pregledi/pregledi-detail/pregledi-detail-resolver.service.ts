import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError, switchMap, take } from "rxjs/operators";
import { LoginService } from "src/app/login/login.service";
import {handleError} from '../../../rxjs-error';
import { PreglediDetailService } from "./pregledi-detail.service";

@Injectable({
    providedIn: 'root'
})
export class PreglediDetailResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam login servis
        private loginService: LoginService,
        //Dohvaćam servis pregleda
        private preglediDetailService: PreglediDetailService
    ){}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): 
            Observable<any> | Promise<any> | any{
        return this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                return this.preglediDetailService.dohvatiCijeliPregled(+route.params['id'],user.tip).pipe(
                    catchError(handleError)
                );
            })
        );
    }
}