import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { forkJoin, of, Subject } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { Mjesto } from 'src/app/shared/modeli/mjesto.model';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';
import { Recept } from 'src/app/shared/modeli/recept.model';
import { ZdravstvenaUstanova } from 'src/app/shared/modeli/zdravstvenaUstanova.model';
import { ReceptService } from '../../recept.service';
import { PrikazReceptService } from './prikaz-recept.service';

@Component({
  selector: 'app-prikaz-recept',
  templateUrl: './prikaz-recept.component.html',
  styleUrls: ['./prikaz-recept.component.css']
})
export class PrikazReceptComponent implements OnInit, OnDestroy {

    //Kreiram Subject koji upravlja pretplatama
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li recept ponovljiv ili nije
    isPonovljiv: boolean = false;
    //Oznaka je li recept ima šifru specijalista
    isSpecijalist: boolean = false;
    //Oznaka je li recept ima sekundarnih dijagnoza
    isSekundarna: boolean = false;
    //Oznaka je li proizvod lijek ili mag.pripravak
    isLijek: boolean = false;
    //Kreiram formu
    forma: FormGroup;
    //Kreiram event emitter
    @Output() close = new EventEmitter<any>();
    //Dohvaćam podatke recepta iz retka tablice liste recepata
    @Input() primljeniRecept: Recept;
    //Spremam podatke zdravstvene ustanove
    zdrUstanova: ZdravstvenaUstanova;
    //Spremam podatke poštanskog broja i naziva mjesta
    mjesto: Mjesto;
    //Spremam podatke recepta
    objektRecept: Recept;
    //Spremam podatke pacijenta
    pacijent: Pacijent;
    //Spremam sve šifre i nazive sekundarnih dijagnoza
    str: String;
    //Spremam tip specijalista
    tipSpecijalistBaza: string = null;

