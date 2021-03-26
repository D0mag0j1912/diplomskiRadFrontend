import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CekaonicaService } from './cekaonica.service';
import { switchMap, take } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
@Injectable({
    providedIn: 'root'
})
export class CekaonicaResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis čekaonice
        private cekaonicaService: CekaonicaService,
        //Dohvaćam login servis
        private loginService: LoginService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        return this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                return this.cekaonicaService.getPatientsWaitingRoom(user.tip);      
            })
        );
    }
}