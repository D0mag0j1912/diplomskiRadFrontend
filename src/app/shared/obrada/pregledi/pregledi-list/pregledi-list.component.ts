import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { PregledList } from 'src/app/shared/modeli/pregledList.model';

@Component({
  selector: 'app-pregledi-list',
  templateUrl: './pregledi-list.component.html',
  styleUrls: ['./pregledi-list.component.css']
})
export class PreglediListComponent implements OnInit {

    //Primam pregleda za listu od roditelja
    @Input() pregledi: PregledList[];
    //Šaljem datum roditeljskoj komponenti da ga postavi u filter
    @Output() datum = new EventEmitter<Date>();

    constructor() { }

    //Ova metoda se poziva kada se komponenta incicijalizira
    ngOnInit(){
        console.log(this.pregledi);
    }
    //Kada se klikne element liste (određeni pregled)
    onClickPregled(pregled: PregledList){
        //Emitiraj vrijednost datuma stisnutog pregleda prema roditelju
        this.datum.emit(pregled.datum);
    }

}
