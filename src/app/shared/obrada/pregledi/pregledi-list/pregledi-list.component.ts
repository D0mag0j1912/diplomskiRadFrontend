import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { PregledList } from 'src/app/shared/modeli/pregledList.model';

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

    constructor(
        //Dohvaćam router
        private router: Router,
        //Dohvaćam trenutni route
        private route: ActivatedRoute
    ) {}

    //Ova metoda se poziva kada se komponenta incicijalizira
    ngOnInit(){
        console.log(this.pregledi);
    }

    //Metoda koja se aktivira kada korisnik stisne button "Sljedeći pregled"
    idiNaSljedeciPregled(sljedeciPregled: number,$event: any){
        //Blokira klik roditeljskog taga (Li-a) i omogućuje klik buttona
        $event.stopPropagation();
        //Preusmjeravam se na sljedeći pregled
        this.router.navigate(['./',sljedeciPregled.toString()],{relativeTo: this.route});
    } 
    
    //Metoda koja se aktivira kada korisnik stisne button "Novi pregled"
    idiNaPrethodniNoviPregled(prethodniNoviSlucaj: number,$event: any){
        //Blokiram klikam roditeljskog taga (LI-a) i omogućujem klik buttona 
        $event.stopPropagation();
        //Preusmjeravam se na novi slučaj
        this.router.navigate(['./',prethodniNoviSlucaj.toString()],{relativeTo: this.route});
    }

    //Metoda koja se aktivira kada korisnik stisne button "Prethodni pregled"
    idiNaPrethodniPovezanPregled(prethodniPovezanSlucaj: number,$event: any){
        //Blokiram klikam roditeljskog taga (LI-a) i omogućujem klik buttona 
        $event.stopPropagation();
        //Preusmjeravam se na prethodni povezan slučaj
        this.router.navigate(['./',prethodniPovezanSlucaj],{relativeTo: this.route});
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
