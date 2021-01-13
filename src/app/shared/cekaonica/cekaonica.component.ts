import { Time } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { merge, Subscription } from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { Cekaonica } from 'src/app/shared/modeli/cekaonica.model';
import { AlertComponent } from '../alert/alert.component';
import { BrisanjePacijentaAlertComponent } from '../brisanje-pacijenta-alert/brisanje-pacijenta-alert.component';
import { HeaderService } from '../header/header.service';
import { ObradaService } from '../obrada/obrada.service';
import { CekaonicaService } from './cekaonica.service';

@Component({
  selector: 'app-cekaonica',
  templateUrl: './cekaonica.component.html',
  styleUrls: ['./cekaonica.component.css']
})
export class CekaonicaComponent implements OnInit, OnDestroy{
    //Kreiram polje u kojemu se nalaze svi statusi čekaonice
    statusi: Array<string> = ['Čeka na pregled','Na pregledu','Završen pregled'];
    //Kreiram polje u kojega ću spremati selektirane checkboxove
    selectedStatusValues = [];
    //Spremam pretplate
    subs: Subscription;
    subsPrijavljen: Subscription;
    subsObrada: Subscription;
    subsPretraga: Subscription;
    subsAzurirajStanje: Subscription;
    subs10zadnjih: Subscription;
    subsStatus: Subscription;
    subsBrisanje: Subscription;
    subsCheckCount: Subscription;
    //Oznaka jesu li detalji pregleda aktivirani
    isDetaljiPregleda: boolean = false;
    //Oznaka je li brisanje aktivirano
    isBrisanje: boolean = false;
    //Oznaka ima li odgovora servera
    response: boolean = false;
    //Spremam odgovor servera
    responsePoruka: string = null;
    //Oznaka je li korisnik pretražuje ili ne
    isPretraga: boolean = false;
    //Kreiram svoju formu
    forma: FormGroup;
    formaStatus: FormGroup;
    //Spremam pacijente
    pacijenti: Cekaonica[];
    //Definiram broj početne stranice u pretrazi
    stranica: number = 1;
    //Oznaka je li cekaonica prazna
    isPrazna: boolean = true;
    //Oznaka je li checkbox označen
    isChecked: boolean = false;
    //Oznaka je li pacijent dodan u obradu
    isDodanObrada: boolean = false;
    //Oznaka je li korisnik prijavljen
    prijavljen: boolean = false;
    //Oznaka je li korisnik liječnik
    isLijecnik: boolean = false;
    //Oznaka je li korisnik medicinska sestra
    isMedSestra: boolean = false;

    //Spremam podatke izbrisanog retka čekaonice
    idObrada: number;
    idCekaonica: number;
    index: number;
    imePacijent: string;
    prezPacijent: string;
    datumDodavanja: Date;
    vrijemeDodavanja: Time;
    statusCekaonica: string;
    //Kreiram instancu komponente "AlertComponent"
    private alertComponent: AlertComponent;
    //Kreiram instancu komponente "AlertComponent"
    private brisanjeComponent: BrisanjePacijentaAlertComponent;
    //Dohvaćam child komponentu "BrisanjePacijentaAlertComponent" kada se ova komponenta prikaže tj. ngif=true
    @ViewChild('brisanjeComponent',{static: false}) set brisanjeKomponenta(komponenta: BrisanjePacijentaAlertComponent){
        //Ovo se samo prikazuje ako se otvori prozor za brisanje pacijenta iz čekaonice
        if(komponenta && this.isBrisanje){
            this.brisanjeComponent = komponenta;
            //Dohvaćam div u toj komponenti (class = "alert-box")
            const div = this.brisanjeComponent.alertbox.nativeElement;
            //Postavljam širinu
            div.style.width = "30vw";
            //Postavljam lijevu marginu
            div.style.left = "30vw";
            //Kreiram poruku koja će se prikazati korisniku
            const newP = document.createElement("h5");
            newP.innerHTML = `Jeste li sigurni da želite izbrisati pacijenta:`;
            div.insertBefore(newP,div.children[1]);  
            const imePrezime = document.createElement("h5");
            imePrezime.innerHTML = "Ime i prezime: ";
            const boldImePrezime = document.createElement("b");
            boldImePrezime.innerHTML = this.imePacijent + " " + this.prezPacijent;
            boldImePrezime.style.fontWeight = "bold";
            imePrezime.append(boldImePrezime);
            div.insertBefore(imePrezime,div.children[2]);
            const datumDodavanjaH = document.createElement("h5");
            datumDodavanjaH.innerHTML = "Datum dodavanja: ";
            const boldDatumDodavanja = document.createElement("b");
            boldDatumDodavanja.innerHTML = this.datumDodavanja.toString();
            boldDatumDodavanja.style.fontWeight = "bold";
            datumDodavanjaH.append(boldDatumDodavanja);
            div.insertBefore(datumDodavanjaH,div.children[3]);
            const vrijemeDodavanjaH = document.createElement("h5");
            vrijemeDodavanjaH.innerHTML = "Vrijeme dodavanja: ";
            const boldVrijemeDodavanja = document.createElement("b");
            boldVrijemeDodavanja.innerHTML = this.vrijemeDodavanja.toString();
            boldVrijemeDodavanja.style.fontWeight = "bold";
            vrijemeDodavanjaH.append(boldVrijemeDodavanja);
            div.insertBefore(vrijemeDodavanjaH,div.children[4]);
            const statusCekaonicaH = document.createElement("h5");
            statusCekaonicaH.innerHTML = "Status čekaonice: ";
            const boldStatusCekaonica = document.createElement("b");
            boldStatusCekaonica.innerHTML = this.statusCekaonica;
            boldStatusCekaonica.style.fontWeight = "bold";
            statusCekaonicaH.append(boldStatusCekaonica);
            div.insertBefore(statusCekaonicaH,div.children[5]);
        }   
    }
    //Dohvaćam child komponentu "AlertComponent" kada se ova komponenta prikaže tj. ngIf = true
    @ViewChild('childAlert',{static: false}) set content(content: AlertComponent){
        //Ovo se samo prikazuje ako se otvori prozor da je pacijent dodan u obradu
        if(content && this.isDodanObrada){
            this.alertComponent = content;
            //Dohvaćam div u toj komponenti (class = "alert-box")
            const div = this.alertComponent.alertBoxActions.nativeElement;
            //Kreiram novi button
            const button = document.createElement("button");
            //Uređivam button
            button.className = "btn btn-info";
            button.type = "button";
            button.innerHTML = "Pođi u obradu";
            button.style.margin = "5px";
            //Ubacivam button u div
            div.prepend(button);
            //Slušam event na ovom buttonu
            button.addEventListener("click",() => {
                //Izađi iz ovog prozora
                this.response = false;
                //Ako je tip korisnika "Medicinska sestra":
                if(this.isMedSestra){
                    //Pođi na stranicu općih podataka pregleda
                    this.router.navigate(['../obrada/opciPodatci'], {relativeTo: this.route});
                }
                else if(this.isLijecnik){
                    //Pođi na stranicu povijesti bolesti
                    this.router.navigate(['../obrada/povijestBolesti'], {relativeTo: this.route});
                }
            }); 
        }
    }
    constructor(
      //Dohvaćam trenutni url
      private route: ActivatedRoute,
      //Dohvaćam servis čekaonice
      private cekaonicaService: CekaonicaService,
      //Pravim formu
      private fb: FormBuilder,
      //Dohvaćam servis obrade
      private obradaService: ObradaService,
      //Dohvaćam router
      private router: Router,
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

      this.formaStatus = this.fb.group({
        statusi: this.dodajStatusKontrole()
      });

      //Pretplaćujem se na podatke koje je Resolver poslao tj. pacijente u čekaonici
      this.subs = this.route.data.subscribe(
        (podatci: {pacijenti: Cekaonica[] | any}) => {
          console.log(podatci.pacijenti);
          //Ako je odgovor servera da je cekaonica NIJE prazna:
          if(podatci.pacijenti["success"] !== "false"){
            //Dohvaćene pacijente spremam u polje
            this.pacijenti = podatci.pacijenti;
            console.log(this.pacijenti);
            //Označavam da čekaonica nije prazna
            this.isPrazna = false;
          }
        }
      );

      //Pretplaćujem se na Subject iz login servisa
      this.subsPrijavljen = this.loginService.user.subscribe(
        (user) => {
          //Ako postoji user u Subjectu, to znači da je prijavljen, ako ne postoji, prijavljen = false 
          this.prijavljen = !user ? false : true;
          //Ako je korisnik prijavljen
          if(this.prijavljen){
            //Ako je tip prijavljenog korisnika "lijecnik":
            if(user["tip"] == "lijecnik"){
              //Označavam da se liječnik prijavio
              this.isLijecnik = true;
            } else if(user["tip"] == "sestra"){
              //Označavam da se medicinska sestra prijavila
              this.isMedSestra = true;
            }
          }
      });

    }

