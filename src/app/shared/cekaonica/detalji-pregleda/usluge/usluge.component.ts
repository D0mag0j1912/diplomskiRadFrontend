import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {Subject} from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Usluga } from 'src/app/shared/modeli/usluga.model';
import { CekaonicaService } from '../../cekaonica.service';

@Component({
  selector: 'app-usluge',
  templateUrl: './usluge.component.html',
  styleUrls: ['./usluge.component.css']
})
export class UslugeComponent implements OnInit, OnDestroy{

    //Hendlam pretplate
    private pretplata = new Subject<boolean>();
    //Kreiram EventEmitter da mogu obavjestiti roditeljsku komponentu da izađe odavde
    @Output() close = new EventEmitter<any>();
    //Primam informaciju je li dolazim ovdje iz perspektive općih podataka ili povijesti bolesti
    @Input() podatci: {tip: string, idObrada: number};
    //Spremam poruku u slučaju da nema naplaćenih usluga
    nemaNaplacenihUsluga: string = null;
    //Spremam sve naplaćene usluge
    naplaceneUsluge: Usluga[] = [];

    constructor(
        //Dohvaćam servis čekaonice
        private cekaonicaService: CekaonicaService
    ) { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit() {
        //Pretplaćivam se na sve naplaćene usluge
        this.cekaonicaService.getNaplaceneUsluge(this.podatci.tip, +this.podatci.idObrada).pipe(
            tap(odgovor => {
                console.log(odgovor);
                //Ako ima naplaćenih usluga
                if(odgovor !== null){
                    //Definiram objekt naplaćenih usluga
                    let objNaplaceneUsluge;
                    //Prolazim kroz odgovor servera
                    for(const usluga of odgovor){
                        //Spremam podatke u svoj objekt
                        objNaplaceneUsluge = new Usluga(usluga);
                        //Pusham ih u polje
                        this.naplaceneUsluge.push(objNaplaceneUsluge);
                    }
                    console.log(this.naplaceneUsluge);
                }
                //Ako nema naplaćenih usluga (a trebalo bi ih biti ako sam došao dodavde)
                else{
                    this.nemaNaplacenihUsluga = 'Nema naplaćenih usluga!';
                }
            }),
            takeUntil(this.pretplata)
        ).subscribe();
    }

    //Metoda koja se poziva kada korisnik želi izaći odavde
    onClose(){
        this.close.emit();
    }

    //Metoda koja se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplata.next(true);
        this.pretplata.complete();
    }

}
