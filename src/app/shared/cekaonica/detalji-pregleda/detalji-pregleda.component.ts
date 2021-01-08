import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { forkJoin, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
    //Spremam ime, prezime i datum
    imePacijent: string;
    prezimePacijent: string;
    datumPregled: Date;
    //Spremam opće podatke
    opciPodatci: any;
    //Oznaka je li pacijent ima primarnu dijagnozu općih podataka
    isPrimarnaOpciPodatci: boolean = false;
    //Oznaka je li postoje sekundarne dijagnoze za neku primarnu dijagnozu općih podataka
    isSekundarnaDijagnozaOpci: boolean = false;
    //Spremam povijest bolesti
    povijestBolesti: any;
    //Oznaka je li postoje sekundarne dijagnoze za neku primarnu dijagnozu povijesti bolesti
    isSekundarnaDijagnozaPovijestBolesti: boolean = false;

    constructor(
        //Dohvaćam servis čekaonice
        private cekaonicaService: CekaonicaService
    ) { }

    //Ova metoda se izvodi kada se komponenta inicijalizira
    ngOnInit() {

        //Pretplaćujem se na Observable u kojemu se nalaze detalji pregleda
        this.subs = this.cekaonicaService.prikaziDetaljePregleda().pipe(
            switchMap(
                //Dohvaćam odgovor servera
                (odgovor) => {
                    console.log(odgovor);
                    //Spremam ime pacijenta
                    this.imePacijent = odgovor[0][0].imePacijent;
                    this.prezimePacijent = odgovor[0][0].prezPacijent;
                    this.datumPregled = odgovor[0][0].Datum;
                    //Spremam opće podatke
                    this.opciPodatci = odgovor[1];
                    //Spremam povijest bolesti
                    this.povijestBolesti = odgovor[2];
                    //Kreiram formu
                    this.forma = new FormGroup({
                    'imePrezime': new FormControl(this.imePacijent + " " + this.prezimePacijent),
                    'datumPregled': new FormControl(this.datumPregled),
                    'opciPodatci': new FormArray([]),
                    'povijestBolesti': new FormArray([])
                    });
                    
                    //Ako opći podatci IMAJU primarnih dijagnoza:
                    if(this.opciPodatci.length > 0){
                        //Označavam da opći podatci imaju primarnih dijagnoza
                        this.isPrimarnaOpciPodatci = true;
                        //Prolazim kroz polje općih podataka te za svaki objekt u njemu, dodavam jedan FORM GROUP u FORM ARRAY općih podataka
                        for(const podatci of this.opciPodatci){
                            this.addControlsOpciPodatci(podatci);
                        }
                        let polje = [];
                        //Prolazim poljem općih podataka.
                        for(let i=0;i<this.getControlsOpciPodatci().length;i++){
                            //Ako šifra sekundarne dijagnoze nije null
                            if(this.getControlsOpciPodatci()[i].value.mkbSifraSekundarna !== null){
                                //Označavam da postoji sekundarnih dijagnoza
                                this.isSekundarnaDijagnozaOpci = true;
                                //U pomoćno polje ubacivam Observable u kojemu se nalazi naziv i šifra sekundarne dijagnoze
                                polje.push(this.cekaonicaService.getNazivSifraSekundarnaDijagnoza(this.getControlsOpciPodatci()[i].value.mkbSifraSekundarna));
                            }
                        }
                        //Vraćam polje Observable-a
                        return forkJoin(polje);
                    }
                    //Ako pacijent ima evidentiran povijest bolesti
                    if(this.povijestBolesti.length > 0){
                        //Prolazim poljem povijesti bolesti te za svaki objekt u njemu, dodavam jedan FORM GROUP U FORM ARRAY povijesti bolesti
                        for(const podatci of this.povijestBolesti){
                            console.log(podatci);
                            this.addControlsPovijestBolesti(podatci);
                        }
                        //Inicijaliziram pomoćno polje
                        let polje = [];
                        //Prolazim poljem povijesti bolesti.
                        for(let i = 0;i<this.getControlsPovijestBolesti().length;i++){
                            //Ako šifra sekundarne dijagnoze nije null
                            if(this.getControlsPovijestBolesti()[i].value.mkbSifraSekundarna !== null){
                                //Označavam da postoji sekundarna dijagnoza
                                this.isSekundarnaDijagnozaPovijestBolesti = true;
                                //U pomoćno polje stavljam Observable u kojemu se nalazi šifra i naziv sekundarnih dijagnoza 
                                polje.push(this.cekaonicaService.getNazivSifraSekundarnaDijagnoza(this.getControlsPovijestBolesti()[i].value.mkbSifraSekundarna));
                            }
                        }
                        //Vraćam polje Observable-a
                        return forkJoin(polje);
                    }
                    //Ako opći podatci NEMAJU primarnih dijagnoza:
                    else{
                        //Vraćam Observable u kojemu se nalazi null
                        return of(null);
                    }
                }
            )
        ).subscribe(
            (odgovor) => {
                //Ako odgovor servera nije null
                if(odgovor !== null){
                    console.log(odgovor);
                    //Prolazim poljem općih podataka.
                    for(let i=0;i<this.getControlsOpciPodatci().length;i++){
                        console.log(i);
                        //Ako šifra sekundarne dijagnoze nije null
                        if(this.getControlsOpciPodatci()[i].value.mkbSifraSekundarna !== null){
                            //Kreiram novi prazni string
                            let str = new String("");
                            //Prolazim vanjskim poljem fork joina (ovo je polje polja)
                            for(const dijagnoza of odgovor){
                                //Prolazim unutarnjim poljem fork joina tj. direktno dohvaćam šifre i nazive sekundarnih dijagnoza
                                dijagnoza.forEach((element) => {
                                    //Ako je šifra primarne dijagnoze form arraya JEDNAKA šifri primarne dijagnoze iz fork joina, DOHVAĆAM SEKUNDARNU DIJAGNOZU za tu primarnu dijagnozu
                                    if(this.getControlsOpciPodatci()[i].value.primarnaDijagnoza.substr(0,this.getControlsOpciPodatci()[i].value.primarnaDijagnoza.indexOf(' ')) === element.mkbSifraPrimarna){
                                        //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                        str = str.concat(element.mkbSifra + " | " + element.imeDijagnoza + "\n");
                                    }
                                });
                            }
                            //U polje sekundarne dijagnoze ubacivam nazive i šifre sekundarnih dijagnoza 
                            (<FormArray>this.forma.get('opciPodatci')).at(i).get('sekundarneDijagnoze').patchValue(str);
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
