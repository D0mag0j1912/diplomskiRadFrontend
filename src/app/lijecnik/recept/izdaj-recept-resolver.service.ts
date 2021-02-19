import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {Injectable} from '@angular/core';
import {forkJoin} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import { ReceptImportiService } from './recept-import.service';
import { ImportService } from 'src/app/med-sestra/import.service';
import { ReceptService } from './recept.service';
import { ListaReceptiService } from './lista-recepti/lista-recepti.service';
@Injectable({
    providedIn: 'root'
})
export class IzdajReceptResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam importi recept servis
        private receptImportiService: ReceptImportiService,
        //Dohvaćam importi service
        private importService: ImportService,
        //Dohvaćam servis recepta
        private receptService: ReceptService,
        //Dohvaćam servis liste recepata
        private listaReceptiService: ListaReceptiService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        return forkJoin([
            this.importService.getDijagnoze(),
            this.receptImportiService.getLijekoviOsnovnaLista(),
            this.receptImportiService.getLijekoviDopunskaLista(),
            this.receptImportiService.getMagistralniPripravciOsnovnaLista(),
            this.receptImportiService.getMagistralniPripravciDopunskaLista(),
            this.receptService.getDatumDostatnost("30"),
            this.receptService.getInicijalnoDijagnoze(+route.params['id']),
            this.receptImportiService.getZdravstveniRadnici()
        ]).pipe(
            map(result => {
                return {
                    dijagnoze: result[0],
                    lijekoviOsnovnaLista: result[1],
                    lijekoviDopunskaLista: result[2],
                    magistralniPripravciOsnovnaLista: result[3],
                    magistralniPripravciDopunskaLista: result[4],
                    datum: result[5],
                    inicijalneDijagnoze: result[6],
                    zdravstveniRadnici: result[7]
                };    
            })
        );
    }
} 