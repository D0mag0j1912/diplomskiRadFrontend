import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {Injectable} from '@angular/core';
import {forkJoin} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import { ImportService } from 'src/app/shared/import.service';
import { ReceptService } from './recept.service';
import { ListaReceptiService } from './lista-recepti/lista-recepti.service';
import { SharedService } from 'src/app/shared/shared.service';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
@Injectable({
    providedIn: 'root'
})
export class IzdajReceptResolverService implements Resolve<any>{

    constructor(
        //Dohvaćam importi service
        private importService: ImportService,
        //Dohvaćam servis recepta
        private receptService: ReceptService,
        //Dohvaćam servis liste recepata
        private listaReceptiService: ListaReceptiService,
        //Dohvaćam shared servis
        private sharedService: SharedService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService
    ){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
            Observable<any> | Promise<any> | any {
        return this.listaReceptiService.editMessengerObs.pipe(
            take(1),
            switchMap(recept => {
                //Ako je recept null, to znači da sam došao dodavde iz buttona "Izdaj recept"
                if(!recept){
                    //Pretplaćivam se podatak JE LI pacijent AKTIVAN ili NIJE
                    return this.obradaService.getPatientProcessing('lijecnik').pipe(
                        switchMap(podatci => {
                            //Ako je pacijent AKTIVAN
                            if(podatci.success !== "false"){
                                return forkJoin([
                                    this.importService.getDijagnoze(),
                                    this.importService.getLijekoviOsnovnaLista(),
                                    this.importService.getLijekoviDopunskaLista(),
                                    this.importService.getMagistralniPripravciOsnovnaLista(),
                                    this.importService.getMagistralniPripravciDopunskaLista(),
                                    this.receptService.getDatumDostatnost("30"),
                                    this.receptService.getInicijalnoDijagnoze(+route.params['id'],+JSON.parse(localStorage.getItem("idObrada"))),
                                    this.importService.getZdravstveniRadnici()
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
                            //Ako pacijent NIJE AKTIVAN
                            else{
                                return this.sharedService.getRandomIDObrada(+route.params['id']).pipe(
                                    switchMap(idObrada => {
                                        return forkJoin([
                                            this.importService.getDijagnoze(),
                                            this.importService.getLijekoviOsnovnaLista(),
                                            this.importService.getLijekoviDopunskaLista(),
                                            this.importService.getMagistralniPripravciOsnovnaLista(),
                                            this.importService.getMagistralniPripravciDopunskaLista(),
                                            this.receptService.getDatumDostatnost("30"),
                                            this.receptService.getInicijalnoDijagnoze(+route.params['id'],+idObrada),
                                            this.importService.getZdravstveniRadnici()
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
                                    })
                                );
                            }
                        })
                    );
                }
                //Ako recept ima neke podatke, to znači da sam došao dodavde preko buttona "Ažuriraj recept"
                else{
                    return forkJoin([
                        this.importService.getDijagnoze(),
                        this.importService.getLijekoviOsnovnaLista(),
                        this.importService.getLijekoviDopunskaLista(),
                        this.importService.getMagistralniPripravciOsnovnaLista(),
                        this.importService.getMagistralniPripravciDopunskaLista(),
                        this.receptService.getDatumDostatnost("30"),
                        this.importService.getZdravstveniRadnici(),
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