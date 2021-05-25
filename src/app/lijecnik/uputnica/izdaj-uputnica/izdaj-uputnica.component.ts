import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { tap, takeUntil, switchMap, take, mergeMap, concatMap } from 'rxjs/operators';
import { HeaderService } from 'src/app/shared/header/header.service';
import { ImportService } from 'src/app/shared/import.service';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
import { InicijalneDijagnoze } from './inicijalneDijagnoze.model';
import { ZdravstvenaDjelatnost } from 'src/app/shared/modeli/zdravstvenaDjelatnost.model';
import { ZdravstvenaUstanova } from 'src/app/shared/modeli/zdravstvenaUstanova.model';
import { SharedService } from 'src/app/shared/shared.service';
import * as SharedHandler from '../../../shared/shared-handler';
import * as SharedValidations from '../../../shared/shared-validations';
import { IzdajUputnicaService } from './izdajuputnica.service';
import * as UputnicaHandler from './izdaj-uputnica-handler';
import * as UputnicaValidators from './izdaj-uputnica-validators';
import { ZdravstveniRadnik } from 'src/app/shared/modeli/zdravstveniRadnik.model';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';

@Component({
  selector: 'app-izdaj-uputnica',
  templateUrl: './izdaj-uputnica.component.html',
  styleUrls: ['./izdaj-uputnica.component.css']
})
export class IzdajUputnicaComponent implements OnInit, OnDestroy{

    //Spremam pretplate
    pretplate = new Subject<boolean>();
    //Šaljem event roditeljskoj komponenti
    @Output() close = new EventEmitter<any>();
    //Šaljem event prema roditeljskoj komponenti da je uputnica izdana
    @Output() uputnicaIzdana = new EventEmitter<any>();
    //Primam podatke iz roditeljske komponente
    @Input() dijagnoze: Dijagnoza[];
    @Input() pacijenti: string[];
    @Input() zdravstveneUstanove: ZdravstvenaUstanova[];
    @Input() zdravstveneDjelatnosti: ZdravstvenaDjelatnost[];
    @Input() zdravstveniRadnici: ZdravstveniRadnik[];
    inicijalneDijagnoze: InicijalneDijagnoze[] = [];
    @Input() aktivniPacijent: string;
    //Definiram formu
    forma: FormGroup;
    //Spremam MKB šifre
    mkbSifre: string[] = [];
    //Spremam trenutno izabranu sekundarnu dijagnozu zbog validacije duplikata
    sekDijagnoza: string = null;
    //Spremam dijagnozu koja je ista kod primarne i kod sekundarne dijagnoze
    dijagnoza: string = null;
    //Spremam ID liječnika (korisnika)
    idLijecnik: number;
    //Spremam ID pacijenta kojemu ću pisati povijest bolesti
    idPacijent: number;
    //Oznaka hoće li se prikazati prozor za unos povijesti bolesti
    isPovijestBolesti: boolean = false;
    //Oznaka hoće li se prikazati polje za unos šifre specijalista
    isSpecijalist: boolean = false;
    //Kreiram polje u koje ću spremati inicijalne sekundarne dijagnoze
    sekundarnaDijagnozaPovijestBolesti: string[] = [];
    //Spremam naziv inicijalne primarne dijagnoze
    primarnaDijagnozaPovijestBolesti: string = null;
    //Spremam podatke povijesti bolesti u koju upisujem ID uputnice
    poslaniIDObrada: string = "";
    poslaniTipSlucaj: string = "";
    poslanoVrijeme: string = "";
    //Šaljem informaciju u "PrikaziPovijestBolestiComponent" da dolazim iz uputnice
    oznaka: string = null;
    //Vrste pregleda
    vrstePregleda: string[] = ['Dijagnostička pretraga'];

