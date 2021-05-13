import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, take} from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { MedSestraService } from 'src/app/med-sestra/med-sestra.service';
import { ObradaService } from './obrada.service';
@Injectable({
    providedIn: 'root'
})
export class ObradaResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis medicinske sestre
        private medSestraService: MedSestraService,
        //Dohvaćam login servis
        private loginService: LoginService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        //Pozivam metodu iz servisa, pretplaćujem se i vraćam podatke tipa Obrada ili any
        return this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                console.log(user);
                //Ako je tip korisnika "lijecnik":
                if(user.tip === "lijecnik"){
                    //Vraćam samo podatke trenutno aktivnog pacijenta
                    return forkJoin([
                        this.obradaService.getPatientProcessing(user.tip),
                        this.obradaService.getSljedeciPacijent(user.tip),
                        this.obradaService.getVrijemeNarudzbe(user.tip),
                        of(user.tip)
                    ]).pipe(
                        map(result => {
                            return {
                                obrada: result[0],
                                sljedeciPacijent: result[1],
                                vrijemeNarudzbe: result[2],
                                tip: result[3]
                            };
                        })
                    );
                }
                //Ako je tip korisnika "sestra":
                else if(user.tip === "sestra"){
                    //Vraćam podatke trenutno aktivnog pacijenta i zdravstvene podatke zbog općih podataka pregleda
                    return forkJoin([
                        this.obradaService.getPatientProcessing(user.tip),
                        this.medSestraService.getHealthData(user.tip),
                        this.obradaService.getSljedeciPacijent(user.tip),
                        this.obradaService.getVrijemeNarudzbe(user.tip),
                        of(user.tip)
                    ]).pipe(
                        map(result => {
                            return {
                                obrada: result[0],
                                zdravstveniPodatci: result[1],
                                sljedeciPacijent: result[2],
                                vrijemeNarudzbe: result[3],
                                tip: result[4]
                            };
                        })
                    );
                }
            })
        );
    }
}
