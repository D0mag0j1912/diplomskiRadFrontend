import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Nalaz } from 'src/app/shared/modeli/nalaz.model';

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
    //Oznaka je li ima sekundarnih dijagnoza
    isSekundarne: boolean = false;

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam router
        private router: Router
    ) { }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Dohvaćam podatke Resolvera (tj. sve podatke kliknutog nalaza)
        this.route.data.pipe(
            tap((nalaz: any) => {
                console.log(nalaz);
                //Prolazim kroz podatke poslane sa servera
                for(const n of nalaz.nalaz[0]){
                    //Spremam podatke u svoj objekt
                    this.nalaz = new Nalaz(n);
                } 
                //Ako ima dohvaćenih sek. dijagnoza
                if(nalaz.nalaz[1] !== null){
                    //Prolazim kroz sve dohvaćene sekundarne dijagnoze te ih spremam u svoj model
                    for(const dijagnoza of nalaz.nalaz[1]){
                        this.nalaz.sekundarneDijagnoze = dijagnoza.sekundarneDijagnoze;
                    }
                }
                //Kreiram novi prazni string
                let str = new String("");
                //Ako ima sekundarnih dijagnoza u mom modelu
                if(this.nalaz._sekundarneDijagnoze.length > 0){
                    //Označavam da ima sekundarnih dijagnoza
                    this.isSekundarne = true;
                    //Prolazim kroz njih
                    for(const dijagnoza of this.nalaz._sekundarneDijagnoze){
                        //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                        str = str.concat(dijagnoza + "\n");
                    }
                }
                //Kreiram formu
                this.forma = new FormGroup({
                    'dijagnoze': new FormGroup({
                        'primarnaDijagnoza': new FormControl(this.nalaz.primarnaDijagnoza),
                        'sekundarneDijagnoze': new FormControl(this.isSekundarne ? str : null)
                    }),
                    'ustanova': new FormGroup({
                        'nazivID': new FormControl(this.nalaz.nazivZdrUst + ' [' + this.nalaz.idZdrUst + ']'),
                        'adresaPbr': new FormControl(this.nalaz.adresaZdrUst + ' [' + this.nalaz.pbrZdrUst + ']')
                    }),
                    'specijalist': new FormGroup({
                        'datumNalaz': new FormControl(this.nalaz.datumNalaz),
                        'imePrezime': new FormControl(this.nalaz.imePrezimeSpecijalist),
                        'zdravstvenaDjelatnost': new FormControl(this.nalaz.zdravstvenaDjelatnost),
                        'misljenje': new FormControl(this.nalaz.misljenjeSpecijalist)
                    })
                });
            }),
            takeUntil(this.pretplata)
        ).subscribe();
    }

    //Ova metoda se poziva kada liječnik klikne na "Izađi" ili izvan prozora
    onClose(){
        //Preusmjeravam se na /nalazi
        this.router.navigate(['../'],{relativeTo: this.route});
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplata.next(true);
        this.pretplata.complete();
    }

}
