import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { switchMap,tap } from 'rxjs/operators';
import { MedSestraService } from 'src/app/med-sestra/med-sestra.service';
import { CekaonicaService } from '../cekaonica/cekaonica.service';
import { HeaderService } from '../header/header.service';
import { Pacijent } from '../modeli/pacijent.model';
import { ObradaService } from '../obrada/obrada.service';

@Component({
  selector: 'app-pretraga-pacijent',
  templateUrl: './pretraga-pacijent.component.html',
  styleUrls: ['./pretraga-pacijent.component.css']
})
export class PretragaPacijentComponent implements OnInit, OnDestroy {

    //Oznaka je li postoji odgovor servera
    response: boolean = false;
    //Spremam odgovor servera
    responsePoruka: string = null;
    //Kreiram pretplatu
    subsCijeliPacijent: Subscription;
    subsTrenutnaStranica: Subscription;
    subsCekaonica: Subscription;
    //Spremam ime i prezime pacijenta
    imePacijent: string = null;
    prezimePacijent: string = null;
    //Spremam sve dohvaćene pacijente u polje
    pacijenti: Pacijent[];
    //Spremam ukupni broj stranica (pagination)
    brojStranica: number;
    //Spremam broj trenutne stranice
    stranica: number;
    //Kreiram polje koje će imati elemenata koliki je broj ukupnih stranica
    fakeArray: any[];
    constructor(
      //Dohvaćam servis čekaonice
      private cekaonicaService: CekaonicaService,
      //Dohvaćam servis obrade
      private obradaService: ObradaService,
      //Dohvaćam header service
      private headerService: HeaderService
    ) { }
    //Kreiram event emitter koji će pokrenuti event kada se stisne "Close"
    @Output() close = new EventEmitter<any>();
    //Kreiram event emitter koji će pokrenuti event kada se stisne "Dodaj u čekaonicu"
    @Output() dodaj = new EventEmitter<any>();
    //Kreiram event emitter koji će pokrenuti event za sljedećeg pacijenta koji čeka na pregled
    @Output() sljedeciPacijent = new EventEmitter<any>();

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit() {

      const combined = this.obradaService.imePrezimePacijent.pipe(
          //Dohvaćam vrijednosti koje se nalaze u Subjectu
          switchMap(pacijenti => {
              return combineLatest([
                  //Vrijednosti iz Subjecta davam ovim dvaju metodama
                  this.obradaService.getPatients(pacijenti.ime,pacijenti.prezime,pacijenti.stranica),
                  this.obradaService.getData(pacijenti.ime,pacijenti.prezime)
              ]).pipe(
                  tap(odgovor => {
                      //Odgovor sa servera spremam u svoje varijable
                      this.pacijenti = odgovor[0];
                      this.imePacijent = pacijenti.ime;
                      this.prezimePacijent = pacijenti.prezime;
                      this.stranica = pacijenti.stranica;
                      this.brojStranica = odgovor[1]["brojStranica"];
                      this.fakeArray = new Array(this.brojStranica);
                  })    
              );    
          })
      );
      //Pretplaćujem se na odgovor servera
      this.subsCijeliPacijent = combined.subscribe();

    }

    //Metoda koja šalje backendu broj trenutne stranice
    setPage(brojTrenutneStranice: number){
          
        //Pretplaćujem se na Observable u kojemu se nalaze pacijenti koji odgovaraju trenutnoj stranici (1.stranica = prvih 5 pacijenata, 2.stranica = od 5. do 10. itd..)
        this.subsTrenutnaStranica = this.obradaService.getPatients(this.imePacijent,this.prezimePacijent,brojTrenutneStranice).subscribe(
          (pacijenti)=> {
            //U polje pacijenata spremam novih 5 pacijenata koji odgovaraju trenutnoj stranici
            this.pacijenti = pacijenti;
            //Ažuriram svoju varijablu trenutne stranice
            this.stranica = brojTrenutneStranice;
            console.log(this.stranica);
          }
        );
    }

    //Metoda koja dodava određenog pacijenta u čekaonicu
    onDodajCekaonica(id: number){

      //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na dodavanje pacijenta u čekaonicu
      this.subsCekaonica = this.headerService.tipKorisnikaObs.pipe(
          switchMap(tipKorisnik => {
              return this.cekaonicaService.addToWaitingRoom(tipKorisnik,id)
          })
      ).subscribe(
        //Uzimam odgovor
        (odgovor) => {
          //Označavam da ima odgovora servera
          this.response = true;
          //Spremam odgovor servera
          this.responsePoruka = odgovor["message"];
          //Pokrećem event
          this.dodaj.emit();
          //Pokrećem event za sljedećeg pacijenta
          this.sljedeciPacijent.emit();
        }
      );
    }

    //Ova metoda se pokreće kada korisnik klikne "Izađi" ili negdje izvan prozora
    onClose(){
      this.close.emit();
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
      //Ako postoji pretplata
      if(this.subsCijeliPacijent){
        //Izađi iz pretplate
        this.subsCijeliPacijent.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsCekaonica){
        //Izađi iz pretplate
        this.subsCekaonica.unsubscribe();
      }
      //Isprazni Subject
      this.obradaService.imePrezimePacijent.next(null);
    }

    //Ova metoda zatvara prozor poruke alerta
    onCloseAlert(){
      //Zatvori alert
      this.response = false;
    }
}
