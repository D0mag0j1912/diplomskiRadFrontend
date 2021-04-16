import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { ImportService } from "../shared/import.service";

@Injectable({
    providedIn: 'root'
})
export class SignupResolverService implements Resolve<any> {
    constructor(
        private importService: ImportService
    ){}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
        Observable<any> | Promise<any> | any {
        return this.importService.getZdravstveniRadnici();
    }
}
