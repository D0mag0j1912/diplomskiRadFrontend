import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-brisanje-pacijenta-alert',
  templateUrl: './brisanje-pacijenta-alert.component.html',
  styleUrls: ['./brisanje-pacijenta-alert.component.css']
})
export class BrisanjePacijentaAlertComponent implements OnInit{

    //Inicijalizacija poruke te omogućavam da se može njezina vrijednost postaviti iz neke druge komponente
    @Input() message: string = null;

    //Kreiram event i omogućavam da se može slušati iz vanjskih komponenti
    @Output() close = new EventEmitter<any>();
    @Output() brisanje = new EventEmitter<any>();
    //Dohvaćam div kojega ažuriram u drugim komponentama
    @ViewChild('alertbox') alertbox: ElementRef;

    constructor() { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){}
    
    //Kada se klikne button "Close" ili negdje izvan prozora, počinjem emitirati event
    onClose(){
        this.close.emit();
    }

    //Kada se klikne button "Obriši", počinjem emitirati event
    onBrisanje(){
        this.brisanje.emit();
    }

}
