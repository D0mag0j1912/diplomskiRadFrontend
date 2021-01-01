import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { LoginService } from '../login/login.service';

@Injectable({
    providedIn: 'root'
})
export class MedSestraGuard{

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
            map(user => {
                //Ako tip prijavljenog korisnika nije "sestra" i pokuša upisati URL koji se tiče medicinske sestre
                if(user.tip != "sestra"){
                    //Isprazni Subject 
                    this.loginService.user.next(null);
                    //Isprazni Session Storage
                    sessionStorage.removeItem('userData');
                    //Vraća ga
                    return this.router.createUrlTree(['/login']);
                }
                else{
                    return true;
                }
            })
        );
    }
}