import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { forkJoin, Observable } from "rxjs";
import { NalaziDetailService } from "./nalazi-detail.service";

@Injectable({
    providedIn: 'root'
})
export class NalaziDetailResolverService implements Resolve<any>{

    constructor(private nalaziDetailService: NalaziDetailService){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): 
        Observable<any> | Promise<any> | any {
        return forkJoin([
            this.nalaziDetailService.getNalaz(+route.params['id']),
            this.nalaziDetailService.getSekundarneDijagnoze(+route.params['id'])
        ]);
    }
}