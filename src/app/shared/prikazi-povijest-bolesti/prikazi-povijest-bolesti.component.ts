import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Dijagnoza } from '../modeli/dijagnoza.model';
import { ActivatedRoute, Router } from '@angular/router';
import { merge, of, Subject } from 'rxjs';
import { tap, takeUntil, switchMap, mergeMap, take } from 'rxjs/operators';
import { HeaderService } from '../header/header.service';
import { PovijestBolestiService } from 'src/app/lijecnik/povijest-bolesti/povijest-bolesti.service';
import { PovezaniPovijestBolestiService } from 'src/app/lijecnik/povezani-povijest-bolesti/povezani-povijest-bolesti.service';
import { ObradaService } from '../obrada/obrada.service';
import { PreglediService } from '../obrada/pregledi/pregledi.service';
import * as SharedHandler from '../shared-handler';
import * as SharedValidations from '../shared-validations';
import { SharedService } from '../shared.service';
import { PrikaziPovijestBolestiService } from './prikazi-povijest-bolesti.service';
import { LoginService } from 'src/app/login/login.service';

@Component({
  selector: 'app-prikazi-povijest-bolesti',
  templateUrl: './prikazi-povijest-bolesti.component.html',
  styleUrls: ['./prikazi-povijest-bolesti.component.css']
})
export class PrikaziPovijestBolestiComponent implements OnInit,OnDestroy {
    //Oznaka je li gumb za poništavanje povezanog slučaja aktivan
    ponistiPovezaniSlucaj: boolean = false;
    //Oznaka je li otvoren prozor povezivanja povijesti bolesti
    otvorenPovijestBolesti: boolean = false;
    //Spremam sve pretplate
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li se prikazuju opcionalna polja
    isBrziUnos: boolean = true;
    //Definiram formu
    forma: FormGroup;
    //Kreiram EventEmitter
    @Output() closeRecept = new EventEmitter<any>();
    //Kreiram EventEmitter koji će uz informaciju da se treba zatvoriti ovaj prozor poslati i ID pacijenta kojemu se upisala povijest bolesti
    @Output() closeUputnica = new EventEmitter<{idPacijent: number, potvrden: boolean}>();
    //Primam sve dijagnoze od roditelja
    @Input() primljeneDijagnoze: Dijagnoza[];
    //Primam ID pacijenta kojemu pišem povijest bolesti
    @Input() idPacijent: number;
    //Spremam sve dijagnoze
    dijagnoze: Dijagnoza[] = [];
    //Spremam sve MKB šifre
    mkbSifre: string[] = [];
    //Spremam trenutno izabranu sekundarnu dijagnozu zbog validacije duplikata
    sekDijagnoza: string;
    //Spremam dijagnozu koja je ista kod primarne i kod sekundarne dijagnoze
    dijagnoza: string;
    //Spremam ID liječnika
    idLijecnik: number;
    //Spremam ID obrade
    idObrada: number;
    //Spremam dijagnoze povezane povijesti bolesti
    primarnaDijagnozaPovijestBolesti: string;
    sekundarnaDijagnozaPovijestBolesti: string[] = [];
    //Spremam ID povijesti bolesti prošlog pregleda
    prosliPregled: string = "";
    //Spremam boju sa prethodnog pregleda
    proslaBoja: string = "";
    //Spremam oznaku jesam li došao ovdje preko recepta ili preko uputnice
    receptIliUputnica: string = null;

