import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NalazList } from 'src/app/shared/modeli/nalazList.model';

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

    constructor() { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit(){
        console.log(this.nalazi);
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplata.next(true);
        this.pretplata.complete();
    }

}
