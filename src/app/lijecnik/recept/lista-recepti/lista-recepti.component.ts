import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-lista-recepti',
  templateUrl: './lista-recepti.component.html',
  styleUrls: ['./lista-recepti.component.css']
})
export class ListaReceptiComponent implements OnInit {

    //Definiram forme
    forma: FormGroup;
    formaPretraga: FormGroup;

    constructor() { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Kreiram formu pretrage
        this.formaPretraga = new FormGroup({
            'pretraga': new FormControl(null)
        });
        //Kreiram formu
        this.forma = new FormGroup({
            'vrstaRecept': new FormControl(null),
            'brojPonavljanja': new FormControl(null),
            'podatciPacijenta': new FormGroup({
                'imePrezime': new FormControl(null),
                'datumRodenja': new FormControl(null),
                'adresa': new FormControl(null)
            }),
            'datumRecept': new FormControl(null),
            'ustanova': new FormGroup({
                'naziv': new FormControl(null),
                'telefon': new FormControl(null),
                'adresa': new FormControl(null),
                'imePrezimeLijecnik': new FormControl(null)
            }),
            'primarnaDijagnoza': new FormControl(null),
            'sekundarnaDijagnoza': new FormControl(null),
            'proizvod': new FormGroup({
                'ime': new FormControl(null),
                'kolicina': new FormControl(null),
                'doziranje': new FormControl(null),
                'nacinUpotrebe': new FormControl(null),
                'dostatnost': new FormControl(null),
                'vrijediDo': new FormControl(null)
            }),
            'specijalist': new FormGroup({
                'sifraSpecijalist': new FormControl(null),
                'tipSpecijalist': new FormControl(null)
            })
        });
    }

}
