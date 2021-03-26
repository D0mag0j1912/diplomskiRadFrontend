import { Component, Input, OnInit } from '@angular/core';
import { NalazList } from 'src/app/shared/modeli/nalazList.model';

@Component({
  selector: 'app-nalazi-list',
  templateUrl: './nalazi-list.component.html',
  styleUrls: ['./nalazi-list.component.css']
})
export class NalaziListComponent implements OnInit {


    //Primam nalaze od roditelja
    @Input() nalazi: NalazList[];

    constructor() { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit(){
        console.log(this.nalazi);
    }

}
