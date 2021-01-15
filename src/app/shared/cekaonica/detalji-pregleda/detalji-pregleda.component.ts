import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { forkJoin, of, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { HeaderService } from '../../header/header.service';
import { CekaonicaService } from '../cekaonica.service';

@Component({
  selector: 'app-detalji-pregleda',
  templateUrl: './detalji-pregleda.component.html',
  styleUrls: ['./detalji-pregleda.component.css']
})
export class DetaljiPregledaComponent implements OnInit,OnDestroy {

    //Kreiram pretplate
    subs: Subscription;
    //Kreiram EventEmitter da mogu obavijestiti roditeljsku komponentu da se ovaj prozor zatvara
    @Output() close = new EventEmitter<any>();
    //Inicijaliziram formu
    forma: FormGroup;
    //Spremam ime, prezime,datum i ID obrade
    imePacijent: string;
    prezimePacijent: string;
    datumPregled: Date;
    idObrada: number;
    //Oznaka je li pacijent ima primarnu dijagnozu općih podataka
    isOpciPodatci: boolean = false;
    //Oznaka je li pacijent ima evidentiran povijest bolesti
    isPovijestBolesti: boolean = false;
    //Spremam tip prijavljenog korisnika
    tipKorisnik: string;
    //Podatci pregleda
    podatciPregleda: any;
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
        this.subs = this.headerService.tipKorisnikaObs.pipe(
            take(1),
            switchMap(tipKorisnik => {
                //Spremam tip prijavljenog korisnika
                this.tipKorisnik = tipKorisnik;
                return this.cekaonicaService.prikaziDetaljePregleda();
            })
        ).pipe(
            switchMap(
                //Dohvaćam odgovor servera
                (odgovor) => {
                    console.log(odgovor);
                    //Spremam ime pacijenta
                    this.imePacijent = odgovor[0][0].imePacijent;
                    this.prezimePacijent = odgovor[0][0].prezPacijent;
                    this.datumPregled = odgovor[0][0].Datum;
                    this.idObrada = odgovor[0][0].idObrada;
                    //Spremam podatke pregleda (ILI opće podatke ILI povijest bolesti)
                    this.podatciPregleda = odgovor[1];
                    console.log(this.podatciPregleda);
                    //Kreiram formu
                    this.forma = new FormGroup({
                        'imePrezime': new FormControl(this.imePacijent + " " + this.prezimePacijent),
                        'datumPregled': new FormControl(this.datumPregled),
                        'opciPodatci': new FormArray([]),
                        'povijestBolesti': new FormArray([])
                    });
                    //Ako ima vraćenih podataka
                    if(this.podatciPregleda.length > 0){
                        //Inicijaliziram pomoćno polje
                        let polje = [];
                        //Prolazim kroz podatke pregleda
                        for(const podatak of this.podatciPregleda){
                            //Ako ključ "anamneza" NE POSTOJI u podatcima pregleda
                            if(!('anamneza' in podatak)){
                                //Označavam da se radi o OPĆIM PODATCIMA PREGLEDA
                                this.isOpciPodatci = true;
                            }
                            //Ako ključ "anamneza" POSTOJI u podatcima pregleda
                            else{
                                //Označavam da se radi o POVIJESTI BOLESTI PREGLEDA
                                this.isPovijestBolesti = true;
                            }
                        }
                        //Ako se radi o OPĆIM PODATCIMA PREGLEDA:
                        if(this.isOpciPodatci){
                            //Spremam tip korisnika kojega šaljem
                            this.tip = "sestra";
                            //Prolazim kroz polje općih podataka te za svaki objekt u njemu, dodavam jedan FORM GROUP u FORM ARRAY općih podataka
                            for(const podatci of this.podatciPregleda){
                                this.addControlsOpciPodatci(podatci);
                            }
                            //Prolazim poljem općih podataka.
                            for(let i=0;i<this.getControlsOpciPodatci().length;i++){
                                //Ako šifra sekundarne dijagnoze nije null
                                if(this.getControlsOpciPodatci()[i].value.mkbSifraSekundarna !== null){
                                    //U pomoćno polje ubacivam Observable u kojemu se nalazi naziv i šifra sekundarne dijagnoze
                                    polje.push(this.cekaonicaService.getNazivSifraSekundarnaDijagnoza(this.tip,this.getControlsOpciPodatci()[i].value.mkbSifraSekundarna,this.idObrada));
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
                            for(const podatci of this.podatciPregleda){
                                this.addControlsPovijestBolesti(podatci);
                            }
                            //Prolazim poljem povijesti bolesti.
                            for(let i = 0;i<this.getControlsPovijestBolesti().length;i++){
                                console.log(this.getControlsPovijestBolesti()[i].value);
                                //Ako šifra sekundarne dijagnoze nije null
                                if(this.getControlsPovijestBolesti()[i].value.mkbSifraSekundarna !== null){
                                    //U pomoćno polje stavljam Observable u kojemu se nalazi šifra i naziv sekundarnih dijagnoza 
                                    polje.push(this.cekaonicaService.getNazivSifraSekundarnaDijagnoza(this.tip,this.getControlsPovijestBolesti()[i].value.mkbSifraSekundarna,this.idObrada));
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
            )
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
    addControlsPovijestBolesti(povijestBolesti: any){
        (<FormArray>this.forma.get('povijestBolesti')).push(
            new FormGroup({
                'primarnaDijagnoza': new FormControl(povijestBolesti.mkbSifraPrimarna + " | " + povijestBolesti.NazivPrimarna),
                'anamneza': new FormControl(povijestBolesti.anamneza),
                'terapija': new FormControl(povijestBolesti.terapija),
                'mkbSifraSekundarna': new FormControl(povijestBolesti.mkbSifraSekundarna),
                'sekundarneDijagnoze': new FormControl()
            })
        );
    }

    //Metoda koja dohvaća sve form groupove form arraya "Opći podatci"
    getControlsOpciPodatci(){
        return (<FormArray>this.forma.get('opciPodatci')).controls;
    }
    //Metoda koja nadodava form group sa podatcima u form array "Opći podatci"
    addControlsOpciPodatci(opciPodatci: any){
        (<FormArray>this.forma.get('opciPodatci')).push(
            new FormGroup({
                'primarnaDijagnoza': new FormControl(opciPodatci.mkbSifraPrimarna + " | " + opciPodatci.NazivPrimarna),
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
        //Ako postoji pretplata
        if(this.subs){
            //Izađi iz pretplate
            this.subs.unsubscribe();
        }
    }
}
