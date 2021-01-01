import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../login/login.service';

@Injectable({
    providedIn: 'root'
})
export class WildCardGuard{

    constructor(
        //Dohvaćam login servis
        private loginService: LoginService,
        //Dohvaćam router
        private router: Router
    ){}

    canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot)
    : boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> | UrlTree{
        //Isprazni Subject 
        this.loginService.user.next(null);
        //Isprazni Session Storage
        sessionStorage.removeItem('userData');
        //Vraća ga
        return this.router.createUrlTree(['/login']);
    }
}