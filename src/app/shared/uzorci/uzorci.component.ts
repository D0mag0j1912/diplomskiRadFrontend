import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UzorciService } from './uzorci.service';
import {Subject} from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import * as UzorciValidations from './uzorci.validations';

@Component({
  selector: 'app-uzorci',
  templateUrl: './uzorci.component.html',
  styleUrls: ['./uzorci.component.css']
})
export class UzorciComponent implements OnInit, OnDestroy{

    //Spremam pretplatu
    pretplata = new Subject<boolean>();
    //Definiram formu
    forma: FormGroup;
    //Emitiram event prema roditeljskoj komponenti da se izađe iz ovog prozora
    @Output() close = new EventEmitter<any>();
    //Spremam sve ključeve nazive form controlova
    nazivi: string[] = [];

    constructor(
        //Dohvaćam servis uzoraka
        private uzorciService: UzorciService
    ) { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){
        this.forma = new FormGroup({
            'eritrociti': new FormControl(null, [
                  Validators.required,
                  UzorciValidations.provjeriEritrocite(),
                  UzorciValidations.isBroj()]),
            'hemoglobin': new FormControl(null, [Validators.required,UzorciValidations.provjeriHemoglobin()]),
            'hematokrit': new FormControl(null, [Validators.required,UzorciValidations.provjeriHematokrit()]),
            'mcv': new FormControl(null, [Validators.required,UzorciValidations.provjeriMCV()]),
            'mch': new FormControl(null, [Validators.required,UzorciValidations.provjeriMCH()]),
            'mchc': new FormControl(null, [Validators.required,UzorciValidations.provjeriMCHC()]),
            'rdw': new FormControl(null, [Validators.required,UzorciValidations.provjeriRDW()]),
            'leukociti': new FormControl(null, [Validators.required,UzorciValidations.provjeriLeukociti()]),
            'trombociti': new FormControl(null, [Validators.required,UzorciValidations.provjeriTrombociti()]),
            'mpv': new FormControl(null, [Validators.required,UzorciValidations.provjeriMPV()]),
            'trombokrit': new FormControl(null, [Validators.required,UzorciValidations.provjeriTrombokrit()]),
            'pdw': new FormControl(null, [Validators.required,UzorciValidations.provjeriPDW()]),
            'neutrofilniGranulociti': new FormControl(null, [Validators.required,UzorciValidations.provjeriNeutrofilniGranulociti()]),
            'monociti': new FormControl(null, [Validators.required,UzorciValidations.provjeriMonociti()]),
            'limfociti': new FormControl(null, [Validators.required,UzorciValidations.provjeriLimfociti()]),
            'eozinofilniGranulociti': new FormControl(null, [Validators.required,UzorciValidations.provjeriEozinofilniGranulociti()]),
            'bazofilniGranulociti': new FormControl(null, [Validators.required,UzorciValidations.provjeriBazofilniGranulociti()]),
            'retikulociti': new FormControl(null, [Validators.required,UzorciValidations.provjeriRetikulociti()])
        });
        //Prolazim kroz sve form controlove u formi
        for(const key in this.forma.controls){
            //Spremam im nazive
            this.nazivi.push(key);
        }
        console.log(!isNaN(parseFloat('6.7')));
        //Pretplaćivam se na slučajno generirane vrijednosti uzoraka
        this.uzorciService.getUzorci().pipe(
            tap(uzorci => {
                //Prolazim kroz sve form controlove
                for(const keyForma in this.forma.controls){
                    //Prolazim kroz sve ključeve i vrijednost objekta uzoraka
                    for(const [key,value] of Object.entries(uzorci)){
                        //Ako je naziv formcontrola jednak nazivu ključa u objektu uzoraka
                        if(keyForma === key){
                            //Na taj form control postavi vrijednost objekta
                            this.forma.get(key).patchValue(value, {emitEvent: false});
                        }
                    }
                }
            }),
            takeUntil(this.pretplata)
        ).subscribe();
    }

    //Metoda koja se pokreće kada korisnik želi izaći iz ovog prozora
    onClose(){
        this.close.emit();
    }

    get eritrociti(): FormControl{
        return this.forma.get('eritrociti') as FormControl;
    }
    get hemoglobin(): FormControl{
        return this.forma.get('hemoglobin') as FormControl;
    }
    get hematokrit(): FormControl{
        return this.forma.get('hematokrit') as FormControl;
    }
    get mcv(): FormControl{
        return this.forma.get('mcv') as FormControl;
    }
    get mch(): FormControl{
        return this.forma.get('mch') as FormControl;
    }
    get mchc(): FormControl{
        return this.forma.get('mchc') as FormControl;
    }
    get rdw(): FormControl{
        return this.forma.get('rdw') as FormControl;
    }
    get leukociti(): FormControl{
        return this.forma.get('leukociti') as FormControl;
    }
    get trombociti(): FormControl{
        return this.forma.get('trombociti') as FormControl;
    }
    get mpv(): FormControl{
        return this.forma.get('mpv') as FormControl;
    }
    get trombokrit(): FormControl{
        return this.forma.get('trombokrit') as FormControl;
    }
    get pdw(): FormControl{
        return this.forma.get('pdw') as FormControl;
    }
    get neutrofilniGranulociti(): FormControl{
        return this.forma.get('neutrofilniGranulociti') as FormControl;
    }
    get monociti(): FormControl{
        return this.forma.get('monociti') as FormControl;
    }
    get limfociti(): FormControl{
        return this.forma.get('limfociti') as FormControl;
    }
    get eozinofilniGranulociti(): FormControl{
        return this.forma.get('eozinofilniGranulociti') as FormControl;
    }
    get bazofilniGranulociti(): FormControl{
        return this.forma.get('bazofilniGranulociti') as FormControl;
    }
    get retikulociti(): FormControl{
        return this.forma.get('retikulociti') as FormControl;
    }
    //Metoda koja se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplata.next(true);
        this.pretplata.complete();
    }

}