    constructor(
        //Dohvaćam header servis
        private headerService: HeaderService,
        //Dohvaćam servis izdavanja uputnice
        private izdajUputnicaService: IzdajUputnicaService,
        //Dohvaćam servis importa
        private importService: ImportService,
        //Dohvaćam shared servis
        private sharedService: SharedService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam dialog servis
        private dialog: MatDialog
    ) { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit() {
        //Prolazim kroz polje svih dijagnoza
        for(const dijagnoza of this.dijagnoze){
            //U polje MKB šifra dijagnoza dodavam svaki MKB dijagnoze iz importanog polja
            this.mkbSifre.push(dijagnoza.mkbSifra);
        }
        //Kreiram formu
        this.forma = new FormGroup({
            'primarnaDijagnoza': new FormControl(null,
                [Validators.required,
                SharedValidations.provjeriNazivDijagnoza(this.dijagnoze)]),
            'mkbPrimarnaDijagnoza': new FormControl(null, [Validators.required, SharedValidations.provjeriMKB(this.mkbSifre)]),
            'sekundarnaDijagnoza': new FormArray([
                new FormGroup({
                    'nazivSekundarna': new FormControl(null),
                    'mkbSifraSekundarna': new FormControl(null)
                },{validators: [SharedValidations.requiredMKBSifraSekundarna(), SharedValidations.provjeriMKBSifraSekundarna(this.mkbSifre)]})
            ],{validators: this.isValidSekundarnaDijagnoza.bind(this)}),
            'pacijent': new FormControl(this.aktivniPacijent ? this.aktivniPacijent : null,[Validators.required]),
            'tip': new FormControl('laboratorijskaDijagnostika'),
            'zdravstvenaDjelatnost': new FormGroup({
                'nazivZdrDjel': new FormControl(null,
                    [Validators.required,
                    UputnicaValidators.provjeriNazivZdrDjelatnosti(this.zdravstveneDjelatnosti)]),
                'sifZdrDjel': new FormControl(null,
                    [Validators.required,
                    Validators.pattern("^[0-9]*$"),
                    UputnicaValidators.provjeriSifruZdrDjelatnosti(this.zdravstveneDjelatnosti)])
            }),
            'zdravstvenaUstanova': new FormGroup({
                'nazivZdrUst': new FormControl(null),
                'sifZdrUst': new FormControl(null)
            }),
            'vrstaPregled': new FormControl('Dijagnostička pretraga', [Validators.required]),
            'specijalist': new FormGroup({
                'isPreporukaSpecijalist': new FormControl(false),
                'sifraSpecijalist': new FormControl(null),
                'tipSpecijalist': new FormControl(null)
            }),
            'molimTraziSe': new FormControl(null, [Validators.required]),
            'napomena': new FormControl(null)
        }, {validators: [this.isValidDijagnoze.bind(this)]});
        /**************************/
        //Onemogućavam inicijalno unos primarne dijagnoze dok se ne unese pacijent
        this.primarnaDijagnoza.disable({emitEvent: false});
        this.mkbPrimarnaDijagnoza.disable({emitEvent: false});
        //Onemogućavam inicijalno unos sekundarnih dijagnoza
        this.sekundarnaDijagnoza.disable({emitEvent: false});
        //Popuni lab. dijagnostika
        this.popuniLabDijagnostika();

        /*****************************/
        //Ako je PACIJENT AKTIVAN
        if(this.aktivniPacijent){
            //Dohvaćam MBO aktivnog pacijenta
            const polje = this.aktivniPacijent.split(" ");
            //Pretplaćivam se na podatke
            const combined = forkJoin([
                //Dohvaćam zadnje postavljene dijagnoze povijesti bolesti ove sesije obrade
                this.izdajUputnicaService.getInicijalneDijagnoze(+JSON.parse(localStorage.getItem("idObrada")), polje[2]),
                //Dohvaćam ID pacijenta
                this.importService.getIDPacijent(polje[2])
            ]).pipe(
                tap(podatci => {
                    //Spremam ID pacijenta
                    this.idPacijent = +podatci[1];
                    //Ako pacijent ima zapisanu povijest bolesti u ovoj sesiji obrade
                    if(podatci[0]){
                        //Definiram praznu varijablu
                        let obj;
                        //Prolazim kroz sve inicijalne dijagnoze aktivnog pacijenta koje je poslao server
                        for(const dijagnoza of podatci[0]){
                            //Kreiram svoj objekt
                            obj = new InicijalneDijagnoze(dijagnoza);
                            //Spremam ga u svoje polje
                            this.inicijalneDijagnoze.push(obj);
                        }
                        this.dohvatiInicijalneDijagnoze(this.inicijalneDijagnoze);
                        //Stavljam false u slučaju da je bilo true
                        this.isPovijestBolesti = false;
                        //Omogućavam unos primarne dijagnoze
                        this.primarnaDijagnoza.enable({emitEvent: false});
                        this.mkbPrimarnaDijagnoza.enable({emitEvent: false});
                        this.sekundarnaDijagnoza.enable({emitEvent: false});
                    }
                    //Ako pacijent NEMA zapisanu povijest bolesti u ovoj sesiji obrade
                    else{
                        //Šaljem oznaku childu da sam došao u njega iz uputnice
                        this.oznaka = 'uputnica';
                        //Otvaram prozor povijesti bolesti
                        this.isPovijestBolesti = true;
                    }
                })
            ).subscribe();
        }
        const combined = merge(
            //Pretplaćivam se na dohvat ID-a liječnika
            this.headerService.getIDLijecnik().pipe(
                tap(idLijecnik => {
                    //Spremam ID liječnika
                    this.idLijecnik = idLijecnik[0].idLijecnik;
                }),
                takeUntil(this.pretplate)
            ),
            //Slušam promjene u polju unosa primarne dijagnoze
            this.primarnaDijagnoza.valueChanges.pipe(
                tap(value => {
                    //Ako je taj unos ispravan
                    if(this.primarnaDijagnoza.valid){
                        //Pozivam metodu da popuni polje MKB šifre te dijagnoze
                        SharedHandler.nazivToMKB(value,this.dijagnoze,this.forma);
                        //Omogućavam unos sekundarnih dijagnoza
                        this.sekundarnaDijagnoza.enable({emitEvent: false});
                    }
                    //Ako je polje naziva primarne dijagnoze prazno
                    if(!this.primarnaDijagnoza.value || !this.primarnaDijagnoza.valid){
                        //Resetiraj polje MKB šifre primarne dijagnoze
                        this.mkbPrimarnaDijagnoza.patchValue(null,{emitEvent: false});
                        //Dok ne ostane jedna sekundarna dijagnoza u arrayu
                        while(this.getControlsSekundarna().length !== 1){
                            //Briši mu prvi element
                            (<FormArray>this.sekundarnaDijagnoza).removeAt(0);
                        }
                        //Kada je ostala jedna vrijednost sek. dijagnoze, resetiraj joj vrijednost i onemogući unos
                        this.sekundarnaDijagnoza.reset();
                        this.sekundarnaDijagnoza.disable({emitEvent: false});
                    }
                }),
                takeUntil(this.pretplate)
            ),
            //Slušam promjene u polju unosa MKB šifre primarne dijagnoze
            this.mkbPrimarnaDijagnoza.valueChanges.pipe(
                tap(value => {
                    //Ako je MKB ispravno unesen (ako je prošao validaciju)
                    if(this.mkbPrimarnaDijagnoza.valid){
                        //Prolazim kroz sve MKB šifre
                        for(const mkb of this.mkbSifre){
                            //Ako se upisana vrijednost nalazi u polju MKB šifri
                            if(mkb.toLowerCase() === value.toLowerCase()){
                                //U polje MKB šifri postavi šifru velikim slovima
                                this.mkbPrimarnaDijagnoza.patchValue(mkb,{emitEvent: false});
                            }
                        }
                        //Pozivam metodu da popuni polje naziva primarne dijagnoze
                        SharedHandler.MKBtoNaziv(this.mkbPrimarnaDijagnoza.value,this.dijagnoze,this.forma);
                        //Omogućavam unos sekundarne dijagnoze
                        this.sekundarnaDijagnoza.enable({emitEvent: false});
                    }
                    //Ako je MKB neispravno unesen
                    else{
                        //Postavi naziv primarne dijagnoze na null
                        this.primarnaDijagnoza.patchValue(null,{emitEvent: false});
                        //Dok ne ostane jedna sekundarna dijagnoza u arrayu
                        while(this.getControlsSekundarna().length !== 1){
                            //Briši mu prvi element
                            (<FormArray>this.sekundarnaDijagnoza).removeAt(0);
                        }
                        //Kada je ostala jedna vrijednost sek. dijagnoze, resetiraj joj vrijednost i onemogući unos
                        this.sekundarnaDijagnoza.reset();
                        this.sekundarnaDijagnoza.disable({emitEvent: false});
                    }
                }),
                takeUntil(this.pretplate)
            ),
            //Pretplaćivam se na promjene u nazivu (dropdownu) zdravstvene djelatnosti
            this.nazivZdrDjel.valueChanges.pipe(
                tap(naziv => {
                    //Ako je naziv zdr. djelatnosti ispravno unesen
                    if(this.nazivZdrDjel.valid){
                        //Pozivam metodu
                        UputnicaHandler.nazivZdrDjelToSif(this.forma,this.zdravstveneDjelatnosti,naziv);
                    }
                    //Ako je naziv zdr. djelatnosti neispravno unesen
                    else{
                        //Isprazni šifru zdr. djelatnosti
                        this.sifZdrDjel.patchValue(null, {emitEvent: false});
                    }
                }),
                takeUntil(this.pretplate)
            ),
            //Pretplaćivam se na promjene u polju šifre zdravstvene djelatnosti
            this.sifZdrDjel.valueChanges.pipe(
                tap(sifra => {
                    //Ako je šifra zdr. djelatnosti validna
                    if(this.sifZdrDjel.valid){
                        //Pozivam funkciju
                        UputnicaHandler.sifraZdrDjelToNaziv(this.forma,this.zdravstveneDjelatnosti,sifra);
                    }
                    //Ako nije ispravno unesena
                    else{
                        //Praznim polje naziva zdr. djelatnosti
                        this.nazivZdrDjel.patchValue(null, {emitEvent: false});
                    }
                }),
                takeUntil(this.pretplate)
            ),
            //Pretplaćivam se na promjene u polju naziva zdravstvene ustanove
            this.nazivZdrUst.valueChanges.pipe(
                tap(naziv => {
                    //Ako postoji vrijednost u nazivu zdr. ustanove
                    if(this.nazivZdrUst.value){
                        //Postavljam validatore
                        this.nazivZdrUst.setValidators([UputnicaValidators.provjeriNazivZdrUstanove(this.zdravstveneUstanove)]);
                        this.nazivZdrUst.updateValueAndValidity({emitEvent: false});
                    }
                    //Ako nema vrijednosti naziva zdr. ustanove
                    else{
                        //Dižem validatore
                        this.nazivZdrUst.clearValidators();
                        this.nazivZdrUst.updateValueAndValidity({emitEvent: false});
                    }
                    //Ako je naziv ispravno unesen
                    if(this.nazivZdrUst.valid){
                        //Pozivam metodu
                        UputnicaHandler.nazivZdrUstToSif(this.forma,this.zdravstveneUstanove,naziv);
                    }
                    //Ako je naziv zdr. ustanove neispravno unesen
                    else{
                        //Isprazni šifru zdr. ustanove
                        this.sifZdrUst.patchValue("", {emitEvent: false});
                    }
                }),
                takeUntil(this.pretplate)
            ),
            //Pretplaćivam se na promjene u polju šifre zdravstvene ustanove
            this.sifZdrUst.valueChanges.pipe(
                tap(sifra => {
                    //Ako je prazno polje šifre zdr. ustanove
                    if(this.sifZdrUst.value.length === 0){
                        //Uklanjam validatore
                        this.sifZdrUst.clearValidators();
                        this.sifZdrUst.updateValueAndValidity({emitEvent: false});
                        this.nazivZdrUst.clearValidators();
                        this.nazivZdrUst.updateValueAndValidity({emitEvent: false});
                        //Isprazni naziv zdr. ustanove
                        this.nazivZdrUst.patchValue(null, {emitEvent: false});
                    }
                    //Ako NIJE PRAZNO polje šifre zdr. ustanove
                    else{
                        //Postavljam validatore
                        this.sifZdrUst.setValidators([Validators.pattern("^[0-9]*$"),
                                                    UputnicaValidators.provjeriSifruZdrUstanove(this.zdravstveneUstanove)]);
                        this.sifZdrUst.updateValueAndValidity({emitEvent: false});
                        this.nazivZdrUst.setValidators([UputnicaValidators.provjeriNazivZdrUstanove(this.zdravstveneUstanove)]);
                        this.nazivZdrUst.updateValueAndValidity({emitEvent: false});
                        //Ako je šifra zdravstvene ustanove ispravno unesena
                        if(this.sifZdrUst.valid){
                            //Pozivam metodu
                            UputnicaHandler.sifraZdrUstToNaziv(this.forma,this.zdravstveneUstanove,sifra);
                        }
                        //Ako je šifra zdravstvene ustanove neispravno unesena
                        else{
                            //Isprazni naziv zdr. ustanove
                            this.nazivZdrUst.patchValue(null, {emitEvent: false});
                        }
                    }
                }),
                takeUntil(this.pretplate)
            ),
            //Pretplaćivam se na promjene u polju unosa šifre specijalista
            this.sifraSpecijalist.valueChanges.pipe(
                tap(value => {
                    //Ako šifra specijalista nije unesena
                    if(this.sifraSpecijalist.value.length === 0){
                        //Praznim polje tipa specijalista
                        this.tipSpecijalist.patchValue(null, {emitEvent: false});
                    }
                    //Pozivam funkciju koja puni polje tipa specijalista na osnovu unesene šifre specijalista
                    SharedHandler.sifraSpecijalistToTip(value,this.zdravstveniRadnici,this.forma,this.isSpecijalist);
                }),
                takeUntil(this.pretplate)
            )
        ).subscribe();
    }

    //Metoda koja popunjava vrijednosti lab. dijagnostike
    popuniLabDijagnostika(){
        //Inicijalno postavljam naziv i šifru zdr. djelatnosti na LABORATORIJSKU DIJAGNOSTIKU
        this.nazivZdrDjel.patchValue('Laboratorijska dijagnostika', {emitEvent: false});
        this.nazivZdrDjel.disable({emitEvent: false});
        //Tražim šifru lab. dijagnostike
        const sifDjel = this.zdravstveneDjelatnosti.filter(element => {
            if(element.nazivDjelatnosti === 'Laboratorijska dijagnostika'){
                return element.sifDjelatnosti;
            }
        });
        //Postavljam šifru lab. dijagnostike u polje
        this.sifZdrDjel.patchValue(sifDjel[0].sifDjelatnosti, {emitEvent: false});
        //Onemogućavam mijenjanje
        this.sifZdrDjel.disable({emitEvent: false});
        //Postavljam validator na naziv zdr. ustanove
        this.zdravstvenaUstanova.setValidators([UputnicaValidators.requiredZdrUstanova(this.tip.value)]);
        this.zdravstvenaUstanova.updateValueAndValidity({emitEvent: false});
        //Onemogućavam promjenu vrste pregleda sve dok je "LABORATORIJSKA DIJAGNOSTIKA" tip uputnice
        this.vrstaPregled.disable({emitEvent: false});
    }

    //Metoda koja se poziva kada liječnik promijeni tip uputnice
    onChangeTip($event: any){
        //Ako je tip uputnice "Laboratorijska dijagnostika"
        if($event.target.value === 'laboratorijskaDijagnostika'){
            //Postavi laboratorijsku dijagnostiku kao naziv djelatnosti
            this.nazivZdrDjel.patchValue('Laboratorijska dijagnostika', {emitEvent: false});
            //Onemogućavam mijenjanje
            this.nazivZdrDjel.disable({emitEvent: false});
            //Tražim šifru lab. dijagnostike
            const sifDjel = this.zdravstveneDjelatnosti.filter(element => {
                if(element.nazivDjelatnosti === 'Laboratorijska dijagnostika'){
                    return element.sifDjelatnosti;
                }
            });
            //Postavljam šifru lab. dijagnostike u polje
            this.sifZdrDjel.patchValue(sifDjel[0].sifDjelatnosti, {emitEvent: false});
            //Onemogućavam mijenjanje
            this.sifZdrDjel.disable({emitEvent: false});
            //Postavljam validator na naziv zdr. ustanove
            this.zdravstvenaUstanova.setValidators([UputnicaValidators.requiredZdrUstanova(this.tip.value)]);
            this.zdravstvenaUstanova.updateValueAndValidity({emitEvent: false});
            //Skraćivam polje da samo sadrži dijagnostičku pretragu
            this.vrstePregleda = [];
            this.vrstePregleda.push('Dijagnostička pretraga');
            //Postavljam vrstu pregleda na "DIJAGNOSTIČKA PRETRAGA" te onemogućavam promjene
            this.vrstaPregled.patchValue('Dijagnostička pretraga', {emitEvent: false});
            this.vrstaPregled.disable({emitEvent: false});
        }
        //Ako je tip uputnice "Specijalistička djelatnost"
        else{
            //Ako je polje naziva i šifre zdr. djel onemogućeno za unos
            if(this.nazivZdrDjel.disabled && this.sifZdrDjel.disabled){
                //Resetiram naziv i šifru zdr. djelatnosti te im OMOGUĆAVAM unos
                this.nazivZdrDjel.patchValue(null, {emitEvent: false});
                this.nazivZdrDjel.enable({emitEvent: false});
                this.sifZdrDjel.patchValue(null, {emitEvent: false});
                this.sifZdrDjel.enable({emitEvent: false});
            }
            //Postavljam validator na naziv zdr. ustanove
            this.zdravstvenaUstanova.clearValidators();
            this.zdravstvenaUstanova.updateValueAndValidity({emitEvent: false});
            //U vrste pregleda ubacivam "Specijalistički pregled", "Bolničko liječenje" te "Ambulantno liječenje"
            this.vrstePregleda.splice(0,1);
            this.vrstePregleda.push('Specijalistički pregled','Bolničko liječenje', 'Ambulantno liječenje');
            //Omogućavam unos vrste pregleda
            this.vrstaPregled.patchValue('Specijalistički pregled', {emitEvent: false});
            this.vrstaPregled.enable({emitEvent: false});
        }
    }

    //Metoda koja se poziva kada liječnik klikne checkbox "Preporučio specijalist"
    onChangeSpecijalist($event: any){
        //Ako je checkbox checked
        if($event.target.checked){
            //Označavam da se prikaže polje unosa šifre specijalista
            this.isSpecijalist = true;
            //Postavljam validatore na polje šifre specijalista
            SharedHandler.setValidatorsSifraSpecijalist(this.forma,this.zdravstveniRadnici,this.isSpecijalist);
        }
        //Ako checkbox nije checked
        else{
            //Označavam da se digne polje unosa šifre specijalista
            this.isSpecijalist = false;
            //Dižem validatore za specijalista
            this.sifraSpecijalist.clearValidators();
            this.sifraSpecijalist.updateValueAndValidity({emitEvent: false});
        }
    }

    //Metoda koja provjerava je li uneseno više istih sekundarnih dijagnoza
    isValidSekundarnaDijagnoza(array: FormArray): {[key: string]: boolean}{
        //Kreiram pomoćno polje
        let pom = [];
        //Prolazim kroz array
        for(let control of array.controls){
            //Ako se vrijednost sekundarne dijagnoze VEĆ NALAZI u pom polju, ali da nije "Odaberite sekundarnu dijagnozu"
            if(pom.indexOf(control.value.nazivSekundarna) !== -1 && control.value.nazivSekundarna !== null){
                //U svoju varijablu spremam sekundarnu dijagnozu koja je duplikat
                this.sekDijagnoza = control.value.nazivSekundarna;
                return {'duplikat': true};
            }
            //Ako se vrijednost sekundarne dijagnoze NE NALAZI u pom polju
            else{
                //Dodaj ga u pom polje
                pom.push(control.value.nazivSekundarna);
            }
        }
        return null;
    }

    //Metoda koja provjerava je li primarna dijagnoza ista kao i neka od sekundarnih dijagnoza
    isValidDijagnoze(group: FormGroup): {[key: string]: boolean} | null{
        //Prolazim kroz polje sekundarnih dijagnoza
        for(let control of (group.get('sekundarnaDijagnoza') as FormArray).controls){
            //Ako je vrijednost primarne dijagnoze jednaka vrijednosti sekundarne dijagnoze, ali da oba dvije nisu null, jer bih bilo (Odaberite dijagnozu === Odaberite dijagnozu)
            if(group.get('primarnaDijagnoza').value === control.value.nazivSekundarna
                && (group.get('primarnaDijagnoza') !== null && control.value.nazivSekundarna !== null)){
                //Spremam vrijednost sekundarne dijagnoze koja je jednaka primarnoj dijagnozi
                this.dijagnoza = control.value.nazivSekundarna;
                return {'primarnaJeIstaKaoSekundarna': true};
            }
        }
        return null;
    }

    //Metoda koja se poziva kada liječnik promijeni pacijenta u dropdownu
    onChangePacijent($event: any){
        //Splitam pacijentove podatke u polje
        const polje = $event.target.value.split(" ");
        //Ako pacijent NIJE TRENUTNO AKTIVAN u obradi
        if(JSON.parse(localStorage.getItem("idObrada")) === null){
            //Pretplaćivam se na Subject u kojemu se nalaze ID-evi pacijenata kojima je već unesena povijest bolesti
            this.sharedService.pacijentiIDsObs.pipe(
                take(1),
                switchMap(pacijentiIDs => {
                    //Pretplaćivam se na dohvat ID-a pacijenta kojega je liječnik izabrao u dropdownu
                    return this.importService.getIDPacijent(polje[2]).pipe(
                        switchMap(idPacijent => {
                            //Ako se ID pacijenta kojemu je kliknut redak NALAZI u polju ID-ova (tj. njemu je dodana povijest bolesti)
                            if(pacijentiIDs.indexOf(+idPacijent) !== -1){
                                //Dohvaćam zadnje dodani SLUČAJNI ID obrade za ovog pacijenta
                                return this.sharedService.getRandomIDObrada(+idPacijent).pipe(
                                    switchMap(idObrada => {
                                        //Dohvaćam zadnje dodane dijagnoze povijesti bolesti za ovog pacijenta (INICIJALNE)
                                        return this.izdajUputnicaService.getInicijalneDijagnoze(+idObrada, polje[2]).pipe(
                                            tap(dijagnoze => {
                                                //Ako postoje dodane dijagnoze
                                                if(dijagnoze){
                                                    //Restartam polje inicijalnih dijagnoza
                                                    this.inicijalneDijagnoze = [];
                                                    //Definiram praznu varijablu
                                                    let obj;
                                                    //Prolazim kroz sve inicijalne dijagnoze aktivnog pacijenta koje je poslao server
                                                    for(const dijagnoza of dijagnoze){
                                                        //Kreiram svoj objekt
                                                        obj = new InicijalneDijagnoze(dijagnoza);
                                                        //Spremam ga u svoje polje
                                                        this.inicijalneDijagnoze.push(obj);
                                                    }
                                                    this.dohvatiInicijalneDijagnoze(this.inicijalneDijagnoze);
                                                    //Stavljam false u slučaju da je bilo true
                                                    this.isPovijestBolesti = false;
                                                    //Omogućavam unos primarne dijagnoze
                                                    this.primarnaDijagnoza.enable({emitEvent: false});
                                                    this.mkbPrimarnaDijagnoza.enable({emitEvent: false});
                                                    this.sekundarnaDijagnoza.enable({emitEvent: false});
                                                    //Spremam ID pacijenta
                                                    this.idPacijent = +idPacijent;
                                                }
                                            })
                                        );
                                    })
                                );
                            }
                            //Ako se ID pacijenta kojemu je kliknut redak NE NALAZI u polju ID-ova (tj. njemu NIJE dodana povijest bolesti)
                            else{
                                return of(null).pipe(
                                    tap(() => {
                                        //Resetiram polje inicijalnih dijagnoza
                                        this.inicijalneDijagnoze = [];
                                        //Praznim polja primarne i sekundarnih dijagnoza
                                        this.sekundarnaDijagnoza.clear();
                                        //Resetiram svoje polje sekundarnih dijagnoza
                                        this.sekundarnaDijagnozaPovijestBolesti = [];
                                        //Dodavam jedan form control u polje sekundarnih dijagnoza
                                        this.onAddDiagnosis();
                                        //Resetiram primarnu dijagnozu
                                        this.primarnaDijagnoza.reset();
                                        //Praznim sva polja
                                        this.isprazniPolja();
                                        //Spremam ID pacijenta
                                        this.idPacijent = +idPacijent;
                                        //Šaljem oznaku childu da sam došao u njega iz uputnice
                                        this.oznaka = 'uputnica';
                                        //Otvaram prozor povijesti bolesti
                                        this.isPovijestBolesti = true;
                                    })
                                );
                            }
                        })
                    );
                })
            ).subscribe();
        }
        //Ako je pacijent AKTIVAN u obradi
        else{
            //Pretplaćivam se na informaciju je li unesena povijest bolesti za kliknutog pacijenta za ovu sesiju obrade
            const combined = forkJoin([
                //Dohvaćam iz LocalStorage-a trenutni ID-obrade i šaljem MBO pacijenta kliknutog retka
                this.izdajUputnicaService.isUnesenaPovijestBolesti(+JSON.parse(localStorage.getItem("idObrada")), polje[2]).pipe(
                    switchMap(brojPovijestiBolesti => {
                        //Ako ovaj pacijent NEMA upisanu povijest bolesti za ovu sesiju
                        if(+brojPovijestiBolesti === 0){
                            //Praznim polja primarne i sekundarnih dijagnoza
                            this.sekundarnaDijagnoza.clear();
                            //Resetiram svoje polje sekundarnih dijagnoza
                            this.sekundarnaDijagnozaPovijestBolesti = [];
                            //Dodavam jedan form control u polje sekundarnih dijagnoza
                            this.onAddDiagnosis();
                            //Resetiram primarnu dijagnozu
                            this.primarnaDijagnoza.reset();
                            //Praznim sve unose
                            this.isprazniPolja();
                            //Šaljem oznaku childu da sam došao u njega iz uputnice
                            this.oznaka = 'uputnica';
                            //Otvaram prozor unosa povijesti bolesti
                            this.isPovijestBolesti = true;
                            return of(null);
                        }
                        //Ako ovaj pacijent IMA upisanu povijest bolesti za ovu sesiju
                        else{
                            //Dohvaćam zadnje postavljene dijagnoze povijesti bolesti ove sesije obrade
                            return this.izdajUputnicaService.getInicijalneDijagnoze(+JSON.parse(localStorage.getItem("idObrada")), polje[2]).pipe(
                                tap(dijagnoze => {
                                    //Restartam polje inicijalnih dijagnoza
                                    this.inicijalneDijagnoze = [];
                                    //Definiram praznu varijablu
                                    let obj;
                                    //Prolazim kroz sve inicijalne dijagnoze aktivnog pacijenta koje je poslao server
                                    for(const dijagnoza of dijagnoze){
                                        //Kreiram svoj objekt
                                        obj = new InicijalneDijagnoze(dijagnoza);
                                        //Spremam ga u svoje polje
                                        this.inicijalneDijagnoze.push(obj);
                                    }
                                    this.dohvatiInicijalneDijagnoze(this.inicijalneDijagnoze);
                                    //Stavljam false u slučaju da je bilo true
                                    this.isPovijestBolesti = false;
                                    //Omogućavam unos primarne dijagnoze
                                    this.primarnaDijagnoza.enable({emitEvent: false});
                                    this.mkbPrimarnaDijagnoza.enable({emitEvent: false});
                                    this.sekundarnaDijagnoza.enable({emitEvent: false});
                                })
                            );
                        }
                    })
                ),
                //Pretplaćivam se na dohvat ID-a pacijenta kojega je liječnik izabrao u dropdownu
                this.importService.getIDPacijent(polje[2]).pipe(
                    tap(idPacijent => {
                        //Spremam ID pacijenta
                        this.idPacijent = +idPacijent;
                    })
                )
            ]).subscribe();
        }
    }

    //Ova metoda se poziva kada se promijeni naziv sekundarne dijagnoze
    onChangeNazivSekundarna(nazivSekundarna: string, index: number){
        //Pozivam metodu koja će automatski unijeti MKB šifru sekundarne dijagnoze
        SharedHandler.nazivToMKBSekundarna(nazivSekundarna,this.dijagnoze,this.forma,index);
    }

    //Metoda koja se poziva kada liječnik klikne "Izdaj uputnicu"
    onSubmit(){
        //Ako forma nije valjana
        if(!this.forma.valid){
            return;
        }
        //Pomoćno polje u koje spremam samo MKB šifre sek. dijagnoza
        let mkbPolje: string[] = [];
        //Prolazim kroz polje sekundarnih dijagnoza i uzimam samo MKB šifre
        for(const el of this.getControlsSekundarna()){
            if(el.value.mkbSifraSekundarna !== null){
                mkbPolje.push(el.value.mkbSifraSekundarna);
            }
        }
        //Definiram MKB šifru tražene dijagnoze
        let poslanaMKBSifra="";
        //Tražim MKB šifru primarne dijagnoze koja se nalazi u povijesti bolesti u koju želim upisati ID uputnice
        for(const dijagnoza of this.dijagnoze){
            if(this.primarnaDijagnozaPovijestBolesti === dijagnoza.imeDijagnoza){
                poslanaMKBSifra = dijagnoza.mkbSifra;
            }
        }
        this.izdajUputnicaService.izdajUputnicu(
           this.sifZdrUst.value,
           this.sifZdrDjel.value,
           this.idPacijent,
           this.sifraSpecijalist.value,
           this.mkbPrimarnaDijagnoza.value,
           mkbPolje,
           this.vrstaPregled.value,
           this.molimTraziSe.value,
           this.napomena.value,
           poslanaMKBSifra,
           this.poslaniIDObrada,
           this.poslaniTipSlucaj,
           this.poslanoVrijeme,
           this.idLijecnik
        ).pipe(
            concatMap((odgovor) => {
                let dialogRef = this.dialog.open(DialogComponent, {data: {message: odgovor.message}});
                //Ako je server vratio potvrdi odgovor
                if(odgovor.success === "true"){
                    return dialogRef.afterClosed().pipe(
                        concatMap(result => {
                            //Ako je korisnik kliknuo "Izađi"
                            if(!result){
                                //Pretplaćivam se na informaciju je li pacijent aktivan ili nije
                                return this.obradaService.getPatientProcessing('lijecnik').pipe(
                                    tap(podatci => {
                                        //Ako pacijent NIJE AKTIVAN
                                        if(podatci.success === "false"){
                                            //Filtriram polje ID-eva pacijenata
                                            this.sharedService.filterPacijentiIDs(this.idPacijent.toString());
                                        }
                                    }),
                                    mergeMap(() => {
                                        //Pretplaćivam se na informaciju je li pacijent kojemu izdavam uputnicu ima dopunsko osiguranje
                                        return this.sharedService.getDopunsko(this.idPacijent).pipe(
                                            tap(dopunsko => {
                                                    //Kreiram JS objekt koji sadrži usluge koje treba poslati zbog tablice "racun"
                                                    const usluge = {
                                                        idRecept: null,
                                                        idUputnica: +odgovor.idUputnica,
                                                        idBMI: null,
                                                        idUzorak: null
                                                    };
                                                    //Naplaćujem izdavanje uputnice
                                                    this.sharedService.postaviNovuCijenu(
                                                        this.poslaniIDObrada,
                                                        dopunsko ? null : 30,
                                                        'lijecnik',
                                                        usluge,
                                                        this.idPacijent);
                                            })
                                        );
                                    }),
                                    tap(() => {
                                        //Emitiram event prema roditelju da zna da je dodana nova uputnica
                                        this.uputnicaIzdana.emit();
                                        this.onCloseAlert();
                                    })
                                );
                            }
                            //Ako je korisnik kliknuo nešto drugo (nema toga)
                            else{
                                return of(null);
                            }
                        })
                    );
                }
                //Ako je server vratio error
                else{
                    return dialogRef.afterClosed();
                }
            })
        ).subscribe();
    }

    //Metoda koja prazni sva polja
    isprazniPolja(){
        this.nazivZdrDjel.patchValue(null, {emitEvent: false});
        this.sifZdrDjel.patchValue(null, {emitEvent: false});
        this.nazivZdrUst.patchValue(null, {emitEvent: false});
        this.sifZdrUst.patchValue(null, {emitEvent: false});
        //Gasim specijalista
        this.isPreporukaSpecijalist.patchValue(false, {emitEvent: false});
        this.isSpecijalist = false;
        this.sifraSpecijalist.patchValue("", {emitEvent: false});
        this.tipSpecijalist.patchValue(null, {emitEvent: false});
        //Praznim ostala polja
        this.molimTraziSe.patchValue(null, {emitEvent: false});
        this.napomena.patchValue(null, {emitEvent: false});
        //Uklanjam validatore
        this.sifZdrUst.clearValidators();
        this.sifZdrUst.updateValueAndValidity({emitEvent: false});
        this.nazivZdrUst.clearValidators();
        this.nazivZdrUst.updateValueAndValidity({emitEvent: false});
    }

    //Kada se klikne button "Dodaj dijagnozu"
    onAddDiagnosis(){
        //Kreiram novi form group
        const formGroup = new FormGroup({
            'nazivSekundarna': new FormControl(null),
            'mkbSifraSekundarna': new FormControl(null)
        },{validators: [SharedValidations.requiredMKBSifraSekundarna(),SharedValidations.provjeriMKBSifraSekundarna(this.mkbSifre)]});
        //Nadodavam novi form group u form array
        (<FormArray>this.forma.get('sekundarnaDijagnoza')).push(formGroup);
    }
    //Ova metoda se poziva kada se liječnik krene upisivati vrijednosti u polja MKB šifri sek. dijagnoze
    onChangeMKB(mkbSifra: string,index:number){
      //Ako je MKB ispravno unesen (ako je prošao validaciju)
      if(this.sekundarnaDijagnoza.at(index).valid){
          //Prolazim kroz sve MKB šifre
          for(const mkb of this.mkbSifre){
              //Ako se upisana vrijednost nalazi u polju MKB šifri
              if(mkb.toLowerCase() === mkbSifra.toLowerCase()){
                  //U polje MKB šifri postavi šifru velikim slovima
                  (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('mkbSifraSekundarna').patchValue(mkb,{emitEvent: false});
              }
          }
          //Pozivam metodu da popuni polje naziva primarne dijagnoze
          SharedHandler.MKBtoNazivSekundarna(mkbSifra,this.dijagnoze,this.forma,index);
      }
      //Ako je MKB neispravno unesen
      else{
          (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('nazivSekundarna').patchValue(null,{emitEvent: false});
      }
    }

    //Metoda koja služi za dohvat svih kontrolova unutar polja
    getControlsSekundarna(){
        return (<FormArray>this.forma.get('sekundarnaDijagnoza')).controls;
    }

    //Kada se klikne button "X"
    onDeleteDiagnosis(index: number){
        //Obriši form group na indexu kliknutog retka
        this.sekundarnaDijagnoza.removeAt(index);
    }

    //Ova metoda se poziva kada liječnik izađe iz ovog prozora
    onClose(){
        this.close.emit();
    }

    //Metoda koja se poziva kada liječnik želi izaći iz prozora povijesti bolesti
    onClosePovijestBolesti($event: {idPacijent: number, potvrden: boolean}){
        //Ako je liječnik POTVRDIO povijest bolesti
        if($event.potvrden){
            //Spremam ID pacijenta
            this.idPacijent = $event.idPacijent;
            //Dohvaćam MBO pacijenta kojemu se upravo upisao povijest bolesti te ga prosljeđujem metodi koja dohvaća njegove inicijalne dijagnoze
            this.importService.getMBOPacijent($event.idPacijent).pipe(
                switchMap(mboPacijent => {
                    //Dohvaćam zadnje dodani ID obrade (ID obrade koji sam unio u povijesti bolesti koju sam sad zatvorio)
                    return this.sharedService.getRandomIDObrada($event.idPacijent).pipe(
                        switchMap(idObrada => {
                            //Dohvaćam zadnje postavljene dijagnoze povijesti bolesti ove sesije obrade
                            return this.izdajUputnicaService.getInicijalneDijagnoze(+idObrada, mboPacijent).pipe(
                                tap(dijagnoze => {
                                    //Restartam polje inicijalnih dijagnoza
                                    this.inicijalneDijagnoze = [];
                                    //Zatvaram prozor
                                    this.isPovijestBolesti = false;
                                    //Definiram praznu varijablu
                                    let obj;
                                    //Prolazim kroz sve inicijalne dijagnoze aktivnog pacijenta koje je poslao server
                                    for(const dijagnoza of dijagnoze){
                                        //Kreiram svoj objekt
                                        obj = new InicijalneDijagnoze(dijagnoza);
                                        //Spremam ga u svoje polje
                                        this.inicijalneDijagnoze.push(obj);
                                    }
                                    this.dohvatiInicijalneDijagnoze(this.inicijalneDijagnoze);
                                    //Omogućavam unos primarne dijagnoze
                                    this.primarnaDijagnoza.enable({emitEvent: false});
                                    this.mkbPrimarnaDijagnoza.enable({emitEvent: false});
                                    this.sekundarnaDijagnoza.enable({emitEvent: false});
                                    //Popuni lab. dijagnostiku
                                    this.popuniLabDijagnostika();
                                })
                            );
                        })
                    );
                })
            ).subscribe();
        }
        //Ako liječnik NIJE POTVRDIO povijest bolesti
        else{
            //Ako je pacijent AKTIVAN u obradi
            if(this.aktivniPacijent){
                //Dohvaćam MBO aktivnog pacijenta
                const polje = this.aktivniPacijent.split(" ");
                //Dohvaćam zadnje postavljene dijagnoze povijesti bolesti ove sesije obrade
                this.izdajUputnicaService.getInicijalneDijagnoze(
                    +JSON.parse(localStorage.getItem("idObrada")),
                    polje[2]).pipe(
                    tap(podatci => {
                        //Ako pacijent ima zapisanu povijest bolesti u ovoj sesiji obrade
                        if(podatci){
                            //Restartam polje inicijalnih dijagnoza
                            this.inicijalneDijagnoze = [];
                            //Definiram praznu varijablu
                            let obj;
                            //Prolazim kroz sve inicijalne dijagnoze aktivnog pacijenta koje je poslao server
                            for(const dijagnoza of podatci){
                                //Kreiram svoj objekt
                                obj = new InicijalneDijagnoze(dijagnoza);
                                //Spremam ga u svoje polje
                                this.inicijalneDijagnoze.push(obj);
                            }
                            this.dohvatiInicijalneDijagnoze(this.inicijalneDijagnoze);
                            //Popuni lab. dijagnostiku
                            this.popuniLabDijagnostika();
                            //Polje pacijenta popunjavam vrijednosti [ime prezime MBO] aktivnog pacijenta
                            this.pacijent.patchValue(this.aktivniPacijent, {emitEvent: false});
                            //Stavljam false u slučaju da je bilo true
                            this.isPovijestBolesti = false;
                        }
                    })
                ).subscribe();
            }
            //Ako pacijent NIJE AKTIVAN u obradi
            else{
                //Postavljam vrijednost izabranog pacijenta na null
                this.pacijent.patchValue(null, {emitEvent: false});
                //Samo zatvori prozor povijesti bolesti
                this.isPovijestBolesti = false;
            }
        }
    }

    //Metoda koja će postaviti sve dijagnoze koje su postavljene u zadnjoj povijesti bolesti
    dohvatiInicijalneDijagnoze(dijagnoze: InicijalneDijagnoze[]){
        //Omogućavam unos sekundarne dijagnoze koja je inicijalno disable
        this.sekundarnaDijagnoza.enable({emitEvent: false});
        this.sekundarnaDijagnoza.clear();
        //Resetiram svoje polje sekundarnih dijagnoza
        this.sekundarnaDijagnozaPovijestBolesti = [];
        //Dodavam jedan form control u polje sekundarnih dijagnoza
        this.onAddDiagnosis();
        //Prolazim poljem odgovora servera
        for(let dijagnoza of dijagnoze){
            //Spremam ID obrade liječnika koji šaljem backendu
            this.poslaniIDObrada = dijagnoza.idObradaLijecnik.toString();
            //Spremam tip slučaja
            this.poslaniTipSlucaj = dijagnoza.tipSlucaj;
            //Spremam vrijeme
            this.poslanoVrijeme = dijagnoza.vrijeme.toString();
            //Spremam naziv primarne dijagnoze povezane povijesti bolesti
            this.primarnaDijagnozaPovijestBolesti = dijagnoza.nazivPrimarna;
            //Ako ima sek. dijagnoza
            if(dijagnoza.nazivSekundarna){
                //U polje sekundarnih dijagnoza spremam sve sekundarne dijagnoze povezane povijesti bolesti
                this.sekundarnaDijagnozaPovijestBolesti.push(dijagnoza.nazivSekundarna);
            }
            //Za svaku sekundarnu dijagnozu sa servera NADODAVAM JEDAN FORM CONTROL
            this.onAddDiagnosis();
        }
        //BRIŠEM ZADNJI FORM CONTROL da ne bude jedan viška
        this.onDeleteDiagnosis(-1);
        //Postavljam vrijednost naziva primarne dijagnoze na vrijednost koju sam dobio sa servera
        this.primarnaDijagnoza.patchValue(this.primarnaDijagnozaPovijestBolesti,{emitEvent: false});
        //Postavljam MKB šifru na osnove odabranog naziva primarne dijagnoze
        SharedHandler.nazivToMKB(this.primarnaDijagnozaPovijestBolesti,this.dijagnoze,this.forma);
        //Ako uopće ima sek. dijagnoza
        if(this.sekundarnaDijagnozaPovijestBolesti.length > 0){
            //Prolazim kroz sve prikupljene nazive sekundarnih dijagnoza sa servera
            this.sekundarnaDijagnozaPovijestBolesti.forEach((element,index) => {
                //U polju naziva sekundarnih dijagnoza postavljam prikupljena imena sek. dijagnoza na određenom indexu
                (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('nazivSekundarna').patchValue(element,{emitEvent: false});
                //Postavljam MKB šifre sek.dijagnoza
                SharedHandler.nazivToMKBSekundarna(element,this.dijagnoze,this.forma,index);
            });
        }
    }

    //Metoda koja se poziva kada liječnik želi zatvoriti prozor alerta
    onCloseAlert(){
        //Emitiram vrijednost prema roditeljskoj komponenti da izađem iz ovog prozora
        this.close.emit();
    }

    //Ova metoda se pokreće kada se komponenta uništi
    ngOnDestroy(){
        this.pretplate.next(true);
        this.pretplate.complete();
    }

    //Getteri za dijelove forme
    get primarnaDijagnoza(): FormControl{
        return this.forma.get('primarnaDijagnoza') as FormControl;
    }
    get mkbPrimarnaDijagnoza(): FormControl{
        return this.forma.get('mkbPrimarnaDijagnoza') as FormControl;
    }
    get sekundarnaDijagnoza(): FormArray{
        return this.forma.get('sekundarnaDijagnoza') as FormArray;
    }
    get pacijent(): FormControl{
        return this.forma.get('pacijent') as FormControl;
    }
    get tip(): FormControl{
        return this.forma.get('tip') as FormControl;
    }
    get zdravstvenaDjelatnost(): FormGroup{
        return this.forma.get('zdravstvenaDjelatnost') as FormGroup;
    }
    get nazivZdrDjel(): FormControl{
        return this.forma.get('zdravstvenaDjelatnost.nazivZdrDjel') as FormControl;
    }
    get sifZdrDjel(): FormControl{
        return this.forma.get('zdravstvenaDjelatnost.sifZdrDjel') as FormControl;
    }
    get zdravstvenaUstanova(): FormGroup{
        return this.forma.get('zdravstvenaUstanova') as FormGroup;
    }
    get nazivZdrUst(): FormControl{
        return this.forma.get('zdravstvenaUstanova.nazivZdrUst') as FormControl;
    }
    get sifZdrUst(): FormControl{
        return this.forma.get('zdravstvenaUstanova.sifZdrUst') as FormControl;
    }
    get vrstaPregled(): FormControl{
        return this.forma.get('vrstaPregled') as FormControl;
    }
    get specijalist(): FormGroup{
        return this.forma.get('specijalist') as FormGroup;
    }
    get isPreporukaSpecijalist(): FormControl{
        return this.forma.get('specijalist.isPreporukaSpecijalist') as FormControl;
    }
    get sifraSpecijalist(): FormControl{
        return this.forma.get('specijalist.sifraSpecijalist') as FormControl;
    }
    get tipSpecijalist(): FormControl{
        return this.forma.get('specijalist.tipSpecijalist') as FormControl;
    }
    get molimTraziSe(): FormControl{
        return this.forma.get('molimTraziSe') as FormControl;
    }
    get napomena(): FormControl{
        return this.forma.get('napomena') as FormControl;
    }
}
