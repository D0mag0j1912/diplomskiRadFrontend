import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { PregledList } from '../pregledList.model';
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
    //Primam tip prijavljenog korisnika od "PreglediComponent"
    @Input() prijavljeniKorisnik: string;
    //Šaljem datum roditeljskoj komponenti da ga postavi u filter
    @Output() datum = new EventEmitter<Date>();
    //Šaljem listu pregleda nakon dodavanja novog pregleda u nju roditeljskoj komponenti
    @Output() poljePregleda = new EventEmitter<PregledList[]>();

    constructor(
        //Dohvaćam router
        private router: Router,
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis liste pregleda
        private preglediListService: PreglediListService
    ) {}

    //Ova metoda se poziva kada se komponenta incicijalizira
    ngOnInit(){}

    //Metoda koja se aktivira kada korisnik stisne button "Sljedeći pregled"
    idiNaSljedeciPregled(sljedeciPregled: number,$event: any){
        //Inicijaliziram da nije pronađen pregled inicijalno
        let isInArray: boolean = false;
        //Prolazim kroz sve trenutne preglede u listi pregleda
        for(const pregled of this.pregledi){
            //Ako je liječnik kliknuo "Sljedeći pregled" te se taj pregled NALAZI trenutno u listi pregleda
            if(pregled.idPregled === sljedeciPregled){
                //Vraćam da je u redu
                isInArray = true;
            }
        }
        //Ako nije našao pregled trenutno u listu
        if(!isInArray){
            //Dohvaćam ga
            this.vratiTrazeniDatum(sljedeciPregled).subscribe(
                () => {
                    //Šaljem roditeljskoj komponenti novo stanje pregleda nakon dodavanja
                    this.poljePregleda.emit(this.pregledi);
                }
            );
        }
        //Blokira klik roditeljskog taga (Li-a) i omogućuje klik buttona
        $event.stopPropagation();
        //Preusmjeravam se na sljedeći pregled
        this.router.navigate(['./',sljedeciPregled.toString()],{relativeTo: this.route});
    }

    //Metoda koja se aktivira kada korisnik stisne button "Novi slučaj"
    idiNaPrethodniNoviPregled(prethodniNoviSlucaj: number, $event: any){
        //Inicijaliziram da nije pronađen pregled inicijalno
        let isInArray: boolean = false;
        //Prolazim kroz sve trenutne preglede u listi pregleda
        for(const pregled of this.pregledi){
            //Ako je liječnik kliknuo "Sljedeći pregled" te se taj pregled NALAZI trenutno u listi pregleda
            if(pregled.idPregled === prethodniNoviSlucaj){
                //Vraćam da je u redu
                isInArray = true;
            }
        }
        //Ako nije našao pregled trenutno u listu
        if(!isInArray){
            //Dohvaćam ga
            this.vratiTrazeniDatum(prethodniNoviSlucaj).subscribe(
                () => {
                    //Šaljem roditeljskoj komponenti novo stanje pregleda nakon dodavanja
                    this.poljePregleda.emit(this.pregledi);
                }
            );
        }
        //Blokiram klikam roditeljskog taga (LI-a) i omogućujem klik buttona
        $event.stopPropagation();
        //Preusmjeravam se na novi slučaj
        this.router.navigate(['./',prethodniNoviSlucaj.toString()],{relativeTo: this.route});
    }

    //Metoda koja se aktivira kada korisnik stisne button "Prethodni pregled"
    idiNaPrethodniPovezanPregled(prethodniPovezanSlucaj: number,$event: any){
        //Inicijaliziram da nije pronađen pregled inicijalno
        let isInArray: boolean = false;
        //Prolazim kroz sve trenutne preglede u listi pregleda
        for(const pregled of this.pregledi){
            //Ako je liječnik kliknuo "Sljedeći pregled" te se taj pregled NALAZI trenutno u listi pregleda
            if(pregled.idPregled === prethodniPovezanSlucaj){
                //Vraćam da je u redu
                isInArray = true;
            }
        }
        //Ako nije našao pregled trenutno u listu
        if(!isInArray){
            //Dohvaćam ga
            this.vratiTrazeniDatum(prethodniPovezanSlucaj).subscribe(
                () => {
                    //Šaljem roditeljskoj komponenti novo stanje pregleda nakon dodavanja
                    this.poljePregleda.emit(this.pregledi);
                }
            );
        }
        //Blokiram klikam roditeljskog taga (LI-a) i omogućujem klik buttona
        $event.stopPropagation();
        //Preusmjeravam se na prethodni povezan slučaj
        this.router.navigate(['./',prethodniPovezanSlucaj],{relativeTo: this.route});
    }

    //Metoda koja vraća Observable koji vraća traženi datum
    vratiTrazeniDatum(idPregled: number){
        return this.preglediListService.dohvatiTrazeniPregled(this.prijavljeniKorisnik,idPregled).pipe(
            tap(pregled => {
                //Inicijaliziram objekt tipa "PregledList"
                let objektPregled: PregledList;
                //Za svaki objekt u polju pregleda
                for(const pr of pregled){
                    //Kreiram svoj objekt
                    objektPregled = new PregledList(pr);
                    //Pusham ga u svoje polje pregleda
                    this.pregledi.push(objektPregled);
                }
            }),
            switchMap(() => {
                //Kreiram polje koje samo sadrži ID-ove pregleda koji se trenutno nalaze u listu
                const ids = this.pregledi.map((pregled) => {
                    return pregled.idPregled.toString();
                });
                return this.preglediListService.provjeriIstuGrupaciju(this.prijavljeniKorisnik,ids).pipe(
                    tap(pregledi => {
                        //Ako postoji neki pregled koji treba izbrisati
                        if(pregledi.length !== 0){
                            //Prolazim kroz sve preglede koje treba izbrisati iz liste
                            for(const id of pregledi){
                                //Izbriši onaj pregled u listi pregleda koji ima ID jednak onomu kojega je backend poslao da treba izbrisati
                                this.pregledi.splice(this.pregledi.findIndex(pregled => pregled.idPregled === +id),1);
                            }
                            //Sortiram listu pregleda po njegovom ID-u, najveći idu prvi gore
                            this.pregledi.sort(function(pregled1,pregled2){
                                if(pregled1.idPregled > pregled2.idPregled){
                                    return -1;
                                }
                                else if(pregled1.idPregled < pregled2.idPregled){
                                    return 1;
                                }
                                return 0;
                            });
                        }
                    })
                );
            })
        );
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
