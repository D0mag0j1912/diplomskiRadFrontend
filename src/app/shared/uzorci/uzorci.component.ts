import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-uzorci',
  templateUrl: './uzorci.component.html',
  styleUrls: ['./uzorci.component.css']
})
export class UzorciComponent implements OnInit {

    //Definiram formu
    forma: FormGroup;
    //Emitiram event prema roditeljskoj komponenti da se izađe iz ovog prozora
    @Output() close = new EventEmitter<any>();

    constructor() { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){
        this.forma = new FormGroup({
            'eritrociti': new FormControl(null),
            'hemoglobin': new FormControl(null),
            'hematokrit': new FormControl(null),
            'mcv': new FormControl(null),
            'mch': new FormControl(null),
            'mchc': new FormControl(null),
            'rdw': new FormControl(null),
            'leukociti': new FormControl(null),
            'trombociti': new FormControl(null),
            'mpv': new FormControl(null),
            'trombokrit': new FormControl(null),
            'pdw': new FormControl(null),
            'neutro': new FormControl(null),
            'monociti': new FormControl(null),
            'limfociti': new FormControl(null),
            'eozinofilniGranulociti': new FormControl(null),
            'bazofilniGranulociti': new FormControl(null),
            'retikulociti': new FormControl(null)
        });
    }

    //Metoda koja se pokreće kada korisnik želi izaći iz ovog prozora
    onClose(){
        this.close.emit();
    }

}
