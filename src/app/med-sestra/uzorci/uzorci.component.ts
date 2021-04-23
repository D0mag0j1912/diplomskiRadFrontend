import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-uzorci',
  templateUrl: './uzorci.component.html',
  styleUrls: ['./uzorci.component.css']
})
export class UzorciComponent implements OnInit, OnDestroy {
    //Definiram formu
    forma: FormGroup;


    constructor() { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){
        this.forma = new FormGroup({

        });
    }

    //Metoda koja se poziva kada se komponenta uništi
    ngOnDestroy(){

    }
}
