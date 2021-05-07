import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NalazList } from '../nalazList.model';

@Component({
  selector: 'app-nalazi-list',
  templateUrl: './nalazi-list.component.html',
  styleUrls: ['./nalazi-list.component.css']
})
export class NalaziListComponent implements OnInit, OnDestroy{

    //Spremam pretplatu
    pretplata = new Subject<boolean>();
    //Primam nalaze od roditelja
    @Input() nalazi: NalazList[];
    //Broj spaceova ispod svega
    pom: number[] = [0,1,2,3];

    constructor() { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit(){
        console.log(this.nalazi);
    }

    //Metoda koja se aktivira kada liječnik klikne na "Pogledaj uzorke"
    onPogledajUzorke(idNalaz: number, $event){
        console.log(idNalaz);
        $event.stopPropagation();
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplata.next(true);
        this.pretplata.complete();
    }

}
