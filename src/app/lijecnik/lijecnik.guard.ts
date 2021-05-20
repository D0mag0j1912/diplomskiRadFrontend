import { Route } from '@angular/compiler/src/core';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import {take, switchMap} from 'rxjs/operators';
import { LoginService } from '../login/login.service';

@Injectable({
    providedIn: 'root'
})
export class LijecnikGuard implements CanActivate, CanLoad{
    constructor(
        //Dohvaćam login servis
        private loginService: LoginService,
        //Dohvaćam router
        private router: Router
    ){}

    canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot)
    : boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> | UrlTree{
        //Ako vrati true, liječnik se prijavio i sve je u redu
        return this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                //Ako tip prijavljenog korisnika nije "lijecnik" i pokuša upisati URL koji se tiče liječnika
                if(user.tip != "lijecnik"){
                    this.loginService.onChangeHeader.next();
                    return this.loginService.logout();
                }
                else{
                    return of(true);
                }
            })
        );
    }
    //Za Lazy Loading
    canLoad(route: Route)
    : boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> | UrlTree{
        //Ako vrati true, liječnik se prijavio i sve je u redu
        return this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                //Ako tip prijavljenog korisnika nije "lijecnik" i pokuša upisati URL koji se tiče liječnika
                if(user.tip != "lijecnik"){
                    this.loginService.onChangeHeader.next();
                    return this.loginService.logout();
                }
                else{
                    return of(true);
                }
            })
        );
    }
}
