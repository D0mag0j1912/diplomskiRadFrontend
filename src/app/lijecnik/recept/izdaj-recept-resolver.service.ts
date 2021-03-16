import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {Injectable} from '@angular/core';
import {forkJoin} from 'rxjs';
import {map, switchMap, take, tap} from 'rxjs/operators';
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
        return this.listaReceptiService.editMessengerObs.pipe(
            take(1),
            switchMap(recept => {
                //Ako je recept null, to znači da sam došao dodavde iz buttona "Izdaj recept"
                if(!recept){
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
                //Ako recept ima neke podatke, to znači da sam došao dodavde preko buttona "Ažuriraj recept"
                else{
                    return forkJoin([
                        this.importService.getDijagnoze(),
                        this.receptImportiService.getLijekoviOsnovnaLista(),
                        this.receptImportiService.getLijekoviDopunskaLista(),
                        this.receptImportiService.getMagistralniPripravciOsnovnaLista(),
                        this.receptImportiService.getMagistralniPripravciDopunskaLista(),
                        this.receptService.getDatumDostatnost("30"),
                        this.receptImportiService.getZdravstveniRadnici(),
                        this.receptService.getRecept(recept)
                    ]).pipe(
                        map(result => {
                            return {
                                dijagnoze: result[0],
                                lijekoviOsnovnaLista: result[1],
                                lijekoviDopunskaLista: result[2],
                                magistralniPripravciOsnovnaLista: result[3],
                                magistralniPripravciDopunskaLista: result[4],
                                datum: result[5],
                                zdravstveniRadnici: result[6],
                                recept: result[7]
                            };    
                        })
                    );
                }
            })
        );
    }
} 