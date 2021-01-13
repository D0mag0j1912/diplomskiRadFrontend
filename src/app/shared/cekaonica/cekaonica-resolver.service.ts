import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CekaonicaService } from './cekaonica.service';
import { Cekaonica } from '../modeli/cekaonica.model';
import { HeaderService } from '../header/header.service';
import { switchMap, take } from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class CekaonicaResolverService implements Resolve<Cekaonica[] | any>{

    constructor(
        //Dohvaćam servis čekaonice
        private cekaonicaService: CekaonicaService,
        //Dohvaćam servis headera
        private headerService: HeaderService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<Cekaonica[] | any> | Promise<Cekaonica[] | any> | Cekaonica[] | any {
        return this.cekaonicaService.getPatientsWaitingRoom();
    }
}