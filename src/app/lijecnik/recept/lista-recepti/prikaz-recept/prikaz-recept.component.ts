import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-prikaz-recept',
  templateUrl: './prikaz-recept.component.html',
  styleUrls: ['./prikaz-recept.component.css']
})
export class PrikazReceptComponent implements OnInit {

    //Kreiram formu
    forma: FormGroup;
    constructor(
        //Dohvaćam router
        private router: Router,
        //Dohvaćam trenutni route
        private route: ActivatedRoute
    ) { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit() {
        //Kreiram formu
        this.forma = new FormGroup({
          'vrstaRecept': new FormControl(null),
          'brojPonavljanja': new FormControl(null),
          'podatciPacijenta': new FormGroup({
              'imePrezimePacijent': new FormControl(null),
              'datumRodenjaPacijent': new FormControl(null),
              'adresaPacijent': new FormControl(null)
          }),
          'datumRecept': new FormControl(null),
          'ustanova': new FormGroup({
              'nazivUstanova': new FormControl(null),
              'telefonUstanova': new FormControl(null),
              'adresaUstanova': new FormControl(null),
              'imePrezimeLijecnik': new FormControl(null)
          }),
          'primarnaDijagnoza': new FormControl(null),
          'sekundarnaDijagnoza': new FormControl(null),
          'proizvod': new FormGroup({
              'imeProizvod': new FormControl(null),
              'kolicinaProizvod': new FormControl(null),
              'doziranjeProizvod': new FormControl(null),
              'nacinUpotrebeProizvod': new FormControl(null),
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
        this.router.navigate(['../'],{relativeTo: this.route});
    }

    //Kreiram gettere za Form controlove
    get vrstaRecept(): FormControl{
      return this.forma.get('vrstaRecept') as FormControl;
    }
    get brojPonavljanja(): FormControl{
        return this.forma.get('brojPonavljanja') as FormControl;
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
        return this.forma.get('datumRecept') as FormControl;
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
    get primarnaDijagnoza(): FormControl{
        return this.forma.get('primarnaDijagnoza') as FormControl;
    }
    get sekundarnaDijagnoza(): FormControl{
        return this.forma.get('sekundarnaDijagnoza') as FormControl;
    }
    get proizvod(): FormGroup{
        return this.forma.get('proizvod') as FormGroup;
    }
    get imeProizvod(): FormControl{
        return this.forma.get('proizvod.imeProizvod') as FormControl;
    }
    get kolicinaProizvod(): FormControl{
        return this.forma.get('proizvod.kolicinaProizvod') as FormControl;
    }
    get doziranjeProizvod(): FormControl{
        return this.forma.get('proizvod.doziranjeProizvod') as FormControl;
    }
    get nacinUpotrebeProizvod(): FormControl{
        return this.forma.get('proizvod.nacinUpotrebeProizvod') as FormControl;
    }
    get dostatnostProizvod(): FormControl{
        return this.forma.get('proizvod.dostatnostProizvod') as FormControl;
    }
    get vrijediDoProizvod(): FormControl{
        return this.forma.get('proizvod.vrijediDoProizvod') as FormControl;
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
