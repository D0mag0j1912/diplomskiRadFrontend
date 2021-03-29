import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Nalaz } from 'src/app/shared/modeli/nalaz.model';
import { NalaziDetailService } from './nalazi-detail.service';

@Component({
  selector: 'app-nalazi-detail',
  templateUrl: './nalazi-detail.component.html',
  styleUrls: ['./nalazi-detail.component.css']
})
export class NalaziDetailComponent implements OnInit, OnDestroy{

    //Spremam pretplate
    pretplata = new Subject<boolean>();
    //Spremam detaljne podatke nalaza
    nalaz: Nalaz;
    //Definiram formu
    forma: FormGroup;

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis detalja nalaza
        private nalaziDetailService: NalaziDetailService
    ) { }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Dohvaćam podatke Resolvera (tj. sve podatke kliknutog nalaza)
        this.route.data.pipe(
            tap((nalaz: any) => {
                //Prolazim kroz podatke poslane sa servera
                for(const n of nalaz.nalaz){
                    //Spremam podatke u svoj objekt
                    this.nalaz = new Nalaz(n);
                } 
                console.log(this.nalaz);

                //Kreiram formu
                this.forma = new FormGroup({
                    'ustanova': new FormGroup({
                        'nazivID': new FormControl(this.nalaz.nazivZdrUst + ' [' + this.nalaz.idZdrUst + ']'),
                        'adresa': new FormControl(this.nalaz.adresaZdrUst),
                        'pbr': new FormControl(this.nalaz.pbrZdrUst)
                    }),
                    'specijalist': new FormGroup({
                        'datumNalaz': new FormControl(this.nalaz.datumNalaz),
                        'imePrezime': new FormControl(this.nalaz.imePrezimeSpecijalist),
                        'sifraTip': new FormControl(this.nalaz.sifraTipSpecijalist),
                        'zdravstvenaDjelatnost': new FormControl(this.nalaz.zdravstvenaDjelatnost),
                        'misljenje': new FormControl(this.nalaz.misljenjeSpecijalist)
                    }),
                    'primarnaDijagnoza': new FormControl(this.nalaz.primarnaDijagnoza)
                });
            }),
            takeUntil(this.pretplata)
        ).subscribe();
    }

    //Ova metoda se poziva kada liječnik klikne na "Izađi" ili izvan prozora
    onClose(){
        //Emitiram Subjectom vrijednost da liječnik želi zatvoriti ovaj prozor
        this.nalaziDetailService.close.next(true);
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplata.next(true);
        this.pretplata.complete();
    }

}
