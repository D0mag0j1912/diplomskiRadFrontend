import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { HeaderService } from 'src/app/shared/header/header.service';
import { PregledList } from 'src/app/shared/modeli/pregledList.model';
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
    //Šaljem datum roditeljskoj komponenti da ga postavi u filter
    @Output() datum = new EventEmitter<Date>();
    //Šaljem listu pregleda nakon dodavanja novog pregleda u nju roditeljskoj komponenti
    @Output() poljePregleda = new EventEmitter<PregledList[]>();

    constructor(
        //Dohvaćam router
        private router: Router,
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis headera
        private headerService: HeaderService,
        //Dohvaćam servis liste pregleda
        private preglediListService: PreglediListService
    ) {}

    //Ova metoda se poziva kada se komponenta incicijalizira
    ngOnInit(){
        console.log(this.pregledi);
    }

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
    
    //Metoda koja se aktivira kada korisnik stisne button "Novi pregled"
    idiNaPrethodniNoviPregled(prethodniNoviSlucaj: number,$event: any){
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
        return this.headerService.tipKorisnikaObs.pipe(
            switchMap(tipKorisnik => {
                return this.preglediListService.dohvatiTrazeniPregled(tipKorisnik,idPregled).pipe(
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
                    takeUntil(this.pretplate)
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