    constructor(
        //Dohvaćam router
        private router: Router,
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam header servis
        private headerService: HeaderService,
        //Dohvaćam servis povijesti bolesti
        private povijestBolestiService: PovijestBolestiService,
        //Dohvaćam servis povezanih povijesti bolesti
        private povezaniPovijestBolestiService: PovezaniPovijestBolestiService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis prethodnih pregleda
        private preglediService: PreglediService,
        //Dohvaćam shared servis
        private sharedService: SharedService,
        //Dohvaćam servis prikaza povijesti bolesti
        private prikaziPovijestBolestiService: PrikaziPovijestBolestiService,
        //Dohvaćam login servis
        private loginService: LoginService
    ) { }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit(){
        //Inicijaliziram varijablu u koju spremam objekte tipa "Dijagnoza"
        let objektDijagnoza;
        //Prolazim poljem dijagnoza sa servera
        for(const d of this.primljeneDijagnoze){
            //Kreiram novi objekt tipa "Dijagnoza"
            objektDijagnoza = new Dijagnoza(d);
            //Spremam ga u svoje polje
            this.dijagnoze.push(objektDijagnoza);
            //Spremam jednu po jednu MKB šifru u svoje polje
            this.mkbSifre.push(d.mkbSifra);
        }
        //Kreiram formu
        this.forma = new FormGroup({
          'brziUnos': new FormControl(true),
          'razlogDolaska': new FormControl(null,[Validators.required]),
          'anamneza': new FormControl(null,[Validators.required]),
          'status': new FormControl(null),
          'primarnaDijagnoza': new FormControl(null,[Validators.required]),
          'mkbPrimarnaDijagnoza': new FormControl(null,[Validators.required,SharedValidations.provjeriMKB(this.mkbSifre)]),
          'sekundarnaDijagnoza': new FormArray([
              new FormGroup({
                'nazivSekundarna': new FormControl(null),
                'mkbSifraSekundarna': new FormControl(null)
              },{validators: [SharedValidations.requiredMKBSifraSekundarna(),SharedValidations.provjeriMKBSifraSekundarna(this.mkbSifre)]}) 
          ],{validators: this.isValidSekundarnaDijagnoza.bind(this)}),
          'nalaz': new FormControl(null),
          'terapija': new FormControl(null),
          'preporukaLijecnik': new FormControl(null),
          'napomena': new FormControl(null),
          'tipSlucaj': new FormGroup({
            'noviSlucaj': new FormControl(null),
            'povezanSlucaj': new FormControl(null)
          }, {validators: this.atLeastOneRequiredTipSlucaj})
        }, {validators: this.isValidDijagnoze.bind(this)});
        //Na početku onemogućavam unos sekundarne dijagnoze
        this.forma.get('sekundarnaDijagnoza').disable({emitEvent: false});
        //Pretplaćujem se na promjene u poljima forme
        const promjeneForme = merge(
            //Pretplaćivam se na informaciju odakle je otvoren ovaj prozor (ili iz izdavanja recepta ili iz izdavanja uputnice)
            this.sharedService.receptIliUputnicaObs.pipe(
                tap(receptIliUputnica => {
                    this.receptIliUputnica = receptIliUputnica;
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na Observable u kojemu se nalazi ID obrade trenutno aktivnog pacijenta kojega šalje komponenta "ObradaComponent"
            this.obradaService.podatciObradaObs.pipe(
                tap(idObrada => {
                    //Spremam ID obrade 
                    this.idObrada = idObrada;
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa primarne dijagnoze
            this.primarnaDijagnoza.valueChanges.pipe(
                tap(value => {
                    //Na početku postavljam da nisam pronašao naziv primarne dijagnoze
                    let pronasao = false;
                    //Prolazim kroz sve nazive primarnih dijagnoza
                    for(const dijagnoza of this.dijagnoze){
                        //Ako su jednaki
                        if(value === dijagnoza.imeDijagnoza){
                            //Označavam da se poklapaju nazivi
                            pronasao = true;
                        }
                    }
                    //Ako je unos primarne dijagnoze ispravan
                    if(pronasao){
                        if(this.primarnaDijagnoza.valid){
                            //Pozivam metodu da popuni polje MKB šifre te dijagnoze
                            SharedHandler.nazivToMKB(value,this.dijagnoze,this.forma);
                            //Omogućavam unos sekundarnih dijagnoza
                            this.sekundarnaDijagnoza.enable({emitEvent: false});
                        }
                    }
                    //Ako unos primarne dijagnoze nije ispravan ili je null
                    if(!pronasao || !this.primarnaDijagnoza.value){
                        //Resetiraj polje MKB šifre primarne dijagnoze
                        this.mkbPrimarnaDijagnoza.patchValue(null,{emitEvent: false});
                        //Dok ne ostane jedna sekundarna dijagnoza u arrayu
                        while(this.getControlsSekundarna().length !== 1){
                            //Briši mu prvi element 
                            (<FormArray>this.sekundarnaDijagnoza).removeAt(0);
                        }
                        //Kada je ostala jedna vrijednost sek. dijagnoze, resetiraj joj vrijednost i onemogući unos
                        this.sekundarnaDijagnoza.reset();
                        this.sekundarnaDijagnoza.disable({emitEvent: false});
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Slušam promjene u polju unosa MKB šifre primarne dijagnoze
            this.mkbPrimarnaDijagnoza.valueChanges.pipe(
                tap(value => {
                    //Ako je MKB ispravno unesen (ako je prošao validaciju)
                    if(this.mkbPrimarnaDijagnoza.valid){
                        //Prolazim kroz sve MKB šifre
                        for(const mkb of this.mkbSifre){
                            //Ako se upisana vrijednost nalazi u polju MKB šifri
                            if(mkb.toLowerCase() === value.toLowerCase()){
                                //U polje MKB šifri postavi šifru velikim slovima
                                this.mkbPrimarnaDijagnoza.patchValue(mkb,{emitEvent: false});
                            }
                        }
                        //Pozivam metodu da popuni polje naziva primarne dijagnoze
                        SharedHandler.MKBtoNaziv(this.mkbPrimarnaDijagnoza.value,this.dijagnoze,this.forma);
                        //Omogućavam unos sekundarne dijagnoze
                        this.sekundarnaDijagnoza.enable({emitEvent: false}); 
                    }
                    //Ako je MKB neispravno unesen
                    else{
                        //Postavi naziv primarne dijagnoze na null
                        this.primarnaDijagnoza.patchValue(null,{emitEvent: false});
                        //Dok ne ostane jedna sekundarna dijagnoza u arrayu
                        while(this.getControlsSekundarna().length !== 1){
                            //Briši mu prvi element 
                            (<FormArray>this.sekundarnaDijagnoza).removeAt(0);
                        }
                        //Kada je ostala jedna vrijednost sek. dijagnoze, resetiraj joj vrijednost i onemogući unos
                        this.sekundarnaDijagnoza.reset();
                        this.sekundarnaDijagnoza.disable({emitEvent: false});
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na dohvat ID-a liječnika
            this.headerService.getIDLijecnik().pipe(
                tap(//Dohvaćam ID liječnika
                    (idLijecnik) => {
                        //Spremam ID liječnika
                        this.idLijecnik = idLijecnik[0].idLijecnik;
                    }
                ),
                takeUntil(this.pretplateSubject)
            )
        ).subscribe();
    }

    //Metoda koja se poziva kada liječnik promijeni checkbox "Brzi unos"
    onChangeBrziUnos(event: any){
      //Ako je checkbox "checked":
      if(event.target.checked){
          //Označavam da se prikaže brzi unos
          this.isBrziUnos = true;
      }
      //Ako checkbox nije "checked"
      else{
          //Označavam da se prikaže i opcionalna polja
          this.isBrziUnos = false;
      }
    }

    //Ova metoda se poziva kada se liječnik krene upisivati vrijednosti u polja MKB šifri sek. dijagnoze
    onChangeMKB(mkbSifra: string,index:number){
        //Ako je MKB ispravno unesen (ako je prošao validaciju)
        if(this.sekundarnaDijagnoza.at(index).valid){
            //Prolazim kroz sve MKB šifre
            for(const mkb of this.mkbSifre){
                //Ako se upisana vrijednost nalazi u polju MKB šifri
                if(mkb.toLowerCase() === mkbSifra.toLowerCase()){
                    //U polje MKB šifri postavi šifru velikim slovima
                    (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('mkbSifraSekundarna').patchValue(mkb,{emitEvent: false});
                }
            }
            //Pozivam metodu da popuni polje naziva primarne dijagnoze
            SharedHandler.MKBtoNazivSekundarna(mkbSifra,this.dijagnoze,this.forma,index);
        }
        //Ako je MKB neispravno unesen
        else{
            (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('nazivSekundarna').patchValue(null,{emitEvent: false});
        }
    }

    //Ova metoda se poziva kada se promijeni naziv sekundarne dijagnoze
    onChangeNazivSekundarna(nazivSekundarna: string, index: number){
        //Pozivam metodu koja će automatski unijeti MKB šifru sekundarne dijagnoze
        SharedHandler.nazivToMKBSekundarna(nazivSekundarna,this.dijagnoze,this.forma,index);
    }

    //Metoda koja provjerava je li uneseno više istih sekundarnih dijagnoza
    isValidSekundarnaDijagnoza(array: FormArray): {[key: string]: boolean}{
      //Kreiram pomoćno polje
      let pom = [];
      //Prolazim kroz array 
      for(let control of array.controls){
          //Ako se vrijednost sekundarne dijagnoze VEĆ NALAZI u pom polju, ali da nije "Odaberite sekundarnu dijagnozu"
          if(pom.indexOf(control.value.nazivSekundarna) !== -1 && control.value.nazivSekundarna !== null){
              //U svoju varijablu spremam sekundarnu dijagnozu koja je duplikat
              this.sekDijagnoza = control.value.nazivSekundarna;
              return {'duplikat': true};
          }
          //Ako se vrijednost sekundarne dijagnoze NE NALAZI u pom polju
          else{
              //Dodaj ga u pom polje
              pom.push(control.value.nazivSekundarna);
          }
      }
      return null;
    } 
  
    //Metoda koja provjerava je li primarna dijagnoza ista kao i neka od sekundarnih dijagnoza
    isValidDijagnoze(group: FormGroup): {[key: string]: boolean} {
      //Prolazim kroz polje sekundarnih dijagnoza
      for(let control of (group.get('sekundarnaDijagnoza') as FormArray).controls){
          //Ako je vrijednost primarne dijagnoze jednaka vrijednosti sekundarne dijagnoze, ali da oba dvije nisu null, jer bih bilo (Odaberite dijagnozu === Odaberite dijagnozu)
          if(group.get('primarnaDijagnoza').value === control.value.nazivSekundarna && (group.get('primarnaDijagnoza') !== null && control.value.nazivSekundarna !== null)){
              //Spremam vrijednost sekundarne dijagnoze koja je jednaka primarnoj dijagnozi
              this.dijagnoza = control.value.nazivSekundarna;
              return {'primarnaJeIstaKaoSekundarna': true};
          }
      }
      return null;
    }

    //Metoda koja INICIJALNO postavlja da bude required jedan od tipova slučaja
    atLeastOneRequiredTipSlucaj(group : FormGroup) : {[s:string ]: boolean} {
      if (group) {
          if(group.controls['noviSlucaj'].value || group.controls['povezanSlucaj'].value) {
              return null;
          }
      }
      return {'baremJedanTipSlucaj': true};
    }

    //Dohvaća pojedine form controlove unutar polja 
    getControlsSekundarna(){
      return (this.forma.get('sekundarnaDijagnoza') as FormArray).controls;
    }

    //Kada se klikne button "Dodaj dijagnozu"
    onAddDiagnosis(){
        //Kreiram novi form group
        const formGroup = new FormGroup({
            'nazivSekundarna': new FormControl(null),
            'mkbSifraSekundarna': new FormControl(null)
        },{validators: [SharedValidations.requiredMKBSifraSekundarna(),SharedValidations.provjeriMKBSifraSekundarna(this.mkbSifre)]});
        //Nadodavam novi form group u form array
        (<FormArray>this.forma.get('sekundarnaDijagnoza')).push(formGroup);
    }

    //Kada se klikne button "X"
    onDeleteDiagnosis(index: number){
      (<FormArray>this.forma.get('sekundarnaDijagnoza')).removeAt(index);
    }

    //Metoda koja se poziva kada se klikne izvan prozora ili "Izađi"
    onClose(){
        //Ako sam došao ovdje iz izdavanja recepta
        if(this.receptIliUputnica === 'recept'){
            //Emitiraj prema komponenti recepta (PacijentiComponent) da se izgasi ovaj prozor
            this.closeRecept.emit();
        }
        else{
            //Emitiraj prema komponenti uputnice (IzdajUputnicaComponent) da se izgasi ovaj prozor
            this.closeUputnica.emit({idPacijent: this.idPacijent, potvrden: false});
        }
    }

    //Metoda koja se poziva kada se klikne "Potvrdi"
    onSubmit(){
        //Ako forma nije validna
        if(!this.forma.valid){
          return;
        }
        //Pomoćno polje u koje spremam samo MKB šifre sek. dijagnoza
        let mkbPolje: string[] = [];
        //Prolazim kroz polje sekundarnih dijagnoza i uzimam samo MKB šifre
        for(const el of this.getControlsSekundarna()){
            if(el.value.mkbSifraSekundarna !== null){
                mkbPolje.push(el.value.mkbSifraSekundarna);
            }
        }
        //Ako je brojač klikova < 2
        if(this.noviSlucaj.value === true){
            //Postavljam ID povijesti bolesti pregleda kojega povezujem na null
            this.prosliPregled = "";
            //Uvijek unosim empty prošlu boju kada je novi slučaj da se generira nova u backendu
            this.proslaBoja = "";
            //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na potvrdu povijesti bolesti
            this.povijestBolestiService.potvrdiPovijestBolesti(this.idLijecnik,this.idPacijent,this.razlogDolaska.value,
                this.anamneza.value,this.status.value,this.nalaz.value,
                this.mkbPrimarnaDijagnoza.value,mkbPolje,
                this.noviSlucaj.value === true ? 'noviSlucaj' : 'povezanSlucaj',
                this.terapija.value,this.preporukaLijecnik.value,
                this.napomena.value,this.idObrada,this.prosliPregled, this.proslaBoja).pipe(
                //Dohvaćam odgovor servera
                tap(() => {
                    //Kreiram objekt u kojemu će se nalaziti podatci prošlog pregleda koje stavljam u LocalStorage
                    const podatciProslogPregleda = {
                        idObrada: this.idObrada,
                        mkbPrimarnaDijagnoza: this.mkbPrimarnaDijagnoza.value
                    };
                    //U Local Storage postavljam trenutno unesenu podatke da je kasnije mogu dohvatiti kada povežem više puta zaredom
                    localStorage.setItem("podatciProslogPregleda",JSON.stringify(podatciProslogPregleda));
                    //Emitiram vrijednost Subjectom da je dodan pregled prema "SekundarniHeaderComponent"
                    this.preglediService.pregledDodan.next({isDodan: true, tipKorisnik: "lijecnik"});
                    //Kreiram objekt u kojemu će se nalaziti informacija je li dodan novi pregled (tu informaciju treba "SekundarniHeaderComponent")
                    const isDodanPregled = {
                        isDodan: true,
                        tipKorisnik: "lijecnik"
                    };
                    //U Local Storage postavljam tu informaciju
                    localStorage.setItem("isDodanPregled",JSON.stringify(isDodanPregled));
                }),
                mergeMap(() => {
                    return this.prikaziPovijestBolestiHandler();
                }),
                takeUntil(this.pretplateSubject)
            ).subscribe();  
        }
        //Ako je slučaj povezan
        else if(this.povezanSlucaj.value === true){
            //Dohvaćam podatke prošlog pregleda
            const podatci: {
                idObrada: number,
                mkbPrimarnaDijagnoza: string
            } = JSON.parse(localStorage.getItem("podatciProslogPregleda"));
            let proslaMKBSifra = podatci.mkbPrimarnaDijagnoza;
            let proslaIDObrada = +podatci.idObrada;
            this.povijestBolestiService.getIDPovijestBolesti(this.idPacijent,proslaIDObrada,proslaMKBSifra).pipe(
                tap(podatci => {
                    //Spremam podatke prošlog pregleda u svoje varijable
                    this.proslaBoja = podatci[0].bojaPregled;
                    this.prosliPregled = podatci[0].idPovijestBolesti;
                }),
                switchMap(() => {
                    //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na potvrdu povijesti bolesti
                    return this.povijestBolestiService.potvrdiPovijestBolesti(this.idLijecnik,this.idPacijent,this.razlogDolaska.value,
                        this.anamneza.value,this.status.value,this.nalaz.value,
                        this.mkbPrimarnaDijagnoza.value,mkbPolje,
                        this.noviSlucaj.value === true ? 'noviSlucaj' : 'povezanSlucaj',
                        this.terapija.value,this.preporukaLijecnik.value,
                        this.napomena.value,this.idObrada,this.prosliPregled,this.proslaBoja).pipe(
                        //Dohvaćam odgovor servera
                        tap(() => {
                            //Kreiram objekt u kojemu će se nalaziti podatci prošlog pregleda koje stavljam u LocalStorage
                            const podatciProslogPregleda = {
                                idObrada: this.idObrada,
                                mkbPrimarnaDijagnoza: this.mkbPrimarnaDijagnoza.value
                            };
                            //U Local Storage postavljam trenutno unesenu podatke da je kasnije mogu dohvatiti kada povežem više puta zaredom
                            localStorage.setItem("podatciProslogPregleda",JSON.stringify(podatciProslogPregleda));
                            //Emitiram vrijednost Subjectom da je dodan pregled prema "SekundarniHeaderComponent"
                            this.preglediService.pregledDodan.next({isDodan: true, tipKorisnik: "lijecnik"});
                            //Kreiram objekt u kojemu će se nalaziti informacija je li dodan novi pregled (tu informaciju treba "SekundarniHeaderComponent")
                            const isDodanPregled = {
                                isDodan: true,
                                tipKorisnik: "lijecnik"
                            };
                            //U Local Storage postavljam tu informaciju
                            localStorage.setItem("isDodanPregled",JSON.stringify(isDodanPregled));
                        }),
                        mergeMap(() => {
                            return this.prikaziPovijestBolestiHandler();
                        }),
                        takeUntil(this.pretplateSubject)
                    ); 
                }),
                takeUntil(this.pretplateSubject)
            ).subscribe();
        }
    }
    //Metoda koja se poziva kada liječnik klikne "Potvrdi povijest bolesti"
    prikaziPovijestBolestiHandler(){
        //Pretplaćivam se na tip prijavljenog korisnika
        return this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                //Pretplaćivam se na podatke aktivnog korisnika 
                return this.obradaService.getPatientProcessing(user.tip).pipe(
                    switchMap(podatci => {  
                        //Ako pacijent NIJE AKTIVAN
                        if(podatci.success === "false"){
                            return this.prikaziPovijestBolestiService.getRandomIDObrada().pipe(
                                tap(idObrada => {
                                    //Postavljam zadnje generirani slučajni ID obrade u LocalStorage
                                    localStorage.setItem("idObrada",JSON.stringify(+idObrada));
                                    //Ako sam došao ovdje iz izdavanja recepta
                                    if(this.receptIliUputnica === 'recept'){
                                        //Aktiviraj event prema roditeljskoj komponenti recepta da se izgasi ovaj prozor
                                        this.closeRecept.emit();
                                        //Preusmjeri liječnika na prozor izdavanja recepta
                                        this.router.navigate(['./',this.idPacijent],{relativeTo: this.route});
                                    }
                                    //Ako sam došao ovdje iz izdavanja uputnice 
                                    else if(this.receptIliUputnica === 'uputnica'){
                                        //Emitiraj prema komponenti uputnice (IzdajUputnicaComponent) da se izgasi ovaj prozor
                                        this.closeUputnica.emit({idPacijent: this.idPacijent, potvrden: true});
                                    }
                                }),
                                takeUntil(this.pretplateSubject)
                            );
                        }
                        //Ako je pacijent aktivan
                        else{
                            return of(null).pipe(
                                tap(() => {
                                    //Ako sam došao ovdje iz izdavanja recepta
                                    if(this.receptIliUputnica === 'recept'){
                                        //Aktiviraj event prema roditeljskoj komponenti recepta da se izgasi ovaj prozor
                                        this.closeRecept.emit();
                                        //Preusmjeri liječnika na prozor izdavanja recepta
                                        this.router.navigate(['./',this.idPacijent],{relativeTo: this.route});
                                    }
                                    //Ako sam došao ovdje iz izdavanja uputnice 
                                    else if(this.receptIliUputnica === 'uputnica'){
                                        //Emitiraj prema komponenti uputnice (IzdajUputnicaComponent) da se izgasi ovaj prozor
                                        this.closeUputnica.emit({idPacijent: this.idPacijent, potvrden: true});
                                    }
                                }),
                                takeUntil(this.pretplateSubject)
                            );
                        }
                    }),
                    takeUntil(this.pretplateSubject)
                );
            })
        );
    }

    //Metoda koja se aktivira kada korisnik klikne "Poništi povezani slučaj"
    onPonistiPovezaniSlucaj(){
        //Resetiram i čistim polja dijagnoza
        //Dok ne ostane jedna sekundarna dijagnoza u arrayu
        while(this.getControlsSekundarna().length !== 1){
          //Briši mu prvi element 
          (<FormArray>this.sekundarnaDijagnoza).removeAt(0);
        }
        //Kada je ostala jedna vrijednost sek. dijagnoze, resetiraj joj vrijednost i onemogući unos
        this.sekundarnaDijagnoza.reset();
        this.sekundarnaDijagnoza.disable({emitEvent: false});
        this.primarnaDijagnoza.patchValue(null,{emitEvent: false});
        this.mkbPrimarnaDijagnoza.patchValue(null,{emitEvent: false});
        //Skrivam button "Poništi povezani slučaj"
        this.ponistiPovezaniSlucaj = false;
        //Resetiram checkbox povezanog slučaja
        this.povezanSlucaj.reset();
    }

      //Metoda koja se izvodi kada se event aktivirao (Kada je komponenta "PovezaniPovijestBolesti" poslala podatke retka)
      onPoveziPodatciRetka($event){
          this.povezaniPovijestBolestiService.getPovijestBolestiPovezanSlucaj($event,this.idPacijent).pipe(
            tap(
              //Dohvaćam odgovor
              (odgovor) => {
                  //Spremam ID povijesti bolesti prošlog pregleda
                  this.prosliPregled = odgovor[0].idPovijestBolesti;
                  this.proslaBoja = odgovor[0].bojaPregled;
                  //Kreiram objekt u kojemu će se nalaziti podatci prošlog pregleda koje stavljam u LocalStorage
                  const podatciProslogPregleda = {
                    idObrada: odgovor[0].idObradaLijecnik,
                    mkbPrimarnaDijagnoza: odgovor[0].mkbSifraPrimarna
                  };
                  //U Local Storage postavljam trenutno unesenu podatke da je kasnije mogu dohvatiti kada povežem više puta zaredom
                  localStorage.setItem("podatciProslogPregleda",JSON.stringify(podatciProslogPregleda));
                  //Popuni polja povijesti bolesti sa rezultatima sa servera
                  this.razlogDolaska.patchValue(odgovor[0].razlogDolaska,{emitEvent: false});
                  this.anamneza.patchValue(odgovor[0].anamneza,{emitEvent: false});
                  this.status.patchValue(odgovor[0].statusPacijent,{emitEvent: false});
                  this.nalaz.patchValue(odgovor[0].nalaz,{emitEvent: false});
                  this.terapija.patchValue(odgovor[0].terapija,{emitEvent: false});
                  this.preporukaLijecnik.patchValue(odgovor[0].preporukaLijecnik,{emitEvent: false});
                  this.napomena.patchValue(odgovor[0].napomena,{emitEvent: false});
                  //Resetiram formu sekundarnih dijagnoza
                  this.sekundarnaDijagnoza.clear();
                  //Resetiram svoje polje sekundarnih dijagnoza
                  this.sekundarnaDijagnozaPovijestBolesti = [];
                  //Dodaj jedan form control da inicijalno bude 1
                  this.onAddDiagnosis();
                  //Prolazim poljem odgovora servera
                  for(let dijagnoza of odgovor){
                      //Spremam naziv primarne dijagnoze povezane povijesti bolesti
                      this.primarnaDijagnozaPovijestBolesti = dijagnoza.NazivPrimarna;
                      //U polje sekundarnih dijagnoza spremam sve sekundarne dijagnoze povezane povijesti bolesti
                      this.sekundarnaDijagnozaPovijestBolesti.push(dijagnoza.NazivSekundarna);
                      //Za svaku sekundarnu dijagnozu sa servera NADODAVAM JEDAN FORM CONTROL 
                      this.onAddDiagnosis();
                  }
                  //BRIŠEM ZADNJI FORM CONTROL da ne bude jedan viška
                  this.onDeleteDiagnosis(-1); 
                  //Postavljam vrijednost naziva primarne dijagnoze na vrijednost koju sam dobio sa servera
                  this.primarnaDijagnoza.patchValue(this.primarnaDijagnozaPovijestBolesti,{emitEvent: false});
                  //Popunjavam polje MKB šifre primarne dijagnoze
                  SharedHandler.nazivToMKB(this.primarnaDijagnozaPovijestBolesti,this.dijagnoze,this.forma);
                  //Prolazim kroz sve prikupljene nazive sekundarnih dijagnoza sa servera
                  this.sekundarnaDijagnozaPovijestBolesti.forEach((element,index) => {
                      //U polju naziva sekundarnih dijagnoza postavljam prikupljena imena sek. dijagnoza na određenom indexu 
                      (<FormGroup>(<FormArray>this.forma.get('sekundarnaDijagnoza')).at(index)).get('nazivSekundarna').patchValue(element,{emitEvent: false});
                      //Postavljam MKB šifre sek.dijagnoza
                      SharedHandler.nazivToMKBSekundarna(element,this.dijagnoze,this.forma,index);
                  });
                  //Zatvaram prozor povijesti bolesti
                  this.otvorenPovijestBolesti = false;
                  //Omogućavam vidljivost gumba za poništavanje povezanog slučaja
                  this.ponistiPovezaniSlucaj = true;
                  //Postavljam vrijednost checkboxa "PovezanSlucaj" na true
                  this.povezanSlucaj.patchValue(true,{emitEvent: false});
                  //Onemogućavam mijenjanje stanja checkboxa "Povezan slučaj"
                  this.povezanSlucaj.disable({emitEvent: false});
                  //Resetiram checkbox novog slučaja da ne ostane da su oba true
                  this.noviSlucaj.reset();
              }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe();
      }

    //Metoda koja se poziva kada korisnik klikne button "Poveži povijest bolesti"
    onPoveziPovijestBolesti(){
        //Označavam da ulazim u ovu komponentu preko recepta
        this.povezaniPovijestBolestiService.isObrada.next(false);
        //Otvori prozor sa povijestima bolesti ovog pacijenta
        this.otvorenPovijestBolesti = true;
    }
    //Metoda koja se poziva kada korisnik klikne "Izađi" u prozoru povezanog povijesti bolesti
    onClosePovezanPovijestBolesti(){
        //Izađi iz prozora
        this.otvorenPovijestBolesti = false;
    }

    //Metoda koja se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

    //Kreiram gettere
    get brziUnos(): FormControl{
      return this.forma.get('brziUnos') as FormControl;
    }
    get razlogDolaska(): FormControl{
        return this.forma.get('razlogDolaska') as FormControl;
    }
    get anamneza(): FormControl{
        return this.forma.get('anamneza') as FormControl;
    }
    get status(): FormControl{
        return this.forma.get('status') as FormControl;
    }
    get primarnaDijagnoza(): FormControl{
        return this.forma.get('primarnaDijagnoza') as FormControl;
    }
    get sekundarnaDijagnoza(): FormArray{
        return this.forma.get('sekundarnaDijagnoza') as FormArray;
    }
    get mkbPrimarnaDijagnoza(): FormControl{
        return this.forma.get('mkbPrimarnaDijagnoza') as FormControl;
    }
    get nalaz(): FormControl{
        return this.forma.get('nalaz') as FormControl;
    }
    get terapija(): FormControl{
        return this.forma.get('terapija') as FormControl;
    }
    get preporukaLijecnik(): FormControl{
        return this.forma.get('preporukaLijecnik') as FormControl;
    }
    get napomena(): FormControl{
        return this.forma.get('napomena') as FormControl;
    }
    get tipSlucaj(): FormGroup{
      return this.forma.get('tipSlucaj') as FormGroup;
    }
    get noviSlucaj(): FormControl{
      return this.forma.get('tipSlucaj.noviSlucaj') as FormControl;
    }
    get povezanSlucaj(): FormControl{
      return this.forma.get('tipSlucaj.povezanSlucaj') as FormControl;
    }

}
