import { Time } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import {switchMap, take, takeUntil, tap} from 'rxjs/operators';
import { Cekaonica } from 'src/app/shared/modeli/cekaonica.model';
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

    //Kreiram novi Subject pomoću kojega izlazim iz pretplata
    pretplateSubject = new Subject<boolean>();
    //Kreiram polje u kojemu se nalaze svi statusi čekaonice
    statusi: Array<string> = ['Čeka na pregled','Na pregledu','Završen pregled'];
    //Kreiram polje u kojega ću spremati selektirane checkboxove
    selectedStatusValues = [];
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
    pacijenti: Cekaonica[] = [];
    //Definiram broj početne stranice u pretrazi
    stranica: number = 1;
    //Oznaka je li cekaonica prazna
    isPrazna: boolean = true;
    //Oznaka je li checkbox označen
    isChecked: boolean = false;
    //Oznaka je li korisnik prijavljen
    prijavljen: boolean = false;
    //Oznaka je li korisnik liječnik
    isLijecnik: boolean = false;
    //Oznaka je li korisnik medicinska sestra
    isMedSestra: boolean = false;
    //Oznaka koji je tip korisnika prijavljen da ga mogu usporediti sa tipom korisnika iz retka
    tipKorisnik: string = null;
    brojRetka: number;
    //Spremam podatke izbrisanog retka čekaonice
    idCekaonica: number;
    index: number;
    imePacijent: string;
    prezPacijent: string;
    datumDodavanja: Date;
    vrijemeDodavanja: Time;
    statusCekaonica: string;
    tip: string;
    //Kreiram instancu komponente "BrisanjePacijentaAlertComponent"
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
            div.style.left = "35vw";
            //Postavljam border-radius
            div.style.borderRadius = '7px';
            //Kreiram poruku koja će se prikazati korisniku
            const newP = document.createElement("h5");
            newP.innerHTML = `Jeste li sigurni da želite izbrisati pacijenta:`;
            newP.style.fontFamily = 'Verdana, sans-serif';
            div.insertBefore(newP,div.children[1]);  
            const imePrezime = document.createElement("h5");
            imePrezime.innerHTML = "Ime i prezime: ";
            imePrezime.style.fontFamily = 'Verdana, sans-serif';
            const boldImePrezime = document.createElement("b");
            boldImePrezime.innerHTML = this.imePacijent + " " + this.prezPacijent;
            boldImePrezime.style.fontWeight = "bold";
            boldImePrezime.style.fontFamily = 'Verdana, sans-serif';
            imePrezime.append(boldImePrezime);
            div.insertBefore(imePrezime,div.children[2]);
            const datumDodavanjaH = document.createElement("h5");
            datumDodavanjaH.innerHTML = "Datum dodavanja: ";
            datumDodavanjaH.style.fontFamily = 'Verdana, sans-serif';
            const boldDatumDodavanja = document.createElement("b");
            boldDatumDodavanja.innerHTML = this.datumDodavanja.toString();
            boldDatumDodavanja.style.fontWeight = "bold";
            boldDatumDodavanja.style.fontFamily = 'Verdana, sans-serif';
            datumDodavanjaH.append(boldDatumDodavanja);
            div.insertBefore(datumDodavanjaH,div.children[3]);
            const vrijemeDodavanjaH = document.createElement("h5");
            vrijemeDodavanjaH.innerHTML = "Vrijeme dodavanja: ";
            vrijemeDodavanjaH.style.fontFamily = 'Verdana, sans-serif';
            const boldVrijemeDodavanja = document.createElement("b");
            boldVrijemeDodavanja.innerHTML = this.vrijemeDodavanja.toString();
            boldVrijemeDodavanja.style.fontWeight = "bold";
            boldVrijemeDodavanja.style.fontFamily = 'Verdana, sans-serif';
            vrijemeDodavanjaH.append(boldVrijemeDodavanja);
            div.insertBefore(vrijemeDodavanjaH,div.children[4]);
            const statusCekaonicaH = document.createElement("h5");
            statusCekaonicaH.innerHTML = "Status čekaonice: ";
            statusCekaonicaH.style.fontFamily = 'Verdana, sans-serif';
            const boldStatusCekaonica = document.createElement("b");
            boldStatusCekaonica.innerHTML = this.statusCekaonica;
            boldStatusCekaonica.style.fontWeight = "bold";
            boldStatusCekaonica.style.fontFamily = 'Verdana, sans-serif';
            statusCekaonicaH.append(boldStatusCekaonica);
            div.insertBefore(statusCekaonicaH,div.children[5]);
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
      //Dohvaćam header servis
      private headerService: HeaderService
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
      //Pretplaćujem se na odgovor Resolvera tj. inicijalnih pacijenata u čekaonici
      this.headerService.tipKorisnikaObs.pipe(
          switchMap(tipKorisnik => {
              //Ako je tip prijavljenog korisnika "lijecnik":
              if(tipKorisnik == "lijecnik"){
                  //Označavam da se liječnik prijavio
                  this.isLijecnik = true;
              } else if(tipKorisnik== "sestra"){
                  //Označavam da se medicinska sestra prijavila
                  this.isMedSestra = true;
              }
              //Spremam tip prijavljenog korisnika
              this.tipKorisnik = tipKorisnik;
              return this.route.data;
          }),
          takeUntil(this.pretplateSubject)
      ).subscribe(
          //Dohvaćam odgovor tj. pacijente iz čekaonice
          (odgovor)=>{
              //Ako je odgovor servera da je cekaonica NIJE prazna:
              if(odgovor.pacijenti["success"] !== "false"){
                //Inicijaliziram praznu varijablu u kojoj ću pohraniti objekte tipa "Cekaonica"
                let cekaonica;
                //Prolazim odgovorom servera (JS objektima)
                for(const cek of odgovor.pacijenti){
                    //Kreiram nove objekte tipa "Cekaonica"
                    cekaonica = new Cekaonica(cek);
                    //Nadodavam ih u polje
                    this.pacijenti.push(cekaonica);
                }
                console.log(this.pacijenti);
                //Kreiram privremenu varijablu u kojoj ću spremiti odgovornu osobu
                let pom: string;
                //Inicijaliziram brojač na 0 na početku
                let brojac = 0;
                //Prolazim kroz sve pacijente
                for(const pacijent of this.pacijenti){
                    //Povećavam brojač za 1
                    brojac++;
                    //Ako je odgovorna osoba u pomoćnoj varijabli različita od odgovorne osobe u polju (tu treba staviti obojani border)
                    if(pom !== pacijent.odgovornaOsoba){
                        this.brojRetka = brojac;
                    }
                    //U pomoćnu varijablu stavljam odgovorne osobe
                    pom = pacijent.odgovornaOsoba;
                }
                //Označavam da čekaonica nije prazna
                this.isPrazna = false;
              }
          }
      );

    }

    //Metoda koja otvara prozor detalja pregleda
    onOtvoriDetalje(idObrada: number,tip: string){
        //U Behaviour Subject ubacivam podatke iz retka čekaonice da ih mogu proslijediti detaljima pregleda
        this.cekaonicaService.podatciPregleda.next({tip,idObrada});
        //Otvori prozor detalja
        this.isDetaljiPregleda = true; 
    }

    //Metoda koja provjerava broj preostalih pacijenata u čekaonici
    checkCountCekaonica(){

        this.cekaonicaService.checkCountCekaonica().pipe(
            //Dohvaćam broj pacijenata u čekaonici
            tap((brojPacijenata) => {
                  //Ako više nema pacijenata u čekaonici
                  if(brojPacijenata == 0){
                      //Označavam da je čekaonica prazna
                      this.isPrazna = true;
                  }
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }

    //Metoda koja briše pacijenta iz čekaonice
    onDeleteCekaonica(tip: string,idCekaonica: number,index:number){
        
        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na brisanje pacijenta iz čekaonice
        this.cekaonicaService.onDeleteCekaonica(tip,idCekaonica).pipe(
            //Dohvaćam odgovor servera
            tap(() => {
                  //Brišem pacijenta na indexu retka na kojem je kliknut button "Izbriši iz čekaonice"
                  this.pacijenti.splice(index,1);
                  //Kreiram privremenu varijablu u kojoj ću spremiti odgovornu osobu
                  let pom: string;
                  //Inicijaliziram brojač na 0 na početku
                  let brojac = 0;
                  //Prolazim kroz sve pacijente
                  for(const pacijent of this.pacijenti){
                    //Povećavam brojač za 1
                    brojac++;
                    //Ako je odgovorna osoba u pomoćnoj varijabli različita od odgovorne osobe u polju (tu treba staviti obojani border)
                    if(pom !== pacijent.odgovornaOsoba){
                        this.brojRetka = brojac;
                    }
                    //U pomoćnu varijablu stavljam odgovorne osobe
                    pom = pacijent.odgovornaOsoba;
                  }
                  //Provjeravam broj pacijenata u čekaonici
                  this.checkCountCekaonica();
                  //Zatvaram prozor za brisanje
                  this.isBrisanje = false;
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }

    //Metoda koja prikuplja sve podatke iz izbrisanog retka čekaonice da bi ih proslijedila uvodnom prozoru brisanja
    onGetTableData(idCekaonica: number,index: number,imePacijent: string, prezPacijent: string,datum: Date,vrijeme: Time,status: string,tip: string){
        this.idCekaonica = idCekaonica;
        this.index = index;
        this.imePacijent = imePacijent;
        this.prezPacijent = prezPacijent;
        this.datumDodavanja = datum;
        this.vrijemeDodavanja = vrijeme;
        this.statusCekaonica = status;
        this.tip = tip;
        //Prvo otvaram prozor za brisanje u kojemu liječnik potvrđuje brisanje ili odustaje
        this.isBrisanje = true;
    }

    //Metoda koja se pokreće kada korisnik klikne "Obriši" u prozoru brisanja
    onBrisanje(){
        //Pokreni postupak brisanja
        this.onDeleteCekaonica(this.tip,this.idCekaonica,this.index);
    }

    //Metoda koja kreira polje koje se sastoji do form controlova statusa čekaonice
    dodajStatusKontrole(){
        //Za svaki element u polju "statusi", kreira se novi FormControl koji nije označen defaultno
        const arr = this.statusi.map(() => {
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
        this.headerService.tipKorisnikaObs.pipe(
            switchMap(tipKorisnik => {
                return this.cekaonicaService.getPatientByStatus(tipKorisnik,this.selectedStatusValues);
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe(
            //Dohvaćam odgovor servera (pacijente)
            (odgovor) => {
              //Praznim polje pacijenata
              this.pacijenti = [];
              //Inicijaliziram praznu varijablu u kojoj ću pohraniti objekte tipa "Cekaonica"
              let cekaonica;
              //Prolazim odgovorom servera (JS objektima)
              for(const cek of odgovor){
                  //Kreiram nove objekte tipa "Cekaonica"
                  cekaonica = new Cekaonica(cek);
                  //Nadodavam ih u polje
                  this.pacijenti.push(cekaonica);
              }
              //Kreiram privremenu varijablu u kojoj ću spremiti odgovornu osobu
              let pom: string;
              //Inicijaliziram brojač na 0 na početku
              let brojac = 0;
              //Prolazim kroz sve pacijente
              for(const pacijent of this.pacijenti){
                  //Povećavam brojač za 1
                  brojac++;
                  //Ako je odgovorna osoba u pomoćnoj varijabli različita od odgovorne osobe u polju (tu treba staviti obojani border)
                  if(pom !== pacijent.odgovornaOsoba){
                      this.brojRetka = brojac;
                  }
                  //U pomoćnu varijablu stavljam odgovorne osobe
                  pom = pacijent.odgovornaOsoba;
              }
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
        //Pretplaćujem se na rezultate da ih dohvatim
        this.obradaService.addPatientToProcessing(tipKorisnik,id).pipe(
            switchMap((response) => {
                //Ako već postoji neki aktivan pacijent u obradi
                if(response.message === 'Već postoji aktivan pacijent!'){
                    //Prikaži poruku
                    this.response = true;
                    this.responsePoruka = response.message;
                    return of(null).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                }
                //Ako ne postoji pacijent u obradi trenutno
                else{
                    //Ako je tip korisnika "Medicinska sestra":
                    if(this.isMedSestra){
                        //Pođi na stranicu općih podataka pregleda
                        this.router.navigate(['../obrada/opciPodatci'], {relativeTo: this.route});
                    }
                    else if(this.isLijecnik){
                        //Pođi na stranicu povijesti bolesti
                        this.router.navigate(['../obrada/povijestBolesti'], {relativeTo: this.route});
                    }
                    return this.cekaonicaService.getPatientsWaitingRoom(tipKorisnik).pipe(
                        tap(odgovor => {
                            //Praznim polje pacijenata
                            this.pacijenti = [];
                            //Inicijaliziram praznu varijablu u kojoj ću pohraniti objekte tipa "Cekaonica"
                            let cekaonica;
                            //Prolazim odgovorom servera (JS objektima)
                            for(const cek of odgovor){
                                //Kreiram nove objekte tipa "Cekaonica"
                                cekaonica = new Cekaonica(cek);
                                //Nadodavam ih u polje
                                this.pacijenti.push(cekaonica);
                            }
                            //Kreiram privremenu varijablu u kojoj ću spremiti odgovornu osobu
                            let pom: string;
                            //Inicijaliziram brojač na 0 na početku
                            let brojac = 0;
                            //Prolazim kroz sve pacijente
                            for(const pacijent of this.pacijenti){
                                //Povećavam brojač za 1
                                brojac++;
                                //Ako je odgovorna osoba u pomoćnoj varijabli različita od odgovorne osobe u polju (tu treba staviti obojani border)
                                if(pom !== pacijent.odgovornaOsoba){
                                    this.brojRetka = brojac;
                                }
                                //U pomoćnu varijablu stavljam odgovorne osobe
                                pom = pacijent.odgovornaOsoba;
                            }
                        }),
                        takeUntil(this.pretplateSubject)
                    );
                }
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
      
    }

    //Metoda se pokreće kada korisnik klikne "Pretraži"
    onSubmit(){
        //Ako forma nije ispravna
        if(!this.forma.valid){
          return;
        }
        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera
        this.obradaService.getPatients(this.ime.value,this.prezime.value,this.stranica).pipe(
            tap((odgovor) => {
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
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe(); 
    }

    //Metoda se pokreće kada korisnik klikne "Dodaj u čekaonicu"
    onAzurirajStanje(){

        //Pretplaćujem se na Observable u kojemu se nalaze novi pacijenti čekaonice
        this.headerService.tipKorisnikaObs.pipe(
            take(1),
            switchMap(tipKorisnik => {
                return this.cekaonicaService.getPatientsWaitingRoom(tipKorisnik).pipe(
                    takeUntil(this.pretplateSubject)
                );
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe(
          //Uzimam pacijente
          (odgovor) => {
              //Označavam da čekaonica više nije prazna
              this.isPrazna = false;
              //Praznim polje pacijenata
              this.pacijenti = [];
              //Inicijaliziram praznu varijablu u kojoj ću pohraniti objekte tipa "Cekaonica"
              let cekaonica;
              //Prolazim odgovorom servera (JS objektima)
              for(const cek of odgovor){
                  //Kreiram nove objekte tipa "Cekaonica"
                  cekaonica = new Cekaonica(cek);
                  //Nadodavam ih u polje
                  this.pacijenti.push(cekaonica);
              }
              //Kreiram privremenu varijablu u kojoj ću spremiti odgovornu osobu
              let pom: string;
              //Inicijaliziram brojač na 0 na početku
              let brojac = 0;
              //Prolazim kroz sve pacijente
              for(const pacijent of this.pacijenti){
                  //Povećavam brojač za 1
                  brojac++;
                  //Ako je odgovorna osoba u pomoćnoj varijabli različita od odgovorne osobe u polju (tu treba staviti obojani border)
                  if(pom !== pacijent.odgovornaOsoba){
                      this.brojRetka = brojac;
                  }
                  //U pomoćnu varijablu stavljam odgovorne osobe
                  pom = pacijent.odgovornaOsoba;
              }
          }
        );
    }

    //Metoda koja se pokreće kada se stisne button "Prikaži 10 zadnjih"
    prikazi10zadnjih(){

      //Pretplaćujem se na Observable u kojemu se nalaze pacijenti
      this.headerService.tipKorisnikaObs.pipe(
          switchMap(tipKorisnik => {
              return this.cekaonicaService.getTenLast(tipKorisnik).pipe(
                  takeUntil(this.pretplateSubject)
              );
          }),
          takeUntil(this.pretplateSubject)
      ).subscribe(
          //Uzimam odgovor
          (odgovor) => {
            //Praznim polje pacijenata
            this.pacijenti = [];
            //Inicijaliziram praznu varijablu u kojoj ću pohraniti objekte tipa "Cekaonica"
            let cekaonica;
            //Prolazim odgovorom servera (JS objektima)
            for(const cek of odgovor){
                //Kreiram nove objekte tipa "Cekaonica"
                cekaonica = new Cekaonica(cek);
                //Nadodavam ih u polje
                this.pacijenti.push(cekaonica);
            }
            //Kreiram privremenu varijablu u kojoj ću spremiti odgovornu osobu
            let pom: string;
            //Inicijaliziram brojač na 0 na početku
            let brojac = 0;
            //Prolazim kroz sve pacijente
            for(const pacijent of this.pacijenti){
                //Povećavam brojač za 1
                brojac++;
                //Ako je odgovorna osoba u pomoćnoj varijabli različita od odgovorne osobe u polju (tu treba staviti obojani border)
                if(pom !== pacijent.odgovornaOsoba){
                    this.brojRetka = brojac;
                }
                //U pomoćnu varijablu stavljam odgovorne osobe
                pom = pacijent.odgovornaOsoba;
            }
            //Označi checkboxove neaktivnima
            this.formaStatus.reset();
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
      //Postavljam Subject na true
      this.pretplateSubject.next(true);
      this.pretplateSubject.complete();
      //Praznim Subject 
      this.obradaService.imePrezimePacijent.next(null);
    }

}
