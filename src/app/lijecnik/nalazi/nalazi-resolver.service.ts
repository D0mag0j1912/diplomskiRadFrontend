import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { switchMap, take } from "rxjs/operators";
import { LoginService } from "src/app/login/login.service";
import { ObradaService } from "src/app/shared/obrada/obrada.service";

@Injectable({
    providedIn: 'root'
})
export class NalaziResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis logina
        private loginService: LoginService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService
    ){}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any{
        return this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                return this.obradaService.getPatientProcessing(user.tip);
            })
        );
    }
}
