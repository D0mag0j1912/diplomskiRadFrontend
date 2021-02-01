import { Time } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { NarucivanjeService } from 'src/app/med-sestra/narucivanje/narucivanje.service';
@Component({
  selector: 'app-narudzba',
  templateUrl: './narudzba.component.html',
  styleUrls: ['./narudzba.component.css']
})
export class NarudzbaComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Označavam da ima odgovora servera
    response: boolean = false;
    //Spremam poruku servera
    responsePoruka: string = null;
    //Oznaka je li korisnik kliknuo na praznu ćeliju ili na ćeliju s podatcima pacijenta
    isPacijent: boolean = false;
    //Kreiram event emitter za izlaz 
    @Output() close = new EventEmitter<any>();
    //Kreiram event emitter da mogu obavijestiti roditeljsku komponentu o promjeni narudžbe
    @Output() azuriranje = new EventEmitter<any>();
    //Kreiram event emitter da mogu obavijestiti roditeljsku komponentu o novoj narudžbi
    @Output() narucivanje = new EventEmitter<any>();
    //Kreiram event emitter da mogu obavijestiti roditeljsku komponentu o brisanju narudžbe
    @Output() otkazivanje = new EventEmitter<any>();
    //Kreiram event emitter da mogu obavijestiti roditeljsku komponentu da zatvori ovaj prozor
    @Output() zatvaranje = new EventEmitter<any>();
    //Kreiram formu
    forma: FormGroup;
    //Spremam detalje narudžbe koje sam dobio iz tablice
    narudzba: any;
    //Spremam ID narudžbe
    idNarudzba: string;
    //Spremam vrijeme narudžbe da ga prikažem na praznoj ćeliji
    vrijemeNarudzba: Time;
    //Spremam dan u tjednu narudžbe da dohvatim datum pomoću njega
    danUTjednuNarudzba: string;
    //Spremam datum narudžbe da ga prikažem na praznoj ćeliji
    datumNarudzba: Date;
    //Spremam pacijente
    pacijenti: any[];
    //Spremam nazive pacijenata ZBOG VALIDACIJE
    naziviPacijenata: string[] = [];
    //Deklariram inicijalnu vrijednost dropdowna na null isprva
    selectedPacijent: string = null;
    //Deklariram inicijalnu vrijednost dropdowna vrsta pregleda
    selectedVrstaPregled: string = null;
    //Spremam vrste pregleda
    vrstePregleda: any;
    //Spremam različite vrste pregleda za dropdown
    razliciteVrstePregleda: any[];
    //Spremam NAZIVE različitih vrsta pregleda ZBOG VALIDACIJE
    naziviRazlicitihVrstaPregleda: string[] = [];
    constructor(
        //Dohvaćam servis naručivanja
        private narucivanjeService: NarucivanjeService,
        //Dohvaćam trenutni route
        private route: ActivatedRoute
    ) { }

    //Metoda koja se pokreće inicijalizicijom komponente
    ngOnInit() {

        //Pretplaćujem se na Resolver da mogu dohvatiti pacijente
        this.route.data.pipe(
            tap(
                //Dohvaćam pacijente
                (podatci : {podatci:any[]}) => {
                    //Spremam podatke pacijenta iz Resolvera u svoje polje pacijenata
                    this.pacijenti = podatci.podatci["pacijenti"];
                    //Spremam sve RAZLIČITE vrste pregleda za DROPDOWN
                    this.razliciteVrstePregleda = podatci.podatci["razliciteVrstePregleda"];
                }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe();

        //Punim polje NAZIVA različitih vrsta pregleda
        for(let naziv of this.razliciteVrstePregleda){
            this.naziviRazlicitihVrstaPregleda.push(naziv["nazivVrstaPregled"]);
        }

        //Punim polje NAZIVA PACIJENATA
        for(let naziv of this.pacijenti){
            this.naziviPacijenata.push(naziv["Pacijent"]);
        }

        //Pretplaćujem se na Observable u kojemu se nalaze SVI PODATCI VEZANI ZA POJEDINU NARUDŽBU
        this.narucivanjeService.prikaziDetaljeNarudzbe().pipe(
            tap(
                (podatci) => {
                    //Spremam sve podatke vrste pregleda u svoje polje
                    this.vrstePregleda = podatci[3];
                    //Spremam vrijeme narudžbe u svoju varijablu
                    this.vrijemeNarudzba = podatci[2][0].vrijeme;
                    //Spremam datum narudžbe u svoju varijablu
                    this.datumNarudzba = podatci[0][0].datum;
                    console.log(this.datumNarudzba);
                    //Spremam detalje naružbe u svoje polje
                    this.narudzba = podatci[1];
                    //Ako je Objekt prazan (ako nema ključeva) tj. ako je korisnik kliknuo na praznu ćeliju
                    if(Object.keys(this.narudzba).length === 0){
                        //Označavam da nema pacijenta 
                        this.isPacijent = false;
                    }
                    //Ako je korisnik kliknuo na punu ćeliju (s imenom, prezimenom i MBO pacijenta)
                    else{
                        //Označavam da ima pacijenta
                        this.isPacijent = true;
                        //Prolazim kroz svaki element polja SVIH PACIJENATA 
                        this.pacijenti.forEach((element) => {
                            //Pitam ima li neki pacijent u tom polju koji ima ISTO ime i prezime i MBO kao i pacijent stisnute ćelije
                            if((this.narudzba[0].imePacijent + ' ' + this.narudzba[0].prezPacijent + ' ' + this.narudzba[0].mboPacijent) === element.Pacijent){
                                //Postavljam inicijalnu vrijednost dropdowna na vrijednost pacijenta koji je kliknut u ćeliji tablice
                                this.selectedPacijent = element.Pacijent;
                            }
                        });

                        //Prolazim kroz svaki element polja SVIH VRSTA PREGLEDA
                        this.vrstePregleda.forEach(element => {
                            //Pitam ima li neki pacijent u tom polju koji ima ISTO ime i prezime i MBO kao pacijent stisnute ćelije
                            if((this.narudzba[0].imePacijent + ' ' + this.narudzba[0].prezPacijent + ' ' + this.narudzba[0].mboPacijent) === element.Pacijent 
                                && this.narudzba[0].datumNarucivanje === element.datumNarucivanje && this.narudzba[0].vrijemeNarucivanje === element.vrijemeNarucivanje){
                                //Postavljam inicijalnu vrijednost dropdowna VRSTA PREGLEDA na vrstu pregleda koju taj pacijent ima
                                this.selectedVrstaPregled = element.nazivVrstaPregled;
                            }
                        });
                    }

                    //Kreiram formu
                    this.forma = new FormGroup({
                        //Ako već postoji narudžba pacijenta, popuni podatke forme s podatcima narudžbe, a ako ne postoji, stavi null ili stavi VRIJEME I DATUM
                        'vrijeme': new FormControl(this.isPacijent ? this.narudzba[0].vrijemeNarucivanje : this.vrijemeNarudzba, [Validators.required]),
                        'vrstaPregleda': new FormControl(null,[Validators.required, this.isValidVrstaPregleda.bind(this)]),
                        'datum': new FormControl(this.isPacijent ? this.narudzba[0].datumNarucivanje : this.datumNarudzba,[Validators.required,Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]),
                        'pacijenti': new FormControl(null,[Validators.required, this.isValidPacijent.bind(this)]),
                        'napomena': new FormControl(this.isPacijent ? this.narudzba[0].napomenaNarucivanje : null)
                    });
                    //Postavljam inicijalnu vrijednost dropdowna na vrijednost PACIJENTA koji je kliknut u ćeliji tablice
                    this.forma.get('pacijenti').patchValue(this.selectedPacijent,{onlySelf: true, emitEvent: false});
                    //Postavljam inicijalnu vrijednost dropdowna na vrijednost VRSTU PREGLEDA koju kliknuti pacijent ima
                    this.forma.get('vrstaPregleda').patchValue(this.selectedVrstaPregled,{onlySelf: true, emitEvent: false}); 
                }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe();

    }

    //Metoda koja provjerava je li vrsta pregleda ispravno unesena tj. je li unesena vrijednost koja nije dio polja vrsta pregleda
    isValidVrstaPregleda(control: FormControl): {[key: string]: boolean}{
        //Ako vrijednost vrsta pregleda koje je korisnik unio nije dio polja vrsta pregleda (znači vraća -1 ako nije dio polja)
        if(this.naziviRazlicitihVrstaPregleda.indexOf(control.value) === -1){
          return {'vrstaIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
    }
    //Metoda koja provjerava je li pacijent ispravno unesen tj. je li unesena vrijednost koja nije dio polja pacijenata
    isValidPacijent(control: FormControl): {[key: string]: boolean}{
        //Ako vrijednost pacijenta koje je korisnik unio nije dio polja pacijenata (znači vraća -1 ako nije dio polja)
        if(this.naziviPacijenata.indexOf(control.value) === -1){
          return {'pacijentIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
    }

    //Metoda koja ažurira narudžbu
    onAzurirajNarudzbu(){

        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na ažuriranje narudžbe
        this.narucivanjeService.onAzurirajNarudzbu(this.vrijeme.value,this.vrstaPregleda.value,
                                                                        this.datum.value,this.pacijentiForm.value,this.napomena.value).pipe(
            tap(
                //Dohvaćam odgovor servera
                (odgovor) => {
                    //Pokrećem event
                    this.azuriranje.emit();
                    //Označavam da postoji odgovor servera
                    this.response = true;
                    //Spremam poruku servera
                    this.responsePoruka = odgovor["message"];
                }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }

    //Metoda koja naručuje pacijenta na neki termin
    onNaruciPacijenta(){
        
        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na naručivanje pacijenta
        this.narucivanjeService.naruciPacijenta(this.vrijeme.value,this.vrstaPregleda.value,
                                                                    this.datum.value,this.pacijentiForm.value,this.napomena.value).pipe(
            tap(
                //Dohvaćam odgovor servera
                (odgovor) => {
                    //Pokrećem event
                    this.narucivanje.emit();
                    //Označavam da ima odgovora servera
                    this.response = true;
                    //Spremam poruku servera 
                    this.responsePoruka = odgovor["message"];
                }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }

    //Metoda koja otkazuje narudžbu pacijenta
    onOtkaziNarudzbu(){

        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na OTKAZIVANJE narudžbe pacijenta
        this.narucivanjeService.onOtkaziNarudzbu().pipe(
            tap(
                //Dohvaćam odgovor servera
                (odgovor) => {
                    //Pokrećem event
                    this.otkazivanje.emit();
                    //Označavam da ima odgovora servera
                    this.response = true;
                    //Spremam poruku servera 
                    this.responsePoruka = odgovor["message"];
                }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe();   
    }

    //Metoda koja se pokreće kada korisnik klikne "Izađi"
    onClose(){
        //Pokreni event
        this.close.emit();
    }

    //Metoda koja zatvara prozor poruke servera
    onCloseAlert(){
        //Zatvori prozor
        this.response = false;
        //Emitiraj event da zatvori prozor narudžbe
        this.zatvaranje.emit();
    }

    //Ova metoda se pokreće kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete(); 
    }

    //Kreiram gettere za dijelove forme
    get vrijeme(): FormControl{
        return this.forma.get('vrijeme') as FormControl;
    }
    get vrstaPregleda(): FormControl{
        return this.forma.get('vrstaPregleda') as FormControl;
    }
    get datum(): FormControl{
        return this.forma.get('datum') as FormControl;
    }
    get pacijentiForm(): FormControl{
        return this.forma.get('pacijenti') as FormControl;
    }
    get napomena(): FormControl{
        return this.forma.get('napomena') as FormControl;
    }
}
