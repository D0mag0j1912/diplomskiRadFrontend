import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, forkJoin, Subscription } from 'rxjs';
import { LoginService } from 'src/app/login/login.service';
import { Obrada } from 'src/app/shared/modeli/obrada.model';
import { ObradaService } from './obrada.service';

@Component({
  selector: 'app-obrada',
  templateUrl: './obrada.component.html',
  styleUrls: ['./obrada.component.css']
})
export class ObradaComponent implements OnInit, OnDestroy {

    //Pretplaćujem se na Observable koji vraća pacijente
    subs: Subscription;
    subsObrada: Subscription;
    subsAzurirajStatus: Subscription;
    subsGetPatients: Subscription;
    subsPorukeObrada: Subscription;
    subsSljedeciPacijentPretraga: Subscription;
    //Oznaka je li postoji sljedeći pacijent koji čeka u čekaonici
    isSljedeciPacijent: boolean = false;
    //Oznaka je li prozor poruke aktivan
    response: boolean = false;
    //Spremam poruku prozora
    responsePoruka: string = null;
    //Oznaka je li prikazan prozor pretrage pacijenata
    isPretraga: boolean = false;
    //Oznaka je li ima aktivnog pacijenta
    isAktivan: boolean = false;
    //Kreiram svoju formu
    forma: FormGroup;
    //Definiram broj trenutne stranice tablice 1
    stranica: number = 1;
    //Spremam pacijenta 
    pacijenti: Obrada;
    //Spremam sljedećeg pacijenta koji čeka na pregled
    sljedeciPacijent: string;
    //Spremam poruku sljedećeg pacijenta
    porukaSljedeciPacijent: string = null;
    //Oznaka je li pacijent naručen ili nije
    isNarucen: boolean = false;
    //Spremam vrijeme narudžbe
    narucenU: string = null;
    //Spremam poruku narudžbe
    porukaNarucen: string = null;
    //Spremam je li pacijent obrađen (u općim podatcima)
    isObradenOpciPodatci: boolean = false;
    //Spremam je li pacijent obrađen (povijest bolesti)
    isObradenPovijestBolesti: boolean = false;
    //Spremam je li korisnik prijavljen
    prijavljen: boolean = false;
    //Oznaka je li korisnik liječnik 
    isLijecnik: boolean = false;
    //Oznaka je li korisnik medicinska sestra
    isMedSestra: boolean = false;
    
