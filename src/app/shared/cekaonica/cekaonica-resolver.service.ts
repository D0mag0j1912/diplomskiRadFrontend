import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CekaonicaService } from './cekaonica.service';
import { HeaderService } from '../header/header.service';
import { switchMap, take } from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class CekaonicaResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis čekaonice
        private cekaonicaService: CekaonicaService,
        //Dohvaćam servis headera
        private headerService: HeaderService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        return this.headerService.tipKorisnikaObs.pipe(
            take(1),
            switchMap(tipKorisnik => {
                return this.cekaonicaService.getPatientsWaitingRoom(tipKorisnik);      
            })
        );
    }
}