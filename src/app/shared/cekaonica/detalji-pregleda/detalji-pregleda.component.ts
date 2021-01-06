import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
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
    constructor(
        //Dohvaćam servis čekaonice
        private cekaonicaService: CekaonicaService
    ) { }

    //Ova metoda se izvodi kada se komponenta inicijalizira
    ngOnInit() {

        //Pretplaćujem se na Observable u kojemu se nalaze detalji pregleda
        this.subs = this.cekaonicaService.prikaziDetaljePregleda().subscribe(
            //Dohvaćam odgovor servera
            (odgovor) => {
                console.log(odgovor);
                //Spremam ime pacijenta
                this.imePacijent = odgovor[0][0].imePacijent;
                this.prezimePacijent = odgovor[0][0].prezPacijent;
                this.datumPregled = odgovor[0][0].Datum;
                //Spremam opće podatke
                this.opciPodatci = odgovor[1];
                //Kreiram formu
                this.forma = new FormGroup({
                  'imePrezime': new FormControl(this.imePacijent + " " + this.prezimePacijent),
                  'datumPregled': new FormControl(this.datumPregled),
                  'opciPodatci': new FormArray([]),
                  'primarnaDijagnozaPovijestBolesti': new FormControl(null),
                  'sekundarneDijagnozePovijestBolesti': new FormControl(null),
                  'anamnezaPovijestBolesti': new FormControl(null),
                  'terapijaPovijestBolesti': new FormControl(null)
                });
                
                //Ako opći podatci imaju primarnih dijagnoza:
                if(this.opciPodatci.length > 0){
                    console.log(this.opciPodatci.length);
                    //Označavam da opći podatci imaju primarnih dijagnoza
                    this.isPrimarnaOpciPodatci = true;
                    //Prolazim kroz polje općih podataka te za svaki objekt u njemu, dodavam jedan FORM GROUP u FORM ARRAY općih podataka
                    for(const podatci of this.opciPodatci){
                      this.addControlsOpciPodatci(podatci);
                    }
                } 
            }
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
                'sekundarneDijagnoze': new FormArray([])
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
