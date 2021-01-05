import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  //Inicijalizacija poruke te omogućavam da se može njezina vrijednost postaviti iz neke druge komponente
  @Input() message: string = null;

  //Kreiram event i omogućavam da se može slušati iz vanjskih komponenti
  @Output() close = new EventEmitter<any>();
  @ViewChild('alertBoxActions') alertBoxActions : ElementRef;
  constructor() { }

  ngOnInit(){
  }
  //Kada se klikne button "Close" ili negdje izvan prozora, počinjem emitirati event
  onClose(){
    this.close.emit();
  }

}
