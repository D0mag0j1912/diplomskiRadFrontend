import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { forkJoin, Observable, of } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";
import { LoginService } from "src/app/login/login.service";
import { ObradaService } from "../obrada.service";
import { PreglediListService } from "./pregledi-list/pregledi-list.service";
import { PreglediService } from "./pregledi.service";
@Injectable({
    providedIn: 'root'
})
export class PreglediResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis pregleda
        private preglediService: PreglediService,
        //Dohvaćam servis liste prethodnih pregleda
        private preglediListService: PreglediListService,
        //Dohvaćam login servis
        private loginService: LoginService
    ){}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any{
        return this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                return this.obradaService.getPatientProcessing(user.tip).pipe(
                    take(1),
                    switchMap(podatci => {
                        //Ako JE pacijent aktivan u obradi
                        if(podatci["success"] !== "false"){
                            return forkJoin([
                                this.preglediListService.dohvatiSvePreglede(user.tip,+podatci[0].idPacijent),
                                this.preglediService.getNajnovijiDatum(user.tip,+podatci[0].idPacijent)
                            ]).pipe(
                                map(podatci => {
                                    return {
                                        pregledi: podatci[0],
                                        najnovijiDatum: podatci[1],
                                        tipKorisnik: user.tip
                                    };
                                })
                            );
                        }
                        //Ako pacijent NIJE aktivan u obradi
                        else{
                            return of(null);
                        }
                    })
                );
            })
        );
    }
}
