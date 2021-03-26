import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { switchMap,take,takeUntil,tap } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { CekaonicaService } from '../cekaonica/cekaonica.service';
import { Pacijent } from '../modeli/pacijent.model';
import { ObradaService } from '../obrada/obrada.service';

@Component({
  selector: 'app-pretraga-pacijent',
  templateUrl: './pretraga-pacijent.component.html',
  styleUrls: ['./pretraga-pacijent.component.css']
})
export class PretragaPacijentComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li postoji odgovor servera
    response: boolean = false;
    //Spremam odgovor servera
    responsePoruka: string = null;
    //Spremam ime i prezime pacijenta
    imePacijent: string = null;
    prezimePacijent: string = null;
    //Spremam sve dohvaćene pacijente u polje
    pacijenti: Pacijent[] = [];
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
      //Dohvaćam login servis
      private loginService: LoginService
    ) { }
    //Kreiram event emitter koji će pokrenuti event kada se stisne "Close"
    @Output() close = new EventEmitter<any>();
    //Kreiram event emitter koji će pokrenuti event kada se stisne "Dodaj u čekaonicu"
    @Output() dodaj = new EventEmitter<any>();
    //Kreiram event emitter koji će pokrenuti event za sljedećeg pacijenta koji čeka na pregled
    @Output() sljedeciPacijent = new EventEmitter<any>();

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit() {

      //Pretplaćujem se na odgovor servera
      this.obradaService.imePrezimePacijent.pipe(
          //Dohvaćam vrijednosti koje se nalaze u Subjectu
          switchMap(pacijenti => {
              console.log(pacijenti);
              return combineLatest([
                  //Vrijednosti iz Subjecta davam ovim dvaju metodama
                  this.obradaService.getPatients(pacijenti.ime,pacijenti.prezime,pacijenti.stranica),
                  this.obradaService.getData(pacijenti.ime,pacijenti.prezime)
              ]).pipe(
                  tap(odgovor => {
                      //Inicijaliziram praznu varijablu
                      let pacijent;
                      //Prolazim kroz sve JS objekte (pacijente) sa servera
                      for(const pac of odgovor[0]){
                          //Kreiram novi objekt tipa "Pacijent"
                          pacijent = new Pacijent(pac);
                          //Novo kreirani objekt nadodavam u polje pacijenata
                          this.pacijenti.push(pacijent);
                      }
                      this.imePacijent = pacijenti.ime;
                      this.prezimePacijent = pacijenti.prezime;
                      this.stranica = pacijenti.stranica;
                      this.brojStranica = odgovor[1]["brojStranica"];
                      this.fakeArray = new Array(this.brojStranica);
                  }),
                  takeUntil(this.pretplateSubject)    
              );    
          }),
          takeUntil(this.pretplateSubject)
      ).subscribe();

    }

    //Metoda koja šalje backendu broj trenutne stranice
    setPage(brojTrenutneStranice: number){
          
        //Pretplaćujem se na Observable u kojemu se nalaze pacijenti koji odgovaraju trenutnoj stranici (1.stranica = prvih 5 pacijenata, 2.stranica = od 5. do 10. itd..)
        this.obradaService.getPatients(this.imePacijent,this.prezimePacijent,brojTrenutneStranice).pipe(
            tap((pacijenti)=> {
                  //Praznim inicijalno polje pacijenata
                  this.pacijenti = [];    
                  //Inicijaliziram praznu varijablu
                  let pacijent;
                  //Prolazim kroz sve JS objekte (pacijente) sa servera
                  for(const pac of pacijenti){
                      //Kreiram novi objekt tipa "Pacijent"
                      pacijent = new Pacijent(pac);
                      //Novo kreirani objekt nadodavam u polje pacijenata
                      this.pacijenti.push(pacijent);
                  }
                  //Ažuriram svoju varijablu trenutne stranice
                  this.stranica = brojTrenutneStranice;
                  console.log(this.stranica);
                }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }

    //Metoda koja dodava određenog pacijenta u čekaonicu
    onDodajCekaonica(id: number){
        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na dodavanje pacijenta u čekaonicu
        this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                return this.cekaonicaService.addToWaitingRoom(user.tip,id).pipe(
                    takeUntil(this.pretplateSubject)
                );
            }),
            takeUntil(this.pretplateSubject)
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
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
        //Isprazni Subject
        this.obradaService.imePrezimePacijent.next(null);
    }

    //Ova metoda zatvara prozor poruke alerta
    onCloseAlert(){
        //Zatvori alert
        this.response = false;
        this.close.emit();
    }
}
