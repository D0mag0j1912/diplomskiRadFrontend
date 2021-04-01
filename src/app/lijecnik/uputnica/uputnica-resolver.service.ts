import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { forkJoin, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ImportService } from "src/app/shared/import.service";

@Injectable({
    providedIn: 'root'
})
export class UputnicaResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis importa
        private importService: ImportService
    ){}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
        Observable<any> | Promise<any> | any {
        return forkJoin([
            this.importService.getDijagnoze(),
            this.importService.getZdravstveneUstanove(),
            this.importService.getPacijenti(),
            this.importService.getZdravstveneDjelatnosti()
        ]).pipe(
            map(importi => {
                return {
                    dijagnoze: importi[0],
                    zdravstveneUstanove: importi[1],
                    pacijenti: importi[2],
                    zdravstveneDjelatnosti: importi[3]
                };
            })
        );
    }
}