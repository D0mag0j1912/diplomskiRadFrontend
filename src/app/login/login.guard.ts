import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';
import {map, take} from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate{

    constructor(
        private loginService: LoginService,
        private router: Router
    ){
    }

    canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot)
    : boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> | UrlTree{

        //Gledam je li korisnik prijavljen ili nije po Subjectu. Ako nije null, korisnik je prijavljen
        //Ovo je Observable tako da mogu koristiti ove operatore 
        return this.loginService.user.pipe(
            //Ovo implementiram da samo uzmem zadnju vrijednost korisnika i izađem iz pretplate
            take(1),
            map(user => {
            //Ulazim u Observable i gledam je li postoji prijavljeni korisnik 
            const isAuth = user ? true: false;
            //Ako postoji prijavljeni korisnik, vraćam true
            if(isAuth){
                return true;
            }
            //Ako ne postoji prijavljeni korisnik, preumsmjeravam ga na login stranicu
            return this.router.createUrlTree(['/login']);
        //Ako korisnik nije prijavljen, a pokušava ući na /<route>, vrati ga na login stranicu   
        })
        /*tap(isAuth => {
            //Ako nema prijavljenog korisnika
            if(!isAuth){
                this.router.navigate(['/login']);
            }
        })*/);
    }   
}