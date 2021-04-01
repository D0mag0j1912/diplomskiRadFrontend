import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
import { ZdravstvenaDjelatnost } from 'src/app/shared/modeli/zdravstvenaDjelatnost.model';
import { ZdravstvenaUstanova } from 'src/app/shared/modeli/zdravstvenaUstanova.model';

@Component({
  selector: 'app-uputnica',
  templateUrl: './uputnica.component.html',
  styleUrls: ['./uputnica.component.css']
})
export class UputnicaComponent implements OnInit, OnDestroy{

    //Spremam pretplate
    pretplata = new Subject<boolean>();
    //Oznaka je li prozor izdavanja uputnice otvoren
    isIzdavanjeUputnice: boolean = false;
    //Spremam sve zdravstvene ustanove
    zdravstveneUstanove: ZdravstvenaUstanova[] = [];
    //Spremam sve zdravstvene djelatnosti
    zdravstveneDjelatnosti: ZdravstvenaDjelatnost[] = [];
    //Spremam sve dijagnoze
    dijagnoze: Dijagnoza[] = [];
    //Spremam sve pacijente
    pacijenti: string[] = [];

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute
    ) { }

    //Metoda koja se pokreće kada se komponenta inicijalizira
    ngOnInit() {
        //Dohvaćam podatke Resolvera
        this.route.data.pipe(
            map(podatci => podatci.importi),
            tap(podatci => {
                //Definiram objekt u kojega ću spremati dijagnoze
                let objektDijagnoza;
                //Prolazim kroz sve dijagnoze vraćene sa servera
                for(const dijagnoza of podatci.dijagnoze){
                    objektDijagnoza = new Dijagnoza(dijagnoza);
                    this.dijagnoze.push(objektDijagnoza);
                }
                //Prolazim kroz sve pacijente vraćene sa servera
                for(const pacijent of podatci.pacijenti){
                    this.pacijenti.push(pacijent.Pacijent);
                }
                //Definiram objekt u kojega spremam sve zdravstvene ustanove
                let objektZdrUst;
                for(const ustanova of podatci.zdravstveneUstanove){
                    objektZdrUst = new ZdravstvenaUstanova(ustanova);
                    this.zdravstveneUstanove.push(objektZdrUst);
                }
                //Definiram objekt u kojega spremam sve zdravstvene ustanove
                let objektZdrDjel;
                for(const djel of podatci.zdravstveneDjelatnosti){
                    objektZdrDjel = new ZdravstvenaDjelatnost(djel);
                    this.zdravstveneDjelatnosti.push(objektZdrDjel);
                }
            }),
            takeUntil(this.pretplata)
        ).subscribe();
    }

    //Metoda koja se pokreće kada se klikne button "Nova uputnica"
    onNovaUputnica(){
        //Otvori prozor izdavanja uputnice
        this.isIzdavanjeUputnice = true;
    }

    //Metoda koja se poziva kada liječnik želi izaći iz prozora izdavanja uputnice
    onCloseIzdajUputnica(){
        //Zatvori prozor izdavanja uputnice
        this.isIzdavanjeUputnice = false;
    }

    //Metoda koja se pokreće kada se komponenta uništi
    ngOnDestroy(){
        this.pretplata.next(true);
        this.pretplata.complete();
    }

}
