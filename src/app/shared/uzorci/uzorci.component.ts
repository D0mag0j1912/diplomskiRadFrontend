import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UzorciService } from './uzorci.service';
import { merge, Subject} from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import * as UzorciValidations from './uzorci.validations';
import { ZdravstvenaUstanova } from '../modeli/zdravstvenaUstanova.model';
import { Uputnica } from '../modeli/uputnica.model';
import { SharedService } from '../shared.service';
import { Uzorak } from './uzorci.model';

@Component({
  selector: 'app-uzorci',
  templateUrl: './uzorci.component.html',
  styleUrls: ['./uzorci.component.css']
})
export class UzorciComponent implements OnInit, OnDestroy{

    //Spremam oznaku koja označava hoće li prozor odgovora servera biti otvoren ili ne
    response: boolean = false;
    //Spremam poruku servera
    responsePoruka: string = null;
    //Spremam pretplatu
    pretplata = new Subject<boolean>();
    //Definiram formu
    forma: FormGroup;
    //Emitiram event prema roditeljskoj komponenti da se izađe iz ovog prozora
    @Output() close = new EventEmitter<any>();
    //Kreiram event prema roditeljskoj komponenti da se spremio uzorak
    @Output() uzorakSpremljen = new EventEmitter<any>();
    //Primam polje zdr. ustanova od roditelja "SekundarniHeaderComponent"
    @Input() zdravstveneUstanove: ZdravstvenaUstanova[];
    //Primam naziv zdr. ustanove koja ima najveći ID uputnice
    @Input() nazivZdrUst: string;
    //Primam max ID uputnice (ID uputnice koji pripada inicijalno postavljenom nazivu u dropdownu)
    @Input() idUputnica: number;
    //Primam sve podatke uputnice koja ima najveći ID
    @Input() podatciUputnice: Uputnica;
    //Primam sve uzorke od roditelja "NalaziListComponent"
    @Input() primljeniUzorci: Uzorak;
    //Spremam sve ključeve nazive form controlova
    nazivi: string[] = [];
    //Spremam informaciju je li roditelj ove komponente "NalaziListComponent" ili "SekundarniHeaderComponent"
    sekundarniIliNalazi: string = null;

