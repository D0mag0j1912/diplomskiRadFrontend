import { Time } from '@angular/common';
import { Component, OnInit,Output,EventEmitter, OnDestroy, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { forkJoin, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, tap } from 'rxjs/operators';
import { PovijestBolesti } from 'src/app/shared/modeli/povijestBolesti.model';
import { PovezaniPovijestBolestiService } from './povezani-povijest-bolesti.service';

@Component({
  selector: 'app-povezani-povijest-bolesti',
  templateUrl: './povezani-povijest-bolesti.component.html',
  styleUrls: ['./povezani-povijest-bolesti.component.css']
})
export class PovezaniPovijestBolestiComponent implements OnInit,OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li pronađen rezultat za pretragu povijest bolesti
    isPovijestBolestiPretraga: boolean = false;
    //Spremam poruku servera za pretragu povijesti bolesti
    porukaPovijestBolestiPretraga: string = null;
    //Kreiram event emitter koji će obavjestiti drugu komponentu da je korisnik kliknuo "Izađi"
    @Output() close = new EventEmitter<any>();
    //Kreiram event emitter koji će poslati podatke retka drugoj komponenti
    @Output() podatciRetka = new EventEmitter<{
        datum: Date,
        razlogDolaska: string,
        primarnaDijagnoza: string,
        anamneza: string,
        vrijeme: Time,
        tipSlucaj: string}>();
    //Kreiram formu koja služi za pretragu povijesti bolesti
    forma: FormGroup;
    //Kreiram glavnu formu
    glavnaForma: FormGroup;
    //Primam ID pacijenta od roditeljske komponente u slučaju da nisam došao dodavde iz obrade
    @Input() primljeniIDPacijent: number;
    //Spremam sve povijesti bolesti u svoj model
    @Input() povijestBolesti: PovijestBolesti[] = [];

    constructor(
        //Dohvaćam servis povezane povijesti bolesti
        private povezaniPovijestBolestiService: PovezaniPovijestBolestiService
    ) { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){
        //Kreiram formu
        this.forma = new FormGroup({
            'parametar': new FormControl(null)
        });
        //Kreiram glavnu formu
        this.glavnaForma = new FormGroup({
            'povijestBolesti': new FormArray([])
        });

        //Za svaku povijest bolesti, dodaj cijeli form array u formu
        for(let povijest of this.povijestBolesti){
            this.addControls(povijest);
        }
        //Inicijaliziram prazno polje u koje ću spremati Observable sek. dijagnoza
        let polje = [];
        //Za svaku iteraciju povijesti bolesti
        for(let i = 0;i< this.getControls().length;i++){
            polje.push(this.povezaniPovijestBolestiService.getSekundarneDijagnoze(
                this.getControls()[i].value.datum,
                this.getControls()[i].value.vrijeme,
                this.getControls()[i].value.slucaj,
                this.getControls()[i].value.primarnaDijagnoza,
                this.primljeniIDPacijent
            ));
        }
        const combined = forkJoin(polje).pipe(
            tap((odgovor: any) => {
                for(let i = 0;i< this.getControls().length;i++){
                    //Za svaku iteraciju povijesti bolesti, string se resetira
                    let str = new String("");
                    for(const dijagnoza of odgovor){
                        dijagnoza.forEach((element) => {
                            //Ako je šifra primarne dijagnoze iz form array-a JEDNAKA onoj iz fork joina
                            if(this.getControls()[i].value.datum === element.Datum
                              && this.getControls()[i].value.vrijeme === element.vrijeme
                              && this.getControls()[i].value.slucaj === element.tipSlucaj){
                                //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                str = str.concat(element.sekundarneDijagnoze + "\n");
                            }
                        });
                    }
                    //Taj spojeni string dodavam u form control polja sekundarnih dijagnoza
                    (<FormArray>(this.glavnaForma.get('povijestBolesti'))).at(i).get('sekundarneDijagnoze').patchValue(str === 'null\n' ? null : str, {emitEvent: false});
                }
            })
        ).subscribe();

        //Omogući pretraživanje po raznim parametrima
        const pretraga = this.forma.get('parametar').valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(value => {
                return this.povezaniPovijestBolestiService.getPovijestBolestiPretraga(
                    this.primljeniIDPacijent,
                    value);
            }),
            takeUntil(this.pretplateSubject)
        ).pipe(
            switchMap(
                //Dohvaćam odgovor
                (odgovor) => {
                    //Ako je server vratio neke rezultate
                    if(odgovor["success"] !== "false"){
                        //Brišem svaki form group u form arrayu povijesti bolesti prije nadodavanja novih form groupova pretrage

                        //Dok form array nije prazan
                        while(this.getControls().length !== 0){
                            //Briši mu prvi element
                            (<FormArray>this.glavnaForma.get('povijestBolesti')).removeAt(0);
                        }
                        //Stavljam neuspješnu poruku pretrage na null da se ne prikazuje na ekranu
                        this.porukaPovijestBolestiPretraga = null;
                        //Označavam da korisnik pretražuje povijesti bolesti
                        this.isPovijestBolestiPretraga = true;
                        //Restartam polje povijesti bolesti
                        this.povijestBolesti = [];
                        //Definiram svoj objekt
                        let objPovijestBolesti;
                        //Prolazim kroz sve dohvaćene povijesti bolesti sa servera
                        for(const povijest of odgovor){
                            //Kreiram objekt tipa "PovijestBolesti"
                            objPovijestBolesti = new PovijestBolesti(povijest);
                            //Nadodavam taj objekt u svoje polje
                            this.povijestBolesti.push(objPovijestBolesti);
                        }
                        //Kreiram pomoćno polje u kojemu će biti jedinstvene vrijednosti
                        let pomPretraga = [];
                        //Za svaku vrijednost u polju povijesti bolesti
                        for(let povijest of this.povijestBolesti){
                            //Ako se godina iz povijesti bolesti NE NALAZI u pomoćnom polju
                            if(pomPretraga.indexOf(povijest._godina) === -1){
                                //Dodaj tu godinu u pomoćno polje
                                pomPretraga.push(povijest._godina);
                            }
                            //Ako se godina iz povijesti bolesti NALAZI u pomoćnom polju
                            else{
                                //Dodjeljuje joj se vrijednost null
                                povijest.godina = null;
                            }
                        }
                        //Za svaku povijest bolesti, dodaj cijeli form group u form array
                        for(let povijest of this.povijestBolesti){
                            this.addControls(povijest);
                        }
                        let polje = [];
                        //Za svaku iteraciju povijesti bolesti
                        for(let i = 0;i< this.getControls().length;i++){
                            polje.push(this.povezaniPovijestBolestiService.getSekundarneDijagnoze(
                                this.getControls()[i].value.datum,
                                this.getControls()[i].value.vrijeme,
                                this.getControls()[i].value.slucaj,
                                this.getControls()[i].value.primarnaDijagnoza,
                                this.primljeniIDPacijent
                            ));
                        }
                        //VRAĆAM POLJE OBSERVABLE-A u kojima se nalaze šifre i nazivi sekundarnih dijagnoza
                        return forkJoin(polje).pipe(
                            tap((odgovor: any) => {
                                if(odgovor !== "false"){
                                  for(let i = 0;i< this.getControls().length;i++){
                                      //Za svaku iteraciju povijesti bolesti, string se resetira
                                      let str = new String("");
                                      for(const dijagnoza of odgovor){
                                          dijagnoza.forEach((element) => {
                                              //Ako je šifra primarne dijagnoze iz form array-a JEDNAKA onoj iz fork joina
                                              if(this.getControls()[i].value.datum === element.Datum
                                                && this.getControls()[i].value.vrijeme === element.vrijeme
                                                && this.getControls()[i].value.slucaj === element.tipSlucaj){
                                                  console.log(element);
                                                  //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                                  str = str.concat(element.sekundarneDijagnoze + "\n");
                                              }
                                          });
                                      }
                                      //Taj spojeni string dodavam u form control polja sekundarnih dijagnoza
                                      (<FormArray>(this.glavnaForma.get('povijestBolesti'))).at(i).get('sekundarneDijagnoze').patchValue(str === 'null\n' ? null : str, {emitEvent: false});
                                  }
                                }
                            })
                        );
                    }
                    //Ako je server vratio poruku da nema rezultata za navedenu pretragu
                    else{
                        //Spremam poruku servera
                        this.porukaPovijestBolestiPretraga = odgovor["message"];
                        //VRAĆAM "false"
                        return of(odgovor["success"]);
                    }
                }
            ),
            takeUntil(this.pretplateSubject)
        //Pretplaćujem se na odgovor servera (ILI šifre i nazive sek. dijagnoza ILI da NEMA REZULTATA ZA PRETRAGU)
        ).subscribe();

    }

    //Metoda koja dohvaća form arrayove pojedinih povijesti bolesti
    getControls(){
        return (<FormArray>this.glavnaForma.get('povijestBolesti')).controls;
    }

    //Metoda za dodavanje form controlova u form array godina
    addControls(povijestBolesti: PovijestBolesti){

        (<FormArray>this.glavnaForma.get('povijestBolesti')).push(
            new FormGroup({
              'godina': new FormControl(povijestBolesti._godina),
              'datum': new FormControl(povijestBolesti.datum),
              'razlogDolaska': new FormControl(povijestBolesti.razlogDolaska),
              'anamneza': new FormControl(povijestBolesti.anamneza),
              'primarnaDijagnoza': new FormControl(povijestBolesti.primarnaDijagnoza),
              'mkbSifraSekundarna': new FormControl(povijestBolesti.mkbSifraSekundarna),
              'sekundarneDijagnoze': new FormControl(null),
              'slucaj': new FormControl(povijestBolesti.tipSlucaj),
              'vrijeme': new FormControl(povijestBolesti.vrijeme),
              'prosliPregled': new FormControl(povijestBolesti.prosliPregled)
            })
        );
    }

    //Metoda koja emitira event prema komponenti "PovijestBolestiComponent" te joj prosljeđuje podatke iz retka stisnutog buttona
    poveziPovijestBolesti(
        datum: Date,
        razlogDolaska: string,
        primarnaDijagnoza: string,
        anamneza: string,
        vrijeme: Time,
        tipSlucaj: string){
        //Emitiram event
        this.podatciRetka.emit({
            datum,
            razlogDolaska,
            primarnaDijagnoza,
            anamneza,
            vrijeme,
            tipSlucaj
        });
    }

    //Metoda koja se poziva korisnik klikne button "Izađi"
    onClose(){
      this.close.emit();
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}