    //Metoda koja otvara prozor detalja pregleda
    onOtvoriDetalje(idObrada: number,tip: string){
        console.log(idObrada);
        console.log(tip);
        //U Behaviour Subject ubacivam podatke iz retka čekaonice da ih mogu proslijediti detaljima pregleda
        this.cekaonicaService.podatciPregleda.next({tip,idObrada});
        //Otvori prozor detalja
        this.isDetaljiPregleda = true; 
    }

    //Metoda koja provjerava broj preostalih pacijenata u čekaonici
    checkCountCekaonica(){

        this.subsCheckCount = this.cekaonicaService.checkCountCekaonica().subscribe(
            //Dohvaćam broj pacijenata u čekaonici
            (brojPacijenata) => {
                //Ako više nema pacijenata u čekaonici
                if(brojPacijenata == 0){
                    //Označavam da je čekaonica prazna
                    this.isPrazna = true;
                }
            }
        );
    }

    //Metoda koja briše pacijenta iz čekaonice
    onDeleteCekaonica(idObrada: number, idCekaonica: number,index:number){
        
        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na brisanje pacijenta iz čekaonice
        this.subsBrisanje = this.cekaonicaService.onDeleteCekaonica(idObrada,idCekaonica).subscribe(
            //Dohvaćam odgovor servera
            (odgovor) => {
                //Označavam da ima odgovora servera
                this.response = true;
                //Spremam poruku servera
                this.responsePoruka = odgovor["message"];
                //Brišem pacijenta na indexu retka na kojem je kliknut button "Izbriši iz čekaonice"
                this.pacijenti.splice(index,1);
                //Provjeravam broj pacijenata u čekaonici
                this.checkCountCekaonica();
                //Zatvaram prozor za brisanje
                this.isBrisanje = false;
            }
        );
    }

    //Metoda koja prikuplja sve podatke iz izbrisanog retka čekaonice da bi ih proslijedila uvodnom prozoru brisanja
    onGetTableData(idObrada: number, idCekaonica: number,index: number,imePacijent: string, prezPacijent: string,datum: Date,vrijeme: Time,status: string){
        //Spremam podatke iz retka čekaonice u svoje varijable
        this.idObrada = idObrada;
        this.idCekaonica = idCekaonica;
        this.index = index;
        this.imePacijent = imePacijent;
        this.prezPacijent = prezPacijent;
        this.datumDodavanja = datum;
        this.vrijemeDodavanja = vrijeme;
        this.statusCekaonica = status;

        //Prvo otvaram prozor za brisanje u kojemu liječnik potvrđuje brisanje ili odustaje
        this.isBrisanje = true;
    }

    //Metoda koja se pokreće kada korisnik klikne "Obriši" u prozoru brisanja
    onBrisanje(){
        //Pokreni postupak brisanja
        this.onDeleteCekaonica(this.idObrada,this.idCekaonica,this.index);
    }

    //Metoda koja kreira polje koje se sastoji do form controlova statusa čekaonice
    dodajStatusKontrole(){
      //Za svaki element u polju "statusi", kreira se novi FormControl koji nije označen defaultno
      const arr = this.statusi.map((element) => {
        return this.fb.control(false);
      })

      //Vraćam polje form controlova
      return this.fb.array(arr);
    }

