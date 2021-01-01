import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CekaonicaService } from './cekaonica.service';
import { Cekaonica } from '../modeli/cekaonica.model';
@Injectable({
    providedIn: 'root'
})
export class CekaonicaResolverService implements Resolve<Cekaonica[] | any>{

    constructor(
        //Dohvaćam servis čekaonice
        private cekaonicaService: CekaonicaService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<Cekaonica[] | any> | Promise<Cekaonica[] | any> | Cekaonica[] | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Korisnik 
        return this.cekaonicaService.getPatientsWaitingRoom();
    }
}