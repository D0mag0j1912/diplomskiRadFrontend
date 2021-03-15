import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, of, Subject } from 'rxjs';
import { mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';
import { HeaderService } from 'src/app/shared/header/header.service';
import { PregledList } from 'src/app/shared/modeli/pregledList.model';
import { ObradaService } from '../../obrada.service';
import { PreglediService } from '../pregledi.service';
import { PreglediListService } from './pregledi-list.service';

@Component({
  selector: 'app-pregledi-list',
  templateUrl: './pregledi-list.component.html',
  styleUrls: ['./pregledi-list.component.css']
})
export class PreglediListComponent implements OnInit, OnDestroy{

    //Kreiram Subject pomoću kojega izlazim iz pretplata
    pretplate = new Subject<boolean>();
    //Primam pregleda za listu od roditelja
    @Input() pregledi: PregledList[];
    //Spremam sve inicijalne preglede u pomoćno polje
    preglediPom: PregledList[] = [];
    //Šaljem datum roditeljskoj komponenti da ga postavi u filter
    @Output() datum = new EventEmitter<Date>();

    constructor(
        //Dohvaćam servis prethodnih pregleda
        private preglediService: PreglediService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis headera
        private headerService: HeaderService,
        //Dohvaćam router
        private router: Router,
        //Dohvaćam servis liste prethodnih pregleda
        private preglediListService: PreglediListService,
        //Dohvaćam trenutni route
        private route: ActivatedRoute
    ) { }

    //Ova metoda se poziva kada se komponenta incicijalizira
    ngOnInit(){
        //Prolazim kroz sve inicijalne preglede
        for(const pregled of this.pregledi){
            //Dodavam svaki pregled u pomoćno polje da ih kasnije mogu vratiti na template
            this.preglediPom.push(pregled);
        }
        //Pretplaćujem se na trenutni tip logiranog korisnika
        this.headerService.tipKorisnikaObs.pipe(
            switchMap(tipKorisnik => {
                //Pretplaćujem se na podatke aktivnog pacijenta
                return this.obradaService.getPatientProcessing(tipKorisnik).pipe(
                    switchMap(podatci => {
                        //Ako je pacijent AKTIVAN
                        if(podatci["success"] !== "false"){
                            //Pretplaćujem se na promjene u filteru datuma i ažuriram template shodno tome
                            return this.preglediService.dateChangedObs.pipe(
                                switchMap(datum => {
                                    //Ako je liječnik promijenio vrijednost datuma
                                    if(datum){
                                        //Dohvaćam sve pregleda za promijenjeni datum
                                        return this.preglediListService.dohvatiPregledePoDatumu(tipKorisnik,+podatci[0].idPacijent,datum).pipe(
                                            mergeMap(pregledi => {
                                                //Ako aktivni pacijent IMA evidentiranih pregleda za taj datum
                                                if(pregledi !== null){
                                                    //Praznim polje pregleda 
                                                    this.pregledi = [];
                                                    let objektPregled;
                                                    //Prolazim kroz sve preglede u odgovoru servera
                                                    for(const pregled of pregledi){
                                                        //Za svaki odgovor servera, kreiram svoj objekt
                                                        objektPregled = new PregledList(pregled);
                                                        //Dodavam ga u polje koje ažurira template
                                                        this.pregledi.push(objektPregled);
                                                    }
                                                    return this.preglediListService.getNajnovijiIDPregledZaDatum(tipKorisnik,+podatci[0].idPacijent,datum).pipe(
                                                        tap(idPregled => {
                                                            //Ako pacijent IMA evidentiranih pregleda za PROMIJENJENI DATUM U FILTERU
                                                            if(idPregled !== null){
                                                                //Preusmjeravam se na detail stranicu sa ID-em najnovijeg pregleda za promijenjeni datum
                                                                this.router.navigate(['./',idPregled],{relativeTo: this.route});
                                                            }
                                                        }),
                                                        takeUntil(this.pretplate) 
                                                    );
                                                }
                                                //Ako aktivni pacijent NEMA evidentiranih pregleda za taj datum
                                                else{
                                                    //Emitiram Subjectom vrijednost "true" da ukažem roditeljskoj komponenti da ovaj pacijent NEMA pregleda za promijenjeni datum
                                                    this.preglediService.nemaPregledaPoDatumu.next(true);
                                                    return of(null).pipe(
                                                        takeUntil(this.pretplate)
                                                    );
                                                }
                                            }),
                                            takeUntil(this.pretplate)
                                        );
                                    }
                                    //Ako liječnik NIJE promijenio vrijednost datuma
                                    else{
                                        return of(null).pipe(
                                            takeUntil(this.pretplate)
                                        );
                                    } 
                                })
                            );
                        }
                        //Ako pacijent NIJE AKTIVAN
                        else{
                            return of(null).pipe(
                                takeUntil(this.pretplate)
                            );
                        }
                    }),
                    takeUntil(this.pretplate)
                );
            })
        ).subscribe();
    }
    //Kada se klikne element liste (određeni pregled)
    onClickPregled(pregled: PregledList){
        //Emitiraj vrijednost datuma stisnutog pregleda prema roditelju
        this.datum.emit(pregled.datum);
    }

    //Metoda koja se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplate.next(true);
        this.pretplate.complete();
    }

}