    //Metoda koja dohvaća 
    getSelectedStatusValues(){
        //Isprazni polje statusa
        this.selectedStatusValues = [];
        //Prolazimo kroz polje forma controlova
        this.poljeStatusa.controls.forEach((control, i) => {
          if(control.value){
            this.selectedStatusValues.push(this.statusi[i]);
          }
        });

        //Pretplaćujem se na Observable u kojemu se nalaze pacijenti određenog statusa
        this.subsStatus = this.cekaonicaService.getPatientByStatus(this.selectedStatusValues).subscribe(
          //Dohvaćam odgovor servera (pacijente)
          (pacijenti) => {
            //Dohvaćene pacijente spremam u svoje polje pacijenata
            this.pacijenti = pacijenti;
          }
        );
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

    //Metoda koja se poziva kada korisnik klikne button "Dodaj u obradu"
    onDodajObrada(id: number){
        let tipKorisnik;
        //Ako je prijavljen liječnik:
        if(this.isLijecnik){
            tipKorisnik = "lijecnik";
        }
        //Ako je prijavljena medicinska sestra
        else{
            tipKorisnik = "sestra";
        }
        //Kombiniram dvije metode da rezultati dođu u isto vrijeme
        const combined = this.obradaService.addPatientToProcessing(tipKorisnik,id).pipe(
          switchMap(odgovor => {
              return this.cekaonicaService.getPatientsWaitingRoom().pipe(
                  tap(pacijenti => {
                      //Označavam da ima odgovora servera 
                      this.response = true;
                      //Spremam poruku servera 
                      this.responsePoruka = odgovor["message"];
                      //Ako je server vratio da je pacijent uspješno dodan u obradu
                      if(this.responsePoruka !== "Već postoji aktivan pacijent!"){
                          //Označavam da je pacijent dodan u obradu
                          this.isDodanObrada = true;
                      }
                      //Spremam novu verziju pacijenata
                      this.pacijenti = pacijenti;
                  })
              );
          })
        );
        //Pretplaćujem se na rezultate da ih dohvatim
        this.subsObrada = combined.subscribe();
      
    }

    //Metoda se pokreće kada korisnik klikne "Pretraži"
    onSubmit(){
        //Ako forma nije ispravna
      if(!this.forma.valid){
        return;
      }
      //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera
      this.subsPretraga = this.obradaService.getPatients(this.ime.value,this.prezime.value,this.stranica).subscribe(
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

    //Metoda se pokreće kada korisnik klikne "Dodaj u čekaonicu"
    onAzurirajStanje(){

        //Pretplaćujem se na Observable u kojemu se nalaze novi pacijenti čekaonice
        this.subsAzurirajStanje = this.cekaonicaService.getPatientsWaitingRoom().subscribe(
          //Uzimam pacijente
          (pacijenti) => {
            //Označavam da čekaonica više nije prazna
            this.isPrazna = false;
            //Spremam pacijente u svoje polje da mogu ažurirati template
            this.pacijenti = pacijenti;
          }
        );
    }

    //Metoda koja se pokreće kada se stisne button "Prikaži 10 zadnjih"
    prikazi10zadnjih(){

      //Pretplaćujem se na Observable u kojemu se nalaze pacijenti
      this.subs10zadnjih = this.cekaonicaService.getTenLast().subscribe(
        //Uzimam odgovor
        (pacijenti) => {
          //Pacijente iz odgovora spremam u svoje polje
          this.pacijenti = pacijenti;
          //Označi checkboxove neaktivnima
          this.formaStatus.reset();
          console.log(this.pacijenti);
        }
      );
    }

    //Getteri za form controlove i polja
    get ime(): FormControl{
      return this.forma.get('ime') as FormControl;
    }
    get prezime(): FormControl{
      return this.forma.get('prezime') as FormControl;
    }
    get poljeStatusa(): FormArray{
      return this.formaStatus.get('statusi') as FormArray;
    }
    //Dohvaća pojedine form controlove unutar polja 
    getControlsStatusi(){
      return this.poljeStatusa.controls;
    }

    //Metoda se pokreće kada se zatvori prozor poruke
    onClose(){
      //Zatvori prozor
      this.response = false;
    }

    //Metoda se pokreće kada se zatvori prozor pretrage
    onCloseTablica(){
      //Zatvori prozor
      this.isPretraga = false;
    }

    //Metoda koja zatvara prozor brisanja
    onCloseBrisanje(){
        //Zatvori prozor
        this.isBrisanje = false;
    }

    //Metoda koja se aktivira kada korisnik klikne "Izađi" ili negdje vanka
    onCloseDetaljiPregleda(){
        //Zatvori prozor
        this.isDetaljiPregleda = false;
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
      if(this.subsPretraga){
        //Izađi iz pretplate
        this.subsPretraga.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsAzurirajStanje){
        //Izađi iz pretplate
        this.subsAzurirajStanje.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsStatus){
        //Izađi iz pretplate
        this.subsStatus.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsBrisanje){
        //Izađi iz pretplate
        this.subsBrisanje.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsCheckCount){
        //Izađi iz pretplate
        this.subsCheckCount.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsPrijavljen){
        //Izađi iz pretplate
        this.subsPrijavljen.unsubscribe();
      }
      //Praznim Subject 
      this.obradaService.imePrezimePacijent.next(null);
    }

}
