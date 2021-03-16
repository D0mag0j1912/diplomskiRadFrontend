import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
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
    ) { }

    //Ova metoda se poziva kada se komponenta incicijalizira
    ngOnInit(){
        console.log(this.pregledi);

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
