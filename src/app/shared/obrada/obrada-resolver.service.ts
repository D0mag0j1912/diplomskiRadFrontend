import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap, take} from 'rxjs/operators';
import { MedSestraService } from 'src/app/med-sestra/med-sestra.service';
import { Obrada } from 'src/app/shared/modeli/obrada.model';
import { HeaderService } from '../header/header.service';
import { ObradaService } from './obrada.service';
@Injectable({
    providedIn: 'root'
})
export class ObradaResolverService implements Resolve<Obrada | any>{

    constructor(
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis medicinske sestre
        private medSestraService: MedSestraService,
        //Dohvaćam header servis
        private headerService: HeaderService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<Obrada | any> | Promise<Obrada | any> | Obrada | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Obrada ili any
        return this.headerService.tipKorisnikaObs.pipe(
            take(1),
            switchMap(podatci => {
                //Ako je tip korisnika "lijecnik":
                if(podatci === "lijecnik"){
                    //Vraćam samo podatke trenutno aktivnog pacijenta
                    return this.obradaService.getPatientProcessing(podatci);
                }
                //Ako je tip korisnika "sestra":
                else if(podatci === "sestra"){
                    //Vraćam podatke trenutno aktivnog pacijenta i zdravstvene podatke zbog općih podataka pregleda
                    return forkJoin([
                        this.obradaService.getPatientProcessing(podatci),
                        this.medSestraService.getHealthData(podatci)
                    ]).pipe(
                        map(result => {
                            return {
                                pacijent: result[0],
                                podatci: result[1]
                            };    
                        })    
                    );
                }
            })
        );
    }
}