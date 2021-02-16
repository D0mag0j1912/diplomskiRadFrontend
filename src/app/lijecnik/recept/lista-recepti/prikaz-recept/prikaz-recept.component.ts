import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Recept } from 'src/app/shared/modeli/recept.model';

@Component({
  selector: 'app-prikaz-recept',
  templateUrl: './prikaz-recept.component.html',
  styleUrls: ['./prikaz-recept.component.css']
})
export class PrikazReceptComponent implements OnInit {

    //Oznaka je li recept ponovljiv ili nije
    isPonovljiv: boolean = false;
    //Oznaka je li recept ima šifru specijalista
    isSpecijalist: boolean = false;
    //Kreiram formu
    forma: FormGroup;
    //Kreiram event emitter
    @Output() close = new EventEmitter<any>();
    //Dohvaćam podatke recepta iz retka tablice liste recepata
    @Input() primljeniRecept: Recept;

    constructor() { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit() {
        console.log(this.primljeniRecept);
        //Kreiram formu
        this.forma = new FormGroup({
           'ustanova': new FormGroup({
                'imePrezimeLijecnik': new FormControl(null),
                'nazivUstanova': new FormControl(null),
                'adresaUstanova': new FormControl(null),
                'pbrUstanova': new FormControl(null),
                'mjestoUstanova': new FormControl(null),
                'telefonUstanova': new FormControl(null)
           }),
          'recept': new FormGroup({
                'tipRecept': new FormControl(null),
                'brojPonavljanja': new FormControl(null),
                'datumRecept': new FormControl(null)
          }),
          'podatciPacijenta': new FormGroup({
              'imePrezimePacijent': new FormControl(null),
              'datumRodenjaPacijent': new FormControl(null),
              'adresaPacijent': new FormControl(null)
          }),
          'dijagnoze': new FormGroup({
            'primarnaDijagnoza': new FormControl(null),
            'sekundarnaDijagnoza': new FormControl(null)
          }),
          'proizvod': new FormGroup({
              'imeProizvod': new FormControl(null)
           }),
           'detaljiProizvod': new FormGroup({
               'kolicinaProizvod': new FormControl(null),
               'doziranjeProizvod': new FormControl(null),
               'dostatnostProizvod': new FormControl(null),
               'vrijediDoProizvod': new FormControl(null)
           }),
          'specijalist': new FormGroup({
              'sifraSpecijalist': new FormControl(null),
              'tipSpecijalist': new FormControl(null)
           })
      });
    }

    //Ova metoda se poziva kada korisnik klikne "Izađi" ili negdje izvan prozora
    onClose(){
        //Emitiraj event prema roditeljskoj komponenti
        this.close.emit();
    }

    get recept(): FormGroup{
        return this.forma.get('recept') as FormGroup;
    }
    //Kreiram gettere za Form controlove
    get tipRecept(): FormControl{
      return this.forma.get('recept.tipRecept') as FormControl;
    }
    get brojPonavljanja(): FormControl{
        return this.forma.get('recept.brojPonavljanja') as FormControl;
    }
    get podatciPacijenta(): FormGroup{
        return this.forma.get('podatciPacijenta') as FormGroup;
    }
    get imePrezimePacijent(): FormControl{
        return this.forma.get('podatciPacijenta.imePrezimePacijent') as FormControl;
    }
    get datumRodenja(): FormControl{
        return this.forma.get('podatciPacijenta.datumRodenja') as FormControl;
    }
    get adresaPacijent(): FormControl{
        return this.forma.get('podatciPacijenta.adresaPacijent') as FormControl;
    }
    get datumRecept(): FormControl{
        return this.forma.get('recept.datumRecept') as FormControl;
    }
    get ustanova(): FormGroup{
        return this.forma.get('ustanova') as FormGroup;
    }
    get nazivUstanova(): FormControl{
        return this.forma.get('ustanova.nazivUstanova') as FormControl;
    }
    get telefonUstanova(): FormControl{
        return this.forma.get('ustanova.telefonUstanova') as FormControl;
    }
    get adresaUstanova(): FormControl{
        return this.forma.get('ustanova.adresaUstanova') as FormControl;
    }
    get imePrezimeLijecnik(): FormControl{
        return this.forma.get('ustanova.imePrezimeLijecnik') as FormControl;
    }
    get pbrUstanova(): FormControl{
        return this.forma.get('ustanova.pbrUstanova') as FormControl;
    }
    get mjestoUstanova(): FormControl{
        return this.forma.get('ustanova.mjestoUstanova') as FormControl;
    }
    get dijagnoze(): FormGroup{
        return this.forma.get('dijagnoze') as FormGroup;
    }
    get primarnaDijagnoza(): FormControl{
        return this.forma.get('dijagnoze.primarnaDijagnoza') as FormControl;
    }
    get sekundarnaDijagnoza(): FormControl{
        return this.forma.get('dijagnoze.sekundarnaDijagnoza') as FormControl;
    }
    get proizvod(): FormGroup{
        return this.forma.get('proizvod') as FormGroup;
    }
    get imeProizvod(): FormControl{
        return this.forma.get('proizvod.imeProizvod') as FormControl;
    }
    get kolicinaProizvod(): FormControl{
        return this.forma.get('detaljiProizvod.kolicinaProizvod') as FormControl;
    }
    get doziranjeProizvod(): FormControl{
        return this.forma.get('detaljiProizvod.doziranjeProizvod') as FormControl;
    }
    get dostatnostProizvod(): FormControl{
        return this.forma.get('detaljiProizvod.dostatnostProizvod') as FormControl;
    }
    get vrijediDoProizvod(): FormControl{
        return this.forma.get('detaljiProizvod.vrijediDoProizvod') as FormControl;
    }
    get specijalist(): FormGroup{
        return this.forma.get('specijalist') as FormGroup;
    }
    get sifraSpecijalist(): FormControl{
        return this.forma.get('specijalist.sifraSpecijalist') as FormControl;
    }
    get tipSpecijalist(): FormControl{
        return this.forma.get('specijalist.tipSpecijalist') as FormControl;
    }

}
