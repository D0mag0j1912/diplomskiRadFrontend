import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UzorciService } from './uzorci.service';
import { merge, of, Subject} from 'rxjs';
import { concatMap, switchMap, takeUntil, tap } from 'rxjs/operators';
import * as UzorciValidations from './uzorci.validations';
import { ZdravstvenaUstanova } from '../modeli/zdravstvenaUstanova.model';
import { Uputnica } from '../modeli/uputnica.model';
import { SharedService } from '../shared.service';
import { Uzorak } from './uzorci.model';
import { ReferentnaVrijednost } from './referentna-vrijednost.model';
import { ObradaService } from '../obrada/obrada.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-uzorci',
  templateUrl: './uzorci.component.html',
  styleUrls: ['./uzorci.component.css']
})
export class UzorciComponent implements OnInit, OnDestroy{

    //Pomoćno polje
    pom: number[] = [0,1,2,3];
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
    //Primam sve referentne vrijednosti
    @Input() referentneVrijednosti: ReferentnaVrijednost[];
    //Spremam informaciju je li roditelj ove komponente "NalaziListComponent" ili "SekundarniHeaderComponent"
    @Input() oznaka: string;
    //Spremam sve ključeve nazive form controlova
    nazivi: string[] = [];

    constructor(
        //Dohvaćam servis uzoraka
        private uzorciService: UzorciService,
        //Dohvaćam shared servis
        private sharedService: SharedService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam dialog servis
        private dialog: MatDialog
    ) { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){
        console.log(this.oznaka);
        this.forma = new FormGroup({
            'ustanova': new FormControl(this.primljeniUzorci.idUputnica ? null : this.nazivZdrUst),
            'eritrociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.eritrociti + ' *10^12/L' : this.primljeniUzorci.eritrociti,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'hemoglobin': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.hemoglobin + ' g/L' : this.primljeniUzorci.hemoglobin,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()]: []),
            'hematokrit': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.hematokrit + ' L/L' : this.primljeniUzorci.hematokrit,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()]: []),
            'mcv': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.mcv + ' fL' : this.primljeniUzorci.mcv,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()]: []),
            'mch': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.mch + ' pg' : this.primljeniUzorci.mch,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()]: []),
            'mchc': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.mchc + ' g/L' : this.primljeniUzorci.mchc,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'rdw': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.rdw + ' %' : this.primljeniUzorci.rdw,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'leukociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.leukociti + ' *10^9/L' : this.primljeniUzorci.leukociti,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'trombociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.trombociti + ' *10^9/L' : this.primljeniUzorci.trombociti,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'mpv': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.mpv + ' fL' : this.primljeniUzorci.mpv,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'trombokrit': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.trombokrit + ' %' : this.primljeniUzorci.trombokrit,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'pdw': new FormControl(this.primljeniUzorci.pdw + " ",
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'neutrofilniGranulociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.neutrofilniGranulociti + ' *10^9/L' : this.primljeniUzorci.neutrofilniGranulociti,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'monociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.monociti + ' *10^9/L' : this.primljeniUzorci.monociti,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'limfociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.limfociti + ' *10^9/L' : this.primljeniUzorci.limfociti,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'eozinofilniGranulociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.eozinofilniGranulociti + ' *10^9/L' : this.primljeniUzorci.eozinofilniGranulociti,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'bazofilniGranulociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.bazofilniGranulociti + ' *10^9/L' : this.primljeniUzorci.bazofilniGranulociti,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : []),
            'retikulociti': new FormControl(
                this.primljeniUzorci.idUputnica ? this.primljeniUzorci.retikulociti + ' *10^9/L' : this.primljeniUzorci.retikulociti,
                !this.primljeniUzorci.idUputnica ?
                [Validators.required,
                UzorciValidations.isBroj()] : [])
        });
        //Prolazim kroz sve form controlove u formi
        for(const key in this.forma.controls){
            //Spremam im nazive
            this.nazivi.push(key);
        }

        const combined = merge(
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
            concatMap(odgovor => {
                //Ako odgovor servera nije null
                if(odgovor !== null){
                    let dialogRef = this.dialog.open(DialogComponent, {data: {message: odgovor.message}});
                    return dialogRef.afterClosed().pipe(
                        concatMap(result => {
                            //Ako je korisnik kliknuo "Izađi"
                            if(!result){
                                return this.obradaService.getPatientProcessing('sestra').pipe(
                                    tap((podatci) => {
                                        //Ako je pacijent aktivan
                                        if(podatci.success !== "false"){
                                            //Spremam ID obrade
                                            const idObrada: string = podatci[0].idObrada;
                                            //Spremam ID aktivnog pacijenta
                                            const idPacijent: number = +podatci[0].idPacijent;
                                            //Inicijaliziram novu cijenu
                                            const novaCijena: number = podatci[0].brojIskazniceDopunsko ? null : 20;
                                            //Inicijaliziram tip korisnika
                                            const tipKorisnik = 'sestra';
                                            //Spremam zadnje dodani ID uzorka
                                            const idUzorak: number = +odgovor.idUzorak;
                                            //Kreiram objekt "usluge"
                                            const usluge = {
                                                idRecept: null,
                                                idUputnica: null,
                                                idBMI: null,
                                                idUzorak: idUzorak
                                            };
                                            this.sharedService.postaviNovuCijenu(
                                                idObrada,
                                                novaCijena,
                                                tipKorisnik,
                                                usluge,
                                                idPacijent
                                            );
                                            //Emitiram event prema roditelju da je uzorak spremljen
                                            this.uzorakSpremljen.emit();
                                            //Emitiram prema "SekundarniHeaderComponent" da izađem iz uzoraka nakon spremanja
                                            this.onClose();
                                        }
                                    })
                                );
                            }
                            //Ako nije
                            else{
                                return of(null);
                            }
                        })
                    );
                }
                //Ako je odgovor servera null (upit je fail)
                else{
                    return of(null);
                }
            })
        ).subscribe();
    }

    //Metoda koja se pokreće kada korisnik želi izaći iz ovog prozora
    onClose(){
        this.close.emit();
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
