import { Time } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { forkJoin, Subject} from 'rxjs';
import { switchMap,distinctUntilChanged, takeUntil, debounceTime, tap } from 'rxjs/operators';
import { OtvoreniSlucaj } from './otvoreniSlucaj.model';
import { OtvoreniSlucajService } from './otvoreni-slucaj.service';

@Component({
  selector: 'app-otvoreni-slucaj',
  templateUrl: './otvoreni-slucaj.component.html',
  styleUrls: ['./otvoreni-slucaj.component.css']
})
export class OtvoreniSlucajComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li pretraga dava rezultate
    isDijagnozaPretraga: boolean = false;
    //Poruka
    porukaDijagnozaPretraga: string = null;
    //Kreiram event tako da ga druge komponente mogu slušati
    @Output() close = new EventEmitter<any>();
    @Output() podatciRetka = new EventEmitter<{
        mkbSifraPrimarna: string,
        datumPregled: Date,
        vrijemePregled: Time,
        tipSlucaj: string}>();
    //Spremam ID trenutno aktivnog pacijenta
    idPacijent: number;
    //Primam podatke otvorenog slučaja od "OpciPodatciComponent"
    @Input() otvoreniSlucaji: OtvoreniSlucaj[];
    //Primam podatke sek. dijagnoza od "OpciPodatciComponent"
    @Input() sekDijagnoze: OtvoreniSlucaj[];
    //Primam ID trenutno aktivnog pacijenta
    @Input() idAktivniPacijent: number;
    //Kreiram svoju formu
    forma: FormGroup;

    constructor(
        //Dohvaćam servis otvorenog slučaja
        private otvoreniSlucajService: OtvoreniSlucajService
    ) {}

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){
        //Kreiram svoju formu
        this.forma = new FormGroup({
            'parametar': new FormControl(null)
        });

        //Pretplaćujem se na promjene u formi pretrage
        this.forma.get('parametar').valueChanges.pipe(
            debounceTime(100),
            distinctUntilChanged(),
            switchMap(value => {
                return this.pretraga(value, this.idAktivniPacijent);
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }

    //Metoda koja vraća Observable u kojemu se nalazi odgovor servera na pretragu
    pretraga(pretraga: string, idPacijent: number){
        return forkJoin([
            this.otvoreniSlucajService.getOtvoreniSlucajPretraga(pretraga,idPacijent),
            this.otvoreniSlucajService.getSekundarneDijagnoze(idPacijent)
        ]).pipe(
            tap((odgovor) => {
                //Ako je server vratio uspješni odgovor tj. ako ima aktivnih primarnih dijagnoza za pacijenta ZA NAVEDENU PRETRAGU
                if(odgovor[0]["success"] !== "false"){
                    //Označavam da ima pronađenih dijagnoza
                    this.isDijagnozaPretraga = true;
                    //Resetiram poruku da nema rezultata
                    this.porukaDijagnozaPretraga = null;
                    //Resetiram polje otvorenih slučajeva
                    this.otvoreniSlucaji = [];
                    //Definiram objekt tipa "OtvoreniSlucaj"
                    let objektOtvoreniSlucaj;
                    //Prolazim odgovorom servera
                    for(const slucaj of odgovor[0]){
                        //Za svaki objekt u odgovoru servera, kreiram svoj objekt tipa "OtvoreniSlucaj"
                        objektOtvoreniSlucaj = new OtvoreniSlucaj(slucaj);
                        //Dodavam novostvoreni objekt u svoje polje otvorenih slučaja
                        this.otvoreniSlucaji.push(objektOtvoreniSlucaj);
                    }
                    //Resetartam polje sekundarnih dijagnoza
                    this.sekDijagnoze = [];
                    //Definiram objekt tipa "OtvoreniSlucaj"
                    let objektSekDijagnoza;
                    //Prolazim kroz odgovor servera tj. sek dijagnoze sa servera
                    for(const dijagnoza of odgovor[1]){
                        //Za svaki objekt u odgovoru servera, kreiram svoj objekt tipa "OtvoreniSlucaj"
                        objektSekDijagnoza = new OtvoreniSlucaj(dijagnoza);
                        //Dodavam novostvoreni objekt u svoje polje otvorenih slučaja
                        this.sekDijagnoze.push(objektSekDijagnoza);
                    }
                }
                //Ako nema pronađenih rezultata ZA PRETRAGU
                else{
                    this.isDijagnozaPretraga = false;
                    //Spremam odgovor servera kao poruku koju ću prikazati na ekranu
                    this.porukaDijagnozaPretraga = odgovor[0]["message"];
                }
            })
        )
    }

    //Metoda koja se aktivira kada se klikne button "Poveži". Kao parameter prima podatke određenog retka
    poveziOtvoreniSlucaj(mkbSifraPrimarna: string,datumPregled: Date, vrijemePregled: Time, tipSlucaj: string){
        //Stavljam vrijednosti retka u EventEmitter da komponenta "Opći podatci pregleda" i "PovijestBolesti" dobije ovu poruku
        this.podatciRetka.emit({
          mkbSifraPrimarna,
          datumPregled,
          vrijemePregled,
          tipSlucaj
        });
    }

    //Metoda koja se poziva kada korisnik klikne "Izađi"
    onClose(){
      //Emitiraj event
      this.close.emit();
    }

    //Metoda koja se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}
