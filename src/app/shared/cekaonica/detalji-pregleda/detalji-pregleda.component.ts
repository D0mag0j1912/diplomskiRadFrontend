import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DetaljiPregleda } from './detaljiPregleda.model';
import { PovijestBolesti } from '../../modeli/povijestBolesti.model';
import { Pregled } from '../../modeli/pregled.model';
import { Recept } from '../../modeli/recept.model';
import { Uputnica } from '../../modeli/uputnica.model';
import { CekaonicaService } from '../cekaonica.service';

@Component({
  selector: 'app-detalji-pregleda',
  templateUrl: './detalji-pregleda.component.html',
  styleUrls: ['./detalji-pregleda.component.css']
})
export class DetaljiPregledaComponent implements OnInit,OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Kreiram EventEmitter da mogu obavijestiti roditeljsku komponentu da se ovaj prozor zatvara
    @Output() close = new EventEmitter<any>();
    //Primam tip korisnika od "CekaonicaComponent"
    @Input() primljeniTipKorisnik: string;
    //Primam sve podatke povijesti bolesti od "CekaonicaComponent"
    @Input() povijestiBolesti: PovijestBolesti[];
    //Primam sve opće podatke pregleda od "CekaonicaComponent"
    @Input() pregledi: Pregled[];
    //Spremam detalje pregleda
    @Input() detaljiPregleda: DetaljiPregleda;
    //Inicijaliziram formu
    forma: FormGroup;
    //Spremam podatke recepta
    recept: Recept;
    //Oznaka je li prozor podataka recepta otvoren ili nije
    isIzdaniRecept: boolean = false;
    //Spremam podatke uputnice
    uputnica: Uputnica;
    //Oznaka je li prozor podataka uputnice otvoren ili nije
    isIzdanaUputnica: boolean = false;
    //Inicijaliziram brojač pregleda na 0
    brojacPregleda: number = 0;
    //Oznaka je li dodan BMI u ovoj sesiji obrade
    isDodanBMI: boolean = false;

    constructor(
        //Dohvaćam servis čekaonice
        private cekaonicaService: CekaonicaService
    ) { }

    //Ova metoda se izvodi kada se komponenta inicijalizira
    ngOnInit() {
        console.log(this.pregledi);
        //Ako postoji BMI u mom modelu
        if(this.detaljiPregleda.bmi){
            //Označavam da ima BMI-a
            this.isDodanBMI = true;
        }
        //Kreiram formu
        this.forma = new FormGroup({
            'imePrezime': new FormControl(this.detaljiPregleda.imePacijent + " " + this.detaljiPregleda.prezimePacijent),
            'datumPregled': new FormControl(this.detaljiPregleda.datumPregled),
            'ukupnaCijenaPregled': new FormControl(this.detaljiPregleda.ukupnaCijenaPregled),
            'bmi': new FormControl(this.detaljiPregleda.bmi ? this.detaljiPregleda.bmi : null),
            'opciPodatci': new FormArray([]),
            'povijestBolesti': new FormArray([])
        });

        //Inicijaliziram pomoćno polje
        let polje = [];
        //Ako se radi o OPĆIM PODATCIMA PREGLEDA:
        if(this.pregledi.length > 0){
            //Prolazim kroz polje općih podataka te za svaki objekt u njemu, dodavam jedan FORM GROUP u FORM ARRAY općih podataka
            for(const pregled of this.pregledi){
                this.addControlsOpciPodatci(pregled);
            }
            //Prolazim poljem općih podataka.
            for(let i=0;i<this.getControlsOpciPodatci().length;i++){
                //U pomoćno polje ubacivam Observable u kojemu se nalazi naziv i šifra sekundarne dijagnoze
                polje.push(this.cekaonicaService.getNazivSifraSekundarnaDijagnoza(
                  this.primljeniTipKorisnik,
                  this.getControlsOpciPodatci()[i].value.datum,
                  this.getControlsOpciPodatci()[i].value.vrijemeZaBazu,
                  this.getControlsOpciPodatci()[i].value.tipSlucaj,
                  this.getControlsOpciPodatci()[i].value.primarnaDijagnoza,
                  this.detaljiPregleda.idObrada));
            }
            //Vrati polje Observable-a u kojemu se nalaze sekundarne dijagnoze općih podataka pregleda
            const combined = forkJoin(polje).pipe(
                tap((odgovor: any) => {
                    for(let i = 0;i< this.getControlsOpciPodatci().length;i++){
                        //Za svaku iteraciju povijesti bolesti, string se resetira
                        let str = new String("");
                        for(const dijagnoza of odgovor){
                            dijagnoza.forEach((element) => {
                                //Ako je šifra primarne dijagnoze iz form array-a JEDNAKA onoj iz fork joina
                                if(this.getControlsOpciPodatci()[i].value.datum === element.Datum
                                  && this.getControlsOpciPodatci()[i].value.vrijemeZaBazu === element.vrijemePregled
                                  && this.getControlsOpciPodatci()[i].value.tipSlucaj === element.tipSlucaj){
                                    //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                    str = str.concat(element.sekundarneDijagnoze + "\n");
                                }
                            });
                        }
                        //Taj spojeni string dodavam u form control polja sekundarnih dijagnoza
                        (<FormArray>(this.forma.get('opciPodatci'))).at(i).get('sekundarneDijagnoze').patchValue(str === 'null\n' ? null : str, {emitEvent: false});
                    }
                })
            ).subscribe();
        }
        //Ako se radi o PODATCIMA POVIJESTI BOLESTI:
        else if(this.povijestiBolesti.length > 0){
            //Prolazim poljem povijesti bolesti te za svaki objekt u njemu, dodavam jedan FORM GROUP U FORM ARRAY povijesti bolesti
            for(const pregled of this.povijestiBolesti){
                this.addControlsPovijestBolesti(pregled);
            }
            //Prolazim poljem povijesti bolesti.
            for(let i = 0;i<this.getControlsPovijestBolesti().length;i++){
                //U pomoćno polje stavljam Observable u kojemu se nalazi šifra i naziv sekundarnih dijagnoza
                polje.push(this.cekaonicaService.getNazivSifraSekundarnaDijagnoza(
                    this.primljeniTipKorisnik,
                    this.getControlsPovijestBolesti()[i].value.datum,
                    this.getControlsPovijestBolesti()[i].value.vrijemeZaBazu,
                    this.getControlsPovijestBolesti()[i].value.tipSlucaj,
                    this.getControlsPovijestBolesti()[i].value.primarnaDijagnoza,
                    this.detaljiPregleda.idObrada));
            }
            //Vraćam polje Observable-a u kojima se nalaze sekundarne dijagnoze podataka povijesti bolesti
            const combined = forkJoin(polje).pipe(
                tap((odgovor:any) => {
                    for(let i = 0;i< this.getControlsPovijestBolesti().length;i++){
                        //Za svaku iteraciju povijesti bolesti, string se resetira
                        let str = new String("");
                        for(const dijagnoza of odgovor){
                            dijagnoza.forEach((element) => {
                                //Ako je šifra primarne dijagnoze iz form array-a JEDNAKA onoj iz fork joina
                                if(this.getControlsPovijestBolesti()[i].value.datum === element.Datum
                                  && this.getControlsPovijestBolesti()[i].value.vrijemeZaBazu === element.vrijeme
                                  && this.getControlsPovijestBolesti()[i].value.tipSlucaj === element.tipSlucaj){
                                    //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                    str = str.concat(element.sekundarneDijagnoze + "\n");
                                }
                            });
                        }
                        //Taj spojeni string dodavam u form control polja sekundarnih dijagnoza
                        (<FormArray>(this.forma.get('povijestBolesti'))).at(i).get('sekundarneDijagnoze').patchValue(str === 'null\n' ? null : str, {emitEvent: false});
                    }
                })
            ).subscribe();
        }
    }

    //Metoda koja se izvodi kada korisnik klikne na "Izdani recept"
    onIzdaniRecept(recept: Recept){
        //Ove podatke recepta šaljem komponenti "IzdaniReceptComponent"
        this.recept = {...recept};
        //Označavam da se otvori prozor izdanih recepata
        this.isIzdaniRecept = true;
    }

    //Metoda koja se poziva kada korisnik izađe iz prozora izdanih recepata
    onCloseIzdaniRecept(){
        //Zatvaram prozor izdanih recepata
        this.isIzdaniRecept = false;
    }

    //Metoda koja se pokreće kada korisnik klikne na "Izdana uputnica"
    onIzdanaUputnica(uputnica: Uputnica){
        //Podatke uputnice šaljem komponenti "IzdaneUputniceComponent"
        this.uputnica = {...uputnica};
        console.log(this.uputnica);
        //Otvaram prozor izdane uputnice
        this.isIzdanaUputnica = true;
    }

    //Metoda koja se poziva kada korisnik izađe iz prozora izdane uputnice
    onCloseIzdanaUputnica(){
        //Zatvori prozor
        this.isIzdanaUputnica = false;
    }

    //Metoda koja dohvaća sve form groupove form arraya "Povijest bolesti"
    getControlsPovijestBolesti(){
        return (<FormArray>this.forma.get('povijestBolesti')).controls;
    }

    //Metoda koja nadodava form groupove u form array "Povijest bolesti"
    addControlsPovijestBolesti(povijestBolesti: PovijestBolesti){
        this.brojacPregleda++;
        (<FormArray>this.forma.get('povijestBolesti')).push(
            new FormGroup({
                'primarnaDijagnoza': new FormControl(povijestBolesti.nazivPrimarna + " [" + povijestBolesti.mkbSifraPrimarna + ']'),
                'anamneza': new FormControl(povijestBolesti.anamneza),
                'razlogDolaska': new FormControl(povijestBolesti.razlogDolaska),
                'mkbSifraSekundarna': new FormControl(povijestBolesti.mkbSifraSekundarna),
                'sekundarneDijagnoze': new FormControl(null),
                'datum': new FormControl(povijestBolesti.datum),
                'tipSlucaj': new FormControl(povijestBolesti.tipSlucaj),
                'vrijemeZaBazu': new FormControl(povijestBolesti.vrijeme),
                'vrijeme': new FormControl(this.brojacPregleda + '.pregled [' + povijestBolesti.vrijeme + ']'),
                'recept': new FormGroup({
                    'proizvod': new FormControl(povijestBolesti._recept.proizvod ? povijestBolesti._recept.proizvod : null),
                    'kolicina': new FormControl(povijestBolesti._recept.kolicina ? povijestBolesti._recept.kolicina : null),
                    'doziranje': new FormControl(povijestBolesti._recept.doziranje ? povijestBolesti._recept.doziranje : null),
                    'dostatnost': new FormControl(povijestBolesti._recept.dostatnost ? povijestBolesti._recept.dostatnost : null),
                    'hitnost': new FormControl(povijestBolesti._recept.hitnost ? povijestBolesti._recept.hitnost : null),
                    'ponovljivost': new FormControl(povijestBolesti._recept.ponovljivost ? povijestBolesti._recept.ponovljivost : null),
                    'brojPonavljanja': new FormControl(povijestBolesti._recept.brojPonavljanja ? povijestBolesti._recept.brojPonavljanja : null),
                    'cijeliSpecijalist': new FormControl(povijestBolesti._recept.cijeliSpecijalist ? povijestBolesti._recept.cijeliSpecijalist : null),
                    'iznosRecept': new FormControl(povijestBolesti._recept.iznosRecept + ' kn')
                }),
                'uputnica': new FormGroup({
                    'zdravstvenaDjelatnost': new FormControl(povijestBolesti._uputnica.zdravstvenaDjelatnost),
                    'zdravstvenaUstanova': new FormControl(povijestBolesti._uputnica.zdravstvenaUstanova),
                    'vrstaPregled': new FormControl(povijestBolesti._uputnica.vrstaPregled),
                    'molimTraziSe': new FormControl(povijestBolesti._uputnica.molimTraziSe),
                    'napomena': new FormControl(povijestBolesti._uputnica.napomena),
                    'iznosUputnica': new FormControl(povijestBolesti._uputnica.iznosUputnica + ' kn')
                }),
                'pacijent': new FormGroup({
                    'imePacijent': new FormControl(povijestBolesti._pacijent.ime),
                    'prezPacijent': new FormControl(povijestBolesti._pacijent.prezime),
                    'mboPacijent': new FormControl(povijestBolesti._pacijent.mbo)
                }),
                'pacijentTemplate': new FormControl(povijestBolesti._pacijent.ime + ' ' + povijestBolesti._pacijent.prezime + ' [' + povijestBolesti._pacijent.mbo + ']'),
                'mboAktivniPacijent': new FormControl(povijestBolesti.mboAktivniPacijent)
            })
        );
    }

    //Metoda koja dohvaća sve form groupove form arraya "Opći podatci"
    getControlsOpciPodatci(){
        return (<FormArray>this.forma.get('opciPodatci')).controls;
    }
    //Metoda koja nadodava form group sa podatcima u form array "Opći podatci"
    addControlsOpciPodatci(opciPodatci: Pregled){
        this.brojacPregleda++;
        (<FormArray>this.forma.get('opciPodatci')).push(
            new FormGroup({
                'nacinPlacanja': new FormControl(opciPodatci.nacinPlacanja),
                'primarnaDijagnoza': new FormControl(opciPodatci.nazivPrimarna + " [" + opciPodatci.mkbSifraPrimarna + ']'),
                'vrijemeZaBazu': new FormControl(opciPodatci.vrijeme),
                'tipSlucaj': new FormControl(opciPodatci.tipSlucaj),
                'datum': new FormControl(opciPodatci.datum),
                'sekundarneDijagnoze': new FormControl(),
                'vrijemePregled': new FormControl(this.brojacPregleda + '.pregled [' + opciPodatci.vrijeme + ']'),
                'pacijent': new FormGroup({
                    'imePacijent': new FormControl(opciPodatci._pacijent.ime),
                    'prezPacijent': new FormControl(opciPodatci._pacijent.prezime),
                    'mboPacijent': new FormControl(opciPodatci._pacijent.mbo)
                }),
                'pacijentTemplate': new FormControl(opciPodatci._pacijent.ime + ' ' + opciPodatci._pacijent.prezime + ' [' + opciPodatci._pacijent.mbo + ']'),
                'mboAktivniPacijent': new FormControl(opciPodatci.mboAktivniPacijent)
            })
        );
    }

    //Metoda koja zatvara ovaj prozor
    onClose(){
        //Emitiram event
        this.close.emit();
    }

    //Ova metoda se izvodi kada se komponenta uništi
    ngOnDestroy(){
        //Izlazim iz pretplata
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}
