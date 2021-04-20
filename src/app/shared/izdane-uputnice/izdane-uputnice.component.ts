import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Uputnica } from '../modeli/uputnica.model';

@Component({
  selector: 'app-izdane-uputnice',
  templateUrl: './izdane-uputnice.component.html',
  styleUrls: ['./izdane-uputnice.component.css']
})
export class IzdaneUputniceComponent implements OnInit {

    //Kreiram EventEmitter da ova komponenta može obavjestiti svoga roditelja da izađe iz nje
    @Output() close = new EventEmitter<any>();
    //Spremam primljenu uputnicu
    @Input() uputnica: Uputnica;

    constructor() { }
    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){
        console.log(this.uputnica);
    }

    //Metoda koja pokreće event izlaska iz ove komponente
    onClose(){
        this.close.emit();
    }

}
