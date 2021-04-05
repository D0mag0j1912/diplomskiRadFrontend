import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { tap, takeUntil, switchMap } from 'rxjs/operators';
import { HeaderService } from 'src/app/shared/header/header.service';
import { ImportService } from 'src/app/shared/import.service';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
import { InicijalneDijagnoze } from 'src/app/shared/modeli/inicijalneDijagnoze.model';
import { ZdravstvenaDjelatnost } from 'src/app/shared/modeli/zdravstvenaDjelatnost.model';
import { ZdravstvenaUstanova } from 'src/app/shared/modeli/zdravstvenaUstanova.model';
import { SharedService } from 'src/app/shared/shared.service';
import * as SharedHandler from '../../../shared/shared-handler';
import * as SharedValidations from '../../../shared/shared-validations';
import { IzdajUputnicaService } from './izdajuputnica.service';

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
    //Primam podatke iz roditeljske komponente
    @Input() dijagnoze: Dijagnoza[];
    @Input() pacijenti: string[];
    @Input() zdravstveneUstanove: ZdravstvenaUstanova[];
    @Input() zdravstveneDjelatnosti: ZdravstvenaDjelatnost[];
    @Input() inicijalneDijagnoze: InicijalneDijagnoze[];
    @Input() aktivniPacijent: string;
    //Definiram formu
    forma: FormGroup;
    //Spremam MKB šifre
    mkbSifre: string[] = [];
    //Spremam nazive dijagnoza
    naziviDijagnoze: string[] = [];
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
    //Kreiram polje u koje ću spremati inicijalne sekundarne dijagnoze
    sekundarnaDijagnozaPovijestBolesti: string[] = [];
    //Spremam naziv inicijalne primarne dijagnoze
    primarnaDijagnozaPovijestBolesti: string = null;
    //Spremam podatke koje šaljem backendu
    poslaniIDObrada: string = "";
    poslaniTipSlucaj: string = "";
    poslanoVrijeme: string = "";

    constructor(
        //Dohvaćam header servis
        private headerService: HeaderService,
        //Dohvaćam servis izdavanja uputnice
        private izdajUputnicaService: IzdajUputnicaService,
        //Dohvaćam servis importa
        private importService: ImportService,
        //Dohvaćam shared servis
        private sharedService: SharedService
    ) { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit() {
        //Prolazim kroz polje svih dijagnoza
        for(const dijagnoza of this.dijagnoze){
            //U polje naziva dijagnoza dodavam svaki naziv dijagnoze iz importanog polja
            this.naziviDijagnoze.push(dijagnoza.imeDijagnoza);
            //U polje MKB šifra dijagnoza dodavam svaki MKB dijagnoze iz importanog polja
            this.mkbSifre.push(dijagnoza.mkbSifra);
        }
        //Kreiram formu
        this.forma = new FormGroup({
            'primarnaDijagnoza': new FormControl(null, [Validators.required]),
            'mkbPrimarnaDijagnoza': new FormControl(null, [Validators.required,SharedValidations.provjeriMKB(this.mkbSifre)]),
            'sekundarnaDijagnoza': new FormArray([
                new FormGroup({
                    'nazivSekundarna': new FormControl(null),
                    'mkbSifraSekundarna': new FormControl(null)
                },{validators: [SharedValidations.requiredMKBSifraSekundarna(),SharedValidations.provjeriMKBSifraSekundarna(this.mkbSifre)]})  
            ],{validators: this.isValidSekundarnaDijagnoza.bind(this)}),
            'pacijent': new FormControl(this.aktivniPacijent ? this.aktivniPacijent : null,[Validators.required])
        }, {validators: [this.isValidDijagnoze.bind(this)]});
        //Onemogućavam inicijalno unos primarne dijagnoze dok se ne unese pacijent
        this.primarnaDijagnoza.disable({emitEvent: false});
        this.mkbPrimarnaDijagnoza.disable({emitEvent: false});
        //Onemogućavam inicijalno unos sekundarnih dijagnoza
        this.sekundarnaDijagnoza.disable({emitEvent: false});
        //Ako je PACIJENT AKTIVAN
        if(this.aktivniPacijent){
            this.dohvatiInicijalneDijagnoze(this.inicijalneDijagnoze);
            //Stavljam false u slučaju da je bilo true
            this.isPovijestBolesti = false;
            //Omogućavam unos primarne dijagnoze
            this.primarnaDijagnoza.enable({emitEvent: false});
            this.mkbPrimarnaDijagnoza.enable({emitEvent: false});
            this.sekundarnaDijagnoza.enable({emitEvent: false});
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
                    console.log("U promjenama primarne dijagnoze sam!");
                    //Ako se unesena vrijednost NALAZI u nazivima dijagnoza, onda znam da je liječnik unio vrijednost primarne dijagnoze
                    if(this.naziviDijagnoze.indexOf(value) !== -1){
                        //Ako je taj unos ispravan
                        if(this.primarnaDijagnoza.valid){
                            //Pozivam metodu da popuni polje MKB šifre te dijagnoze
                            SharedHandler.nazivToMKB(value,this.dijagnoze,this.forma);
                            //Omogućavam unos sekundarnih dijagnoza
                            this.sekundarnaDijagnoza.enable({emitEvent: false});
                        }
                    }
                    //Ako je polje naziva primarne dijagnoze prazno 
                    if(!this.primarnaDijagnoza.value){
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
                    console.log("u promjenama mkb šifre dijagnoze sam!");
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
            )
        ).subscribe();
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
            //Pretplaćivam se na dohvat ID-a pacijenta kojega je liječnik izabrao u dropdownu
            this.importService.getIDPacijent(polje[2]).pipe(
                tap(idPacijent => {
                    //Otvaram prozor povijesti bolesti
                    this.isPovijestBolesti = true;
                    //Spremam ID pacijenta
                    this.idPacijent = +idPacijent;
                    //Pomoću Subjecta informiram child komponentu "PrikaziPovijestBolesti" da sam došao iz izdavanja uputnice
                    this.sharedService.receptIliUputnica.next("uputnica");
                }),
                takeUntil(this.pretplate)
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
                            //Otvaram prozor unosa povijesti bolesti
                            this.isPovijestBolesti = true;
                            //Pomoću Subjecta informiram child komponentu "PrikaziPovijestBolesti" da sam došao iz izdavanja uputnice
                            this.sharedService.receptIliUputnica.next("uputnica");
                            return of(null).pipe(
                                takeUntil(this.pretplate)
                            );
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
                                }),
                                takeUntil(this.pretplate)
                            );
                        } 
                    }),
                    takeUntil(this.pretplate)
                ),
                //Pretplaćivam se na dohvat ID-a pacijenta kojega je liječnik izabrao u dropdownu
                this.importService.getIDPacijent(polje[2]).pipe(
                    tap(idPacijent => {
                        //Spremam ID pacijenta
                        this.idPacijent = +idPacijent;
                    }),
                    takeUntil(this.pretplate)
                )
            ]).pipe(
                takeUntil(this.pretplate)
            ).subscribe(); 
        }
    }

    //Ova metoda se poziva kada se promijeni naziv sekundarne dijagnoze
    onChangeNazivSekundarna(nazivSekundarna: string, index: number){
        //Pozivam metodu koja će automatski unijeti MKB šifru sekundarne dijagnoze
        SharedHandler.nazivToMKBSekundarna(nazivSekundarna,this.dijagnoze,this.forma,index);
    }

    //Metoda koja se poziva kada liječnik klikne "Izdaj uputnicu"
    onSubmit(){
        
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
                                }),
                                takeUntil(this.pretplate)
                            );
                        }),
                        takeUntil(this.pretplate)
                    );
                }),
                takeUntil(this.pretplate)
            ).subscribe(); 
        } 
        //Ako liječnik NIJE POTVRDIO povijest bolesti
        else{
            //Samo zatvori prozor povijesti bolesti
            this.isPovijestBolesti = false;
            //Onemogućavam unos dijagnoza
            this.primarnaDijagnoza.disable({emitEvent: false});
            this.mkbPrimarnaDijagnoza.disable({emitEvent: false});
            this.sekundarnaDijagnoza.disable({emitEvent: false});
        }
    }

    //Metoda koja će postaviti sve dijagnoze koje su postavljene u zadnjoj povijesti bolesti
    dohvatiInicijalneDijagnoze(dijagnoze: InicijalneDijagnoze[]){
        console.log(dijagnoze);
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
}
