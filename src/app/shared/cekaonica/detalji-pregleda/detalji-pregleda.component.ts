import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { forkJoin, of, Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { HeaderService } from '../../header/header.service';
import { DetaljiPregleda } from '../../modeli/detaljiPregleda.model';
import { PovijestBolesti } from '../../modeli/povijestBolesti.model';
import { Pregled } from '../../modeli/pregled.model';
import { Recept } from '../../modeli/recept.model';
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
    //Inicijaliziram formu
    forma: FormGroup;
    //Spremam detalje pregleda
    detaljiPregleda: DetaljiPregleda;
    //Oznaka je li pacijent ima primarnu dijagnozu općih podataka
    isOpciPodatci: boolean = false;
    //Oznaka je li pacijent ima evidentiran povijest bolesti
    isPovijestBolesti: boolean = false;
    //Spremam tip prijavljenog korisnika
    tipKorisnik: string;
    //Spremam povijesti bolesti
    povijestiBolesti: PovijestBolesti[] = [];
    //Spremam opće podatke pregleda
    pregledi: Pregled[] = [];
    recept: Recept;

    //Tip korisnika čiji je redak kliknut (koji je obradio taj redak)
    tip: string;
    //Dohvaćam alert box da mogu manipulirati dimenzijama prozora
    @ViewChild('detaljiPregleda') alertBox : ElementRef;

    constructor(
        //Dohvaćam servis čekaonice
        private cekaonicaService: CekaonicaService,
        //Dohvaćam servis headera
        private headerService: HeaderService
    ) { }

    //Ova metoda se izvodi kada se komponenta inicijalizira
    ngOnInit() {

        //Pretplaćujem se na Observable u kojemu se nalaze detalji pregleda
        this.headerService.tipKorisnikaObs.pipe(
            take(1),
            switchMap(tipKorisnik => {
                //Spremam tip prijavljenog korisnika
                this.tipKorisnik = tipKorisnik;
                return this.cekaonicaService.prikaziDetaljePregleda().pipe(
                    takeUntil(this.pretplateSubject)
                );
            }),
            takeUntil(this.pretplateSubject)
        ).pipe(
            switchMap(
                //Dohvaćam odgovor servera
                (odgovor) => {
                    console.log(odgovor);
                    //Spremam osobne podatke pacijenta detalja pregleda
                    this.detaljiPregleda = new DetaljiPregleda(odgovor[0][0]);
                    //Kreiram formu
                    this.forma = new FormGroup({
                        'imePrezime': new FormControl(this.detaljiPregleda.imePacijent + " " + this.detaljiPregleda.prezimePacijent),
                        'datumPregled': new FormControl(this.detaljiPregleda.datumPregled),
                        'opciPodatci': new FormArray([]),
                        'povijestBolesti': new FormArray([])
                    });
                    //Ako je evidentirana ili povijest bolesti ili opći podatci
                    if(odgovor[1].length > 0){
                        //Definiram objekte
                        let objektPovijestBolesti;
                        let objektPregled;
                        //Prolazim kroz odgovor servera 
                        for(const pregled of odgovor[1]){
                            //Ako se u odgovoru servera NE SPOMINJE "idPovijestBolesti"
                            if(!('idPovijestBolesti' in pregled)){
                                //Podatke sa servera spremam u svoj objekt
                                objektPregled = new Pregled(pregled);
                                //Dodavam objekte u svoje polje
                                this.pregledi.push(objektPregled);
                                //Označavam da se radi o OPĆIM PODATCIMA PREGLEDA
                                this.isOpciPodatci = true;
                            }
                            //Ako se u odgovoru servera SPOMINJE "idPovijestBolesti"
                            else{
                                //Podatke sa servera spremam u svoj objekt
                                objektPovijestBolesti = new PovijestBolesti(pregled);
                                this.recept = new Recept(pregled);
                                //Dodavam objekte u svoje polje
                                this.povijestiBolesti.push(objektPovijestBolesti);
                                //Označavam da se radi o POVIJESTI BOLESTI
                                this.isPovijestBolesti = true;
                            }
                        }
                        console.log(this.povijestiBolesti);
                        //Inicijaliziram pomoćno polje
                        let polje = [];
                        //Ako se radi o OPĆIM PODATCIMA PREGLEDA:
                        if(this.isOpciPodatci){
                            //Spremam tip korisnika kojega šaljem
                            this.tip = "sestra";
                            //Prolazim kroz polje općih podataka te za svaki objekt u njemu, dodavam jedan FORM GROUP u FORM ARRAY općih podataka
                            for(const pregled of this.pregledi){
                                this.addControlsOpciPodatci(pregled);
                            }
                            //Prolazim poljem općih podataka.
                            for(let i=0;i<this.getControlsOpciPodatci().length;i++){
                                //Ako šifra sekundarne dijagnoze nije null
                                if(this.getControlsOpciPodatci()[i].value.mkbSifraSekundarna !== null){
                                    //U pomoćno polje ubacivam Observable u kojemu se nalazi naziv i šifra sekundarne dijagnoze
                                    polje.push(this.cekaonicaService.getNazivSifraSekundarnaDijagnoza(this.tip,this.getControlsOpciPodatci()[i].value.mkbSifraSekundarna,
                                                                                                    this.detaljiPregleda.idObrada));
                                }
                            }
                            //Vrati polje Observable-a u kojemu se nalaze sekundarne dijagnoze općih podataka pregleda
                            return forkJoin(polje);
                        }
                        //Ako se radi o PODATCIMA POVIJESTI BOLESTI:
                        if(this.isPovijestBolesti){
                            //Spremam tip korisnika kojega šaljem
                            this.tip = "lijecnik";
                            //Prolazim poljem povijesti bolesti te za svaki objekt u njemu, dodavam jedan FORM GROUP U FORM ARRAY povijesti bolesti
                            for(const pregled of this.povijestiBolesti){
                                this.addControlsPovijestBolesti(pregled);
                            }
                            //Prolazim poljem povijesti bolesti.
                            for(let i = 0;i<this.getControlsPovijestBolesti().length;i++){
                                //Ako šifra sekundarne dijagnoze nije null
                                if(this.getControlsPovijestBolesti()[i].value.mkbSifraSekundarna !== null){
                                    //U pomoćno polje stavljam Observable u kojemu se nalazi šifra i naziv sekundarnih dijagnoza 
                                    polje.push(this.cekaonicaService.getNazivSifraSekundarnaDijagnoza(this.tip,this.getControlsPovijestBolesti()[i].value.mkbSifraSekundarna,
                                                                                                    this.detaljiPregleda.idObrada));
                                }
                            } 
                            //Vraćam polje Observable-a u kojima se nalaze sekundarne dijagnoze podataka povijesti bolesti
                            return forkJoin(polje);    
                        }
                    }
                    //Ako nema vraćenih podataka
                    else{
                        //Smanjivam visinu prozora
                        this.alertBox.nativeElement.style.height = "15vw";
                        //Smanjivam širinu prozora
                        this.alertBox.nativeElement.style.width = "35vw";
                        //Postavljam ga više lijevo
                        this.alertBox.nativeElement.style.left = "30vw";
                        //Dižem overflow-y
                        this.alertBox.nativeElement.style.overflowY = "hidden";
                        //Vraćam Observable u kojemu se nalazi null
                        return of(null);
                    } 
                }
            ),
            takeUntil(this.pretplateSubject)
        //Pretplaćujem se na nazive i šifre sekundarnih dijagnoza
        ).subscribe(
            (odgovor) => {
                //Ako odgovor servera nije null tj. nema sekundarnih dijagnoza NI U općim podatcima pregleda NI U podatcima povijesti bolesti
                if(odgovor !== null){
                    console.log(odgovor);
                    //Ako je tip korisnika koji je obradio ovaj redak (pacijenta) === medicinska sestra
                    if(this.tip === "sestra"){
                        //Prolazim poljem općih podataka.
                        for(let i=0;i<this.getControlsOpciPodatci().length;i++){
                            //Ako šifra sekundarne dijagnoze nije null
                            if(this.getControlsOpciPodatci()[i].value.mkbSifraSekundarna !== null){
                                //Kreiram novi prazni string
                                let str = new String("");
                                //Prolazim vanjskim poljem fork joina (ovo je polje polja)
                                for(const dijagnoza of odgovor){
                                    //Prolazim unutarnjim poljem fork joina tj. direktno dohvaćam šifre i nazive sekundarnih dijagnoza
                                    dijagnoza.forEach((element) => {
                                        //Ako ovaj objekt SADRŽI KLJUČ "idPregled", popuni polje sek. dijagnoza općih podataka pregleda
                                        if('idPregled' in element){
                                            //Ako je šifra primarne dijagnoze form arraya JEDNAKA šifri primarne dijagnoze iz fork joina, DOHVAĆAM SEKUNDARNU DIJAGNOZU za tu primarnu dijagnozu
                                            if(this.getControlsOpciPodatci()[i].value.primarnaDijagnoza.substr(0,this.getControlsOpciPodatci()[i].value.primarnaDijagnoza.indexOf(' ')) === element.mkbSifraPrimarna){
                                                //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                                str = str.concat(element.mkbSifra + " | " + element.imeDijagnoza + "\n");
                                            }   
                                        }
                                    });
                                }
                                //U polje sekundarne dijagnoze ubacivam nazive i šifre sekundarnih dijagnoza 
                                (<FormArray>this.forma.get('opciPodatci')).at(i).get('sekundarneDijagnoze').patchValue(str);
                            }
                        }
                    }
                    //Ako je tip korisnika koji je obradio ovaj redak (pacijenta) === liječnik
                    else if(this.tip === "lijecnik"){
                        //Prolazim poljem povijest bolesti
                        for(let i=0;i<this.getControlsPovijestBolesti().length;i++){
                            //Ako šifra sekundarne dijagnoze nije null
                            if(this.getControlsPovijestBolesti()[i].value.mkbSifraSekundarna !== null){
                                //Kreiram novi prazni string
                                let strPov = new String("");
                                //Prolazim vanjskim poljem fork joina (ovo je polje polja)
                                for(const dijagnozaPov of odgovor){
                                    //Prolazim unutarnjim poljem fork joina tj. direktno dohvaćam šifre i nazive sekundarnih dijagnoza
                                    dijagnozaPov.forEach((elementPov) => {
                                        //Ako ovaj objekt SADRŽI KLJUČ "idPovijestBolesti", popuni polje sek. dijagnoza podataka povijesti bolesti
                                        if('idPovijestBolesti' in elementPov){
                                            //Ako je šifra primarne dijagnoze form arraya JEDNAKA šifri primarne dijagnoze iz fork joina, DOHVAĆAM SEKUNDARNU DIJAGNOZU za tu primarnu dijagnozu
                                            if(this.getControlsPovijestBolesti()[i].value.primarnaDijagnoza.substr(0,this.getControlsPovijestBolesti()[i].value.primarnaDijagnoza.indexOf(' ')) === elementPov.mkbSifraPrimarna){
                                                //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                                strPov = strPov.concat(elementPov.mkbSifra + " | " + elementPov.imeDijagnoza + "\n");
                                            }   
                                        }
                                    });
                                }
                                //U polje sekundarne dijagnoze ubacivam nazive i šifre sekundarnih dijagnoza 
                                (<FormArray>this.forma.get('povijestBolesti')).at(i).get('sekundarneDijagnoze').patchValue(strPov);
                            }
                        }
                    }
                }
            }
        );   
    }

    //Metoda koja dohvaća sve form groupove form arraya "Povijest bolesti"
    getControlsPovijestBolesti(){
        return (<FormArray>this.forma.get('povijestBolesti')).controls;
    }

    //Metoda koja nadodava form groupove u form array "Povijest bolesti"
    addControlsPovijestBolesti(povijestBolesti: PovijestBolesti){
        (<FormArray>this.forma.get('povijestBolesti')).push(
            new FormGroup({
                'idPovijestBolesti': new FormControl(povijestBolesti.idPovijestBolesti),
                'primarnaDijagnoza': new FormControl(povijestBolesti.mkbSifraPrimarna + " | " + povijestBolesti.nazivPrimarna),
                'anamneza': new FormControl(povijestBolesti.anamneza),
                'razlogDolaska': new FormControl(povijestBolesti.razlogDolaska),
                'mkbSifraSekundarna': new FormControl(povijestBolesti.mkbSifraSekundarna),
                'sekundarneDijagnoze': new FormControl(null),
                'proizvod': new FormControl(povijestBolesti.proizvod ? povijestBolesti.proizvod : null),
                'kolicina': new FormControl(povijestBolesti.kolicina ? povijestBolesti.kolicina : null),
                'doziranje': new FormControl(povijestBolesti.doziranje ? povijestBolesti.doziranje : null)
            })
        );
    }

    //Metoda koja dohvaća sve form groupove form arraya "Opći podatci"
    getControlsOpciPodatci(){
        return (<FormArray>this.forma.get('opciPodatci')).controls;
    }
    //Metoda koja nadodava form group sa podatcima u form array "Opći podatci"
    addControlsOpciPodatci(opciPodatci: Pregled){
        (<FormArray>this.forma.get('opciPodatci')).push(
            new FormGroup({
                'primarnaDijagnoza': new FormControl(opciPodatci.mkbSifraPrimarna + " | " + opciPodatci.nazivPrimarna),
                'mkbSifraSekundarna': new FormControl(opciPodatci.mkbSifraSekundarna),
                'sekundarneDijagnoze': new FormControl()
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