    constructor(
      //Dohvaćam trenutni route da dohvatim podatke
      private route: ActivatedRoute,
      //Dohvaćam servis obrade
      private obradaService: ObradaService,
      //Dohvaćam login servis
      private loginService: LoginService
    ) { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit() {

      //Kreiram svoju formu
      this.forma = new FormGroup({
        'ime': new FormControl(null),
        'prezime': new FormControl(null)
      }, {validators: this.atLeastOneRequired});

      //Pretplaćujem se na podatke Resolvera 
      this.subsObrada = this.route.data.subscribe(
        //Dohvaćam podatke
        (pacijent: {pacijent: Obrada | any}) => {
          
          //Ako je odgovor servera pozitivan, tj. ima pacijenata u obradi
          if(pacijent.pacijent["success"] !== "false"){
            //Označavam da je pacijent aktivan
            this.isAktivan = true;
            //Spremam pacijente sa servera u svoje polje pacijenata
            this.pacijenti = pacijent.pacijent;
          }
        }
      );
      
      //Kombiniram odgovore dvije metode 
      const combined = combineLatest([
          this.obradaService.getSljedeciPacijent(),
          this.obradaService.getVrijemeNarudzbe(),
          this.obradaService.getObradenOpciPodatci(),
          this.obradaService.getObradenPovijestBolesti(),
          this.loginService.user
      ]);
      //Pretplaćujem se na odgovore servera na traženje sljedećeg pacijenta koji čeka na pregled I na vrijeme narudžbe aktivnog pacijenta
      this.subsPorukeObrada = combined.subscribe(
          (odgovor) => {
              //Ako je server vratio uspješnu poruku
              if(odgovor[0]["success"] != "false"){
                  //Označavam da ima sljedećeg pacijenta
                  this.isSljedeciPacijent = true;
                  //Spremam sljedećeg pacijenta
                  this.sljedeciPacijent = odgovor[0][0].imePacijent + " " + odgovor[0][0].prezPacijent;
              }
              else{
                //Spremam neuspješnu poruku
                this.porukaSljedeciPacijent = odgovor[0]["message"];
              }
              //Ako je pacijent naručen na taj dan
              if(odgovor[1]["success"] != "false"){
                  //Označavam da je pacijent naručen
                  this.isNarucen = true;
                  //Spremam mu vrijeme narudžbe
                  this.narucenU = odgovor[1][0]["Vrijeme"];
              }
              //Ako pacijent nije naručen za taj dan
              else{
                  //Spremam poruku da je nenaručen
                  this.porukaNarucen = odgovor[1]["message"];
              }
              //Ako je medicinska sestra potvrdila opće podatke ovog pacijenta
              if(odgovor[2][0]["IDPregled"] != null){
                  //Označavam da je sestra potvrdila opće podatke ovog pacijenta
                  this.isObradenOpciPodatci = true;
              }
              //Ako je liječnik potvrdio povijest bolesti ovog pacijenta
              if(odgovor[3][0]["IDPovijestBolesti"] != null){
                //Označavam da je liječnik potvrdio povijest bolesti ovog pacijenta
                this.isObradenPovijestBolesti = true;
              } 
              //Ako korisnički objekt nije null
              if(odgovor[4] != null){
                  if(odgovor[4]["tip"] === "lijecnik"){
                      //Označavam da je korisnik liječnik
                      this.isLijecnik = true;
                  }
                  else{
                      //Označavam da je korisnik medicinska sestra
                      this.isMedSestra = true;
                  }
              }
              console.log(odgovor);
              console.log(this.isLijecnik ? this.isObradenOpciPodatci ? "Medicinska sestra je obradila pacijenta!" : "Medicinska sestra nije obradila pacijenta!" 
                          : this.isObradenPovijestBolesti ? "Liječnik je obradio pacijenta!" : "Liječnik nije obradio pacijenta!");
          }
      );
    }

    //Metoda koja se pokreće kada korisnik klikne "Dodaj u čekaonicu" u prozoru pretrage pacijenta
    onSljedeciPacijent(){

        this.subsSljedeciPacijentPretraga = this.obradaService.getSljedeciPacijent().subscribe(
            //Dohvaćam pacijenta ili poruku da nema pacijenta
            (odgovor) => {
              //Ako ima SLJEDEĆEG pacijenta koji čeka na pregled
              if(odgovor["success"] !== "false"){
                  //Označavam da ima sljedećeg pacijenta
                  this.isSljedeciPacijent = true;
                  //Spremam sljedećeg pacijenta
                  this.sljedeciPacijent = odgovor[0].imePacijent + " " + odgovor[0].prezPacijent;
                  console.log(this.sljedeciPacijent);
              } 
              else{
                  //Spremam neuspješnu poruku
                  this.porukaSljedeciPacijent = odgovor["message"];
              }
            }
        );
    }

    //Metoda koja se izvršava kada korisnik klikne button "Završi pregled"
    zavrsiPregled(){

        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera za ažuriranje statusa pacijenta (cekaonica,obrada)
        this.subsAzurirajStatus = this.obradaService.editPatientStatus(this.pacijenti[0].idPacijent).subscribe();

        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera za dohvaćanje aktivnog pacijenta obrade (za ažuriranje template-a)
        this.subsGetPatients = this.obradaService.getPatientProcessing().subscribe(
          (odgovor) => {
            //Označavam da pacijent više nije aktivan
            this.isAktivan = false;
            //Stavljam vrijednost u Subject da je završen pregled
            this.obradaService.zavrsenPregled.next('zavrsenPregled');
          }
        );  
    }

    //Dohvaćam ime i prezime pacijenta
    getImePrezime(){
      return this.pacijenti[0].imePacijent + ' ' + this.pacijenti[0].prezPacijent;
    }
    //Dohvaćam datum rođenja pacijenta
    getDatRod(){
      return this.pacijenti[0].DatumRodenja;
    }
    //Dohvaćam adresu pacijenta
    getAdresa(){
      return this.pacijenti[0].adresaPacijent;
    }

    //Custom validator koji provjerava je li barem jedno od polja imena ili prezimena uneseno
    atLeastOneRequired(group : FormGroup) : {[s:string ]: boolean} {
      if (group) {
        if(group.controls['ime'].value || group.controls['prezime'].value) {
          return null;
        }
      }
      return {'error': true};
    }

    //Ova metoda se pokreće kada korisnik klikne button "Pretraži"
    onSubmit(){

      //Ako forma nije ispravna
      if(!this.forma.valid){
        return;
      }
      //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera
      this.subs = this.obradaService.getPatients(this.ime.value,this.prezime.value,this.stranica).subscribe(
        (odgovor) => {
          //Ako je odgovor negativan, tj. nema pacijenata
          if(odgovor["success"] == "false"){
            //Označavam da ima poruke servera
            this.response = true;
            //Spremam poruku servera u prozor
            this.responsePoruka = odgovor["message"];
            //Resetiram formu
            this.forma.reset();
          }
          //Ako je odgovor pozitivan, tj. ima pacijenata
          else{
            //Pošalji Subjectu uneseno ime ili prezime pacijenta i broj početne stranice tablice pacijenata
            this.obradaService.imePrezimePacijent.next({ime: this.ime.value, prezime: this.prezime.value,stranica: this.stranica});
            //Otvori tablicu pacijenata
            this.isPretraga = true;
            //Restiraj formu
            this.forma.reset();
          }
        }
      );
    }

    //Kada korisnik klikne button "Izađi" na prozoru poruke ili negdje izvan njega
    onClose(){
      //Zatvori prozor
      this.response = false;
    }

    //Kada korisnik klikne button "Izađi" na prozoru tablice pacijenata
    onCloseTablica(){
      //Zatvori prozor
      this.isPretraga = false;
    }

    //Getteri za form controlove
    get ime(): FormControl{
      return this.forma.get('ime') as FormControl;
    }
    get prezime(): FormControl{
      return this.forma.get('prezime') as FormControl;
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
      //Ako postoji pretplata
      if(this.subs){
        //Izađi iz pretplate
        this.subs.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsObrada){
        //Izađi iz pretplate
        this.subsObrada.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsAzurirajStatus){
        //Izađi iz pretplate
        this.subsAzurirajStatus.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsGetPatients){
        //Izađi iz pretplate
        this.subsGetPatients.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsPorukeObrada){
        //Izađi iz pretplate
        this.subsPorukeObrada.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsSljedeciPacijentPretraga){
        //Izađi iz pretplate
        this.subsSljedeciPacijentPretraga.unsubscribe();
      }
    }
}