    constructor(
        //Dohvaćam servis uzoraka
        private uzorciService: UzorciService,
        //Dohvaćam shared servis
        private sharedService: SharedService
    ) { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){
        console.log(this.primljeniUzorci.bazofilniGranulociti);
        console.log(this.primljeniUzorci.eozinofilniGranulociti);
        this.forma = new FormGroup({
            'ustanova': new FormControl(this.primljeniUzorci.idUputnica ? null : this.nazivZdrUst),
            'eritrociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.eritrociti + ' *10^12/L' : this.primljeniUzorci.eritrociti, [
                Validators.required,
                UzorciValidations.provjeriEritrocite(),
                UzorciValidations.isBroj()]),
            'hemoglobin': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.hemoglobin + ' g/L' : this.primljeniUzorci.hemoglobin, [
                Validators.required,
                UzorciValidations.provjeriHemoglobin(),
                UzorciValidations.isBroj()]),
            'hematokrit': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.hematokrit + ' L/L' : this.primljeniUzorci.hematokrit, [
                Validators.required,
                UzorciValidations.provjeriHematokrit(),
                UzorciValidations.isBroj()]),
            'mcv': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.mcv + ' fL' : this.primljeniUzorci.mcv, [
                Validators.required,
                UzorciValidations.provjeriMCV(),
                UzorciValidations.isBroj()]),
            'mch': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.mch + ' pg' : this.primljeniUzorci.mch, [
                Validators.required,
                UzorciValidations.provjeriMCH(),
                UzorciValidations.isBroj()]),
            'mchc': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.mchc + ' g/L' : this.primljeniUzorci.mchc, [
                Validators.required,
                UzorciValidations.provjeriMCHC(),
                UzorciValidations.isBroj()]),
            'rdw': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.rdw + ' %' : this.primljeniUzorci.rdw, [
                Validators.required,
                UzorciValidations.provjeriRDW(),
                UzorciValidations.isBroj()]),
            'leukociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.leukociti + ' *10^9/L' : this.primljeniUzorci.leukociti, [
                Validators.required,
                UzorciValidations.provjeriLeukociti(),
                UzorciValidations.isBroj()]),
            'trombociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.trombociti + ' *10^9/L' : this.primljeniUzorci.trombociti, [
                Validators.required,
                UzorciValidations.provjeriTrombociti(),
                UzorciValidations.isBroj()]),
            'mpv': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.mpv + ' fL' : this.primljeniUzorci.mpv, [
                Validators.required,
                UzorciValidations.provjeriMPV(),
                UzorciValidations.isBroj()]),
            'trombokrit': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.trombokrit + ' %' : this.primljeniUzorci.trombokrit, [
                Validators.required,
                UzorciValidations.provjeriTrombokrit(),
                UzorciValidations.isBroj()]),
            'pdw': new FormControl(this.primljeniUzorci.pdw, [
                Validators.required,
                UzorciValidations.provjeriPDW(),
                UzorciValidations.isBroj()]),
            'neutrofilniGranulociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.neutrofilniGranulociti + ' *10^9/L' : this.primljeniUzorci.neutrofilniGranulociti, [
                Validators.required,
                UzorciValidations.provjeriNeutrofilniGranulociti(),
                UzorciValidations.isBroj()]),
            'monociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.monociti + ' *10^9/L' : this.primljeniUzorci.monociti, [
                Validators.required,
                UzorciValidations.provjeriMonociti(),
                UzorciValidations.isBroj()]),
            'limfociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.limfociti + ' *10^9/L' : this.primljeniUzorci.limfociti, [
                Validators.required,
                UzorciValidations.provjeriLimfociti(),
                UzorciValidations.isBroj()]),
            'eozinofilniGranulociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.eozinofilniGranulociti + ' *10^9/L' : this.primljeniUzorci.eozinofilniGranulociti, [
                Validators.required,
                UzorciValidations.provjeriEozinofilniGranulociti(),
                UzorciValidations.isBroj()]),
            'bazofilniGranulociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.bazofilniGranulociti + ' *10^9/L' : this.primljeniUzorci.bazofilniGranulociti, [
                Validators.required,
                UzorciValidations.provjeriBazofilniGranulociti(),
                UzorciValidations.isBroj()]),
            'retikulociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.retikulociti + ' *10^9/L' : this.primljeniUzorci.retikulociti, [
                Validators.required,
                UzorciValidations.provjeriRetikulociti(),
                UzorciValidations.isBroj()])
        });
        //Prolazim kroz sve form controlove u formi
        for(const key in this.forma.controls){
            //Spremam im nazive
            this.nazivi.push(key);
        }

        const combined = merge(
            //Pretplaćivam se na informaciju jesam li ovdje došao iz NALAZA ili SEKUNDARNOG HEADERA
            this.sharedService.sekundarniIliNalaziObs.pipe(
                tap(sekundarniIliNalazi => {
                    this.sekundarniIliNalazi = sekundarniIliNalazi;
                }),
                takeUntil(this.pretplata)
            ),
            //Pretplaćivam se na promjene u dropdownu zdr. ustanove
            this.ustanova.valueChanges.pipe(
                tap((value: string) => {
                    let polje = [];
                    polje = value.split(" ");
                    //Spremam ID uputnice
                    this.idUputnica = polje[polje.length - 1];
                }),
                switchMap(() => {
                    //Pretplaćivam se na podatke uputnice u kojima se nalazi naziv zdr. ustanove iz dropdowna
                    return this.uzorciService.getPodatciUputnica(this.idUputnica).pipe(
                        tap(uputnica => {
                            for(const u of uputnica){
                                this.podatciUputnice = new Uputnica(u);
                            }
                        })
                    );
                }),
                takeUntil(this.pretplata)
            )
        ).subscribe();
    }

    //Metoda koja se poziva kada med.sestra stisne button "Pošalji"
    onSubmit(){
        if(this.forma.invalid){
            return;
        }
        this.uzorciService.spremiUzorke(
            this.idUputnica,
            +this.eritrociti.value,
            +this.hemoglobin.value,
            +this.hematokrit.value,
            +this.mcv.value,
            +this.mch.value,
            +this.mchc.value,
            +this.rdw.value,
            +this.leukociti.value,
            +this.trombociti.value,
            +this.mpv.value,
            +this.trombokrit.value,
            +this.pdw.value,
            +this.neutrofilniGranulociti.value,
            +this.monociti.value,
            +this.limfociti.value,
            +this.eozinofilniGranulociti.value,
            +this.bazofilniGranulociti.value,
            +this.retikulociti.value
        ).pipe(
            tap(odgovor => {
                //Ako odgovor servera nije null
                if(odgovor !== null){
                    //Označavam da se otvori prozor koji prikaziva poruku servera
                    this.response = true;
                    //Spremam poruku servera
                    this.responsePoruka = odgovor.message;
                    //Emitiram event prema roditelju da je uzorak spremljen
                    this.uzorakSpremljen.emit();
                }
            })
        ).subscribe();
    }

    //Metoda koja se pokreće kada korisnik želi izaći iz ovog prozora
    onClose(){
        this.close.emit();
    }

    //Metoda koja zatvara alert
    onCloseAlert(){
        //Zatvori alert
        this.response = false;
        //Emitiram event prema roditeljskoj komponenti "SekundarniHeaderComponent"
        this.onClose();
    }

    get ustanova(): FormControl{
        return this.forma.get('ustanova') as FormControl;
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
