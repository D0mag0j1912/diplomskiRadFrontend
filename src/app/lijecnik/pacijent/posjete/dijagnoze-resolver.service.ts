import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
import {Injectable} from '@angular/core';
import { PosjeteService } from './posjete.service';

@Injectable({
    providedIn: 'root'
})
export class DijagnozeResolverService implements Resolve<Dijagnoza[]>{

    constructor(
        //Dohvaćam liječnički servis
        private posjetService: PosjeteService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<Dijagnoza[]> | Promise<Dijagnoza[]> | Dijagnoza[] {
        //Pozivam metodu iz servisa, dohvaćam sve dijagnoze i vraćam polje dijagnoza 
        return this.posjetService.getAllDiagnosis();
    }
}