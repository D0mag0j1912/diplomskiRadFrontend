import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { forkJoin, Observable, of } from "rxjs";
import { switchMap, take, tap } from "rxjs/operators";
import { NarucivanjeService } from "src/app/med-sestra/narucivanje/narucivanje.service";
import { HeaderService } from "../../header/header.service";
import { ObradaService } from "../obrada.service";
import { PreglediService } from "./pregledi.service";
@Injectable({
    providedIn: 'root'
})
export class PreglediResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam servis naručivanja zbog današnjeg datuma
        private narucivanjeService: NarucivanjeService,
        //Dohvaćam servis headera
        private headerService: HeaderService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis pregleda
        private preglediService: PreglediService
    ){}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): 
            Observable<any> | Promise<any> | any{
        return this.headerService.tipKorisnikaObs.pipe(
            take(1),
            switchMap(tipKorisnik => {
                console.log(tipKorisnik);
                return forkJoin([
                    this.obradaService.getPatientProcessing(tipKorisnik),
                    this.narucivanjeService.dohvatiDanasnjiDatum()
                ]).pipe(
                    take(1),
                    switchMap(podatci => {
                        //Ako JE pacijent aktivan u obradi
                        if(podatci[0]["success"] !== "false"){
                            return forkJoin([
                                this.preglediService.dohvatiSvePreglede(tipKorisnik,+podatci[0][0].idPacijent,podatci[1]),
                                this.narucivanjeService.dohvatiDanasnjiDatum()
                            ]);
                        }
                        //Ako pacijent NIJE aktivan u obradi
                        else{
                            return of(null);
                        }
                    })
                );
            })
        );
    }
}