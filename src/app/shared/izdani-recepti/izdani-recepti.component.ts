import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Recept } from '../modeli/recept.model';

@Component({
  selector: 'app-izdani-recepti',
  templateUrl: './izdani-recepti.component.html',
  styleUrls: ['./izdani-recepti.component.css']
})
export class IzdaniReceptiComponent implements OnInit{

    //Kreiram EventEmitter da ova komponenta može obavjestiti svoga roditelja da izađe iz nje
    @Output() close = new EventEmitter<any>();
    //Spremam primljeni recept
    @Input() recept: Recept;

    constructor() { }
    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){
    }

    //Metoda koja pokreće event izlaska iz ove komponente
    onClose(){
        this.close.emit();
    }

}
