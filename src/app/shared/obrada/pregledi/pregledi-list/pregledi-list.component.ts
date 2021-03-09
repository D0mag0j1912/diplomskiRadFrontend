import { Component, Input, OnInit } from '@angular/core';
import { PregledList } from 'src/app/shared/modeli/pregledList.model';

@Component({
  selector: 'app-pregledi-list',
  templateUrl: './pregledi-list.component.html',
  styleUrls: ['./pregledi-list.component.css']
})
export class PreglediListComponent implements OnInit {

    //Primam pregleda za listu od roditelja
    @Input() pregledi: PregledList[];

    constructor() { }

    //Ova metoda se poziva kada se komponenta incicijalizira
    ngOnInit(){
        console.log(this.pregledi);
    }

}
