import { Time } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import {switchMap, take,takeUntil,tap} from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { Cekaonica } from './cekaonica.model';
import { ObradaService } from '../obrada/obrada.service';
import { CekaonicaService } from './cekaonica.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import {DetaljiPregleda} from './detalji-pregleda/detaljiPregleda.model';

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
    //Spremam broj retka
    brojRetka: number;
    //Šaljem detaljima završenog pregleda ID obrade i tip korisnika stisnutog retka
    poslaniIDObrada: number;
    poslaniTipKorisnik: string;
    //Spremam detalje pregleda koje ću prikazati u dialogu
    detaljiPregleda: DetaljiPregleda;

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
        private loginService: LoginService,
        //Dohvaćam servis dialoga
        private dialog: MatDialog
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
      this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                //Ako je tip prijavljenog korisnika "lijecnik":
                if(user.tip == "lijecnik"){
                    //Označavam da se liječnik prijavio
                    this.isLijecnik = true;
                } else if(user.tip== "sestra"){
                    //Označavam da se medicinska sestra prijavila
                    this.isMedSestra = true;
                }
                //Spremam tip prijavljenog korisnika
                this.tipKorisnik = user.tip;
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
    onOtvoriDetalje(idObrada: number, tip: string){
        //Šaljem "DetaljiPregledaComponent" ID obrade i tip korisnika koji je obradio taj redak
        this.poslaniIDObrada = idObrada;
        this.poslaniTipKorisnik = tip;

        const combined = forkJoin([
            this.cekaonicaService.getImePrezimeDatum(tip, idObrada),
            this.cekaonicaService.getPodatciPregleda(tip, idObrada)
        ]).pipe(
            tap(podatci => {
                //Spremam osobne podatke pacijenta detalja pregleda
                this.detaljiPregleda = new DetaljiPregleda(podatci[0][0]);
                //Ako NEMA evidentiranih općih podataka ili povijesti bolesti za određeni pregled
                if(podatci[1].length === 0){
                    //Otvori dialog
                    this.dialog.open(DialogComponent,
                        {data: {
                            detaljiPregleda: {
                                ime: this.detaljiPregleda.imePacijent,
                                prezime: this.detaljiPregleda.prezimePacijent,
                                datum: this.detaljiPregleda.datumPregled,
                                ukupnaCijenaPregled: this.detaljiPregleda.ukupnaCijenaPregled,
                                bmi: this.detaljiPregleda.bmi ? this.detaljiPregleda.bmi : null,
                                tipKorisnik: tip
                            }
                        }});
                }
                //Ako IMA evidentiranih podataka na pregledu
                else{
                    //Otvori prozor detalja
                    this.isDetaljiPregleda = true;
                }
            })
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
            }),
            switchMap(() => {
                return this.cekaonicaService.checkCountCekaonica().pipe(
                    //Dohvaćam broj pacijenata u čekaonici
                    switchMap((brojPacijenata) => {
                        //Ako više nema pacijenata u čekaonici
                        if(brojPacijenata == 0){
                            //Označavam da je čekaonica prazna
                            this.isPrazna = true;
                            return of(null);
                        }
                        //Ako ima pacijenata u čekaonici, dohvaćam ih ponovno da ažuriram tablicu
                        else{
                            return this.cekaonicaService.getPatientsWaitingRoom(this.tipKorisnik).pipe(
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
                                })
                            );
                        }
                    })
                );
            })
        ).subscribe();
    }

    //Metoda koja prikuplja sve podatke iz izbrisanog retka čekaonice da bi ih proslijedila uvodnom prozoru brisanja
    onGetTableData(
        idCekaonica: number,
        index: number,
        imePacijent: string,
        prezPacijent: string,
        datum: Date,
        vrijeme: Time,
        status: string,
        tip: string){
        //Otvaram dialog
        let dialogRef = this.dialog.open(DialogComponent,
            {data: {
                brisanje: {
                    title: 'Jeste li sigurni da želite izbrisati pacijenta?',
                    ime: imePacijent,
                    prezime: prezPacijent,
                    datumDodavanja: datum,
                    vrijemeDodavanja: vrijeme,
                    statusCekaonica: status
                }
            }}
        );
        //Pretplaćujem se na korisničku akciju u dialogu
        dialogRef.afterClosed().pipe(
            tap(result => {
                //Ako je korisnik odabrao "Obriši"
                if(result){
                    this.onDeleteCekaonica(tip, idCekaonica, index);
                }
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
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
        this.cekaonicaService.getPatientByStatus(this.isLijecnik ? 'lijecnik' : 'sestra',this.selectedStatusValues).subscribe(
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
        //Pretplaćujem se na rezultate da ih dohvatim
        this.obradaService.addPatientToProcessing(
            this.isLijecnik ? 'lijecnik' : 'sestra',
            id)
            .pipe(
            switchMap((response) => {
                //Ako već postoji neki aktivan pacijent u obradi
                if(response.message === 'Već postoji aktivan pacijent!'){
                    //Otvori dialog
                    this.dialog.open(DialogComponent, {data: {message: response.message}});
                    return of(null);
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
                    return this.cekaonicaService.getPatientsWaitingRoom(this.isLijecnik ? 'lijecnik' : 'sestra').pipe(
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
                        })
                    );
                }
            })
        ).subscribe();

    }

    //Metoda se pokreće kada korisnik klikne "Pretraži"
    onPretragaPacijenti(){
        //Ako forma nije ispravna
        if(!this.forma.valid){
          return;
        }
        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera
        this.obradaService.getPatients(this.ime.value,this.prezime.value,this.stranica).pipe(
            tap((odgovor) => {
                //Ako je odgovor negativan, tj. nema pacijenata
                if(odgovor["success"] == "false"){
                    //Otvaram dialog
                    this.dialog.open(DialogComponent, {data: {message: odgovor.message}});
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
            })
        ).subscribe();
    }

    //Metoda se pokreće kada korisnik klikne "Dodaj u čekaonicu"
    onAzurirajStanje(){

        //Pretplaćujem se na Observable u kojemu se nalaze novi pacijenti čekaonice
        this.cekaonicaService.getPatientsWaitingRoom(this.isLijecnik ? 'lijecnik' : 'sestra').subscribe(
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
        this.cekaonicaService.getTenLast(this.isLijecnik ? 'lijecnik' : 'sestra').subscribe(
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

    //Metoda se pokreće kada se zatvori prozor pretrage
    onCloseTablica(){
      //Zatvori prozor
      this.isPretraga = false;
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