    constructor(
        //Dohvaćam servis prikaza recepta
        private prikazService: PrikazReceptService,
        //Dohvaćam servis recepta
        private receptService: ReceptService
    ) { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit() {
        //Pretplaćivam se podatke koje trebam prikazati u prikazu recepta
        const combined = forkJoin([
            this.prikazService.getPacijentRecept(this.primljeniRecept),
            this.prikazService.getZdrUst()
        ]).pipe(
            tap(podatci => {
                //Spremam podatke sa servera u svoje objekte
                this.zdrUstanova = new ZdravstvenaUstanova(podatci[1][0]);
                console.log(this.zdrUstanova);
                this.mjesto = new Mjesto(podatci[1][0]);
                this.objektRecept = new Recept(podatci[0][0]);
                this.pacijent = new Pacijent(podatci[0][0]);
                //Ako je server vratio da je recept običan i da je broj ponavljanja null (tj. 0)
                if(this.objektRecept.ponovljivost === "obican" && !this.objektRecept.brojPonavljanja){
                    //Označavam da je recept običan
                    this.isPonovljiv = false;
                }
                //Ako je server vratio da je recept ponovljiv i da je broj ponavljanja cijeli broj (1-5)
                else if(this.objektRecept.ponovljivost === "ponovljiv" && this.objektRecept.brojPonavljanja){
                    //Označavam da je recept ponovljiv
                    this.isPonovljiv = true;
                }
                //Ako je server vratio šifru specijalista
                if(this.objektRecept.sifraSpecijalist){
                    //Označavam da treba prikazati redak sa šifrom specijalista
                    this.isSpecijalist = true;
                }
                //Ako server nije vratio šifru specijalista
                else{
                    //Označavam da ne treba prikazati redak sa šifrom specijalista
                    this.isSpecijalist = false;
                }
                //Ako je server vratio neku vrijednost za OJP, znači da je riječ o lijeku
                if(this.objektRecept.oblikJacinaPakiranjeLijek){
                    //Označavam da je riječ o lijeku
                    this.isLijek = true;
                }
                //Ako server NIJE vratio neku vrijednost za OJP, znači da je riječ o mag.pripravku
                else if(!this.objektRecept.oblikJacinaPakiranjeLijek){
                    //Označavam da je riječ o magistralnom pripravku
                    this.isLijek = false;
                }
            }),
            mergeMap(()=> {
                //Ako server nije vratio sekundarne dijagnoza tj. (mkbSifraSekundarna === null)
                if(!this.objektRecept.mkbSifraSekundarna){
                    //Označavam da nema sekundarnih dijagnoza i prikazivam poruku da IH NEMA u polju sek. dijagnoza
                    this.isSekundarna = false;
                    return this.receptService.getDatumDostatnost(this.objektRecept.dostatnost).pipe(
                        tap(datum => {
                            //Spremam datum "Vrijedi do" u svoj model
                            this.objektRecept.vrijediDo = datum;
                        })
                    );
                }
                //Ako je server VRATIO sekundarne dijagnoze
                else{
                    //Označavam da IMA sekundarnih dijagnoza
                    this.isSekundarna = true;
                    //Predavam šifre sek. dijagnoza metodi koja dohvaća sve nazive sek. dijagnoza na osnovu tih šifri
                    return forkJoin([
                        this.prikazService.getSekundarneDijagnoze(this.objektRecept.mkbSifraSekundarna),
                        this.receptService.getDatumDostatnost(this.objektRecept.dostatnost)
                    ]).pipe(
                        tap(podatci => {
                            this.str = new String("");
                            for(const dijagnoza of podatci[0]){
                                //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                this.str = this.str.concat(dijagnoza.mkbSifra + " | " + dijagnoza.imeDijagnoza + "\n");
                            }
                            //Spremam datum "Vrijedi do" u svoj model
                            this.objektRecept.vrijediDo = podatci[1];
                        })
                    );
                }
            }),
            mergeMap(() => {
                //Ako je server vratio šifru specijalista
                if(this.isSpecijalist){
                    //Pozivam metodu koja će dohvatiti tip specijalista
                    return this.prikazService.getTipSpecijalist(this.objektRecept.sifraSpecijalist).pipe(
                        tap(tipSpecijalist => {
                            //Spremam tip specijalista
                            this.tipSpecijalistBaza = tipSpecijalist;
                        })
                    );
                }
                //Ako server nije vratio šifru specijalista
                else if(!this.isSpecijalist){
                    return of(null);
                }
            }),
            tap(() => {
                //Kreiram formu
                this.forma = new FormGroup({
                    'ustanova': new FormGroup({
                        'imePrezimeLijecnik': new FormControl(this.zdrUstanova.lijecnik),
                        'nazivUstanova': new FormControl(this.zdrUstanova.naziv),
                        'adresaUstanova': new FormControl(this.zdrUstanova.adresa),
                        'pbrUstanova': new FormControl(this.mjesto.pbrMjesto),
                        'mjestoUstanova': new FormControl(this.mjesto.nazivMjesto),
                        'telefonUstanova': new FormControl(this.zdrUstanova.telefon)
                    }),
                    'recept': new FormGroup({
                            'tipRecept': new FormControl(this.isPonovljiv ? "Ponovljiv recept" : "Običan recept"),
                            'hitnost': new FormControl(this.objektRecept.hitnost === "hitno" ? "Hitno" : "Nije hitno"),
                            'brojPonavljanja': new FormControl(this.isPonovljiv ? this.objektRecept.brojPonavljanja : null),
                            'datumRecept': new FormControl(this.objektRecept.datumRecept)
                    }),
                    'podatciPacijenta': new FormGroup({
                        'imePrezimePacijent': new FormControl(this.objektRecept.imePrezimePacijent),
                        'datumRodenjaPacijent': new FormControl(this.pacijent.datRod),
                        'adresaPacijent': new FormControl(this.pacijent.adresa)
                    }),
                    'dijagnoze': new FormGroup({
                        'primarnaDijagnoza': new FormControl(this.objektRecept.mkbSifraPrimarna),
                        'sekundarnaDijagnoza': new FormControl(this.isSekundarna ? this.str : "Nema evidentiranih sekundarnih dijagnoza!")
                    }),
                    'proizvod': new FormGroup({
                        'imeProizvod': new FormControl(this.objektRecept.proizvod)
                    }),
                    'detaljiProizvod': new FormGroup({
                        'kolicinaProizvod': new FormControl(this.objektRecept.kolicina),
                        'doziranjeProizvod': new FormControl(this.objektRecept.doziranje),
                        'dostatnostProizvod': new FormControl(this.objektRecept.dostatnost),
                        'vrijediDoProizvod': new FormControl(this.objektRecept.vrijediDo)
                    }),
                    'specijalist': new FormGroup({
                        'sifraSpecijalist': new FormControl(this.isSpecijalist ? this.objektRecept.sifraSpecijalist : null),
                        'tipSpecijalist': new FormControl(this.isSpecijalist ? this.tipSpecijalistBaza : null)
                    })
                });
            })
        ).subscribe();
    }

    //Ova metoda se poziva kada korisnik klikne "Izađi" ili negdje izvan prozora
    onClose(){
        //Emitiraj event prema roditeljskoj komponenti
        this.close.emit();
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

    get recept(): FormGroup{
        return this.forma.get('recept') as FormGroup;
    }
    //Kreiram gettere za Form controlove
    get tipRecept(): FormControl{
      return this.forma.get('recept.tipRecept') as FormControl;
    }
    get hitnost(): FormControl{
        return this.forma.get('recept.hitnost') as FormControl;
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
