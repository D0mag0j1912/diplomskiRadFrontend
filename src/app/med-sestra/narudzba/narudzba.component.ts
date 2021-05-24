import { Time } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subject } from 'rxjs';
import { concatMap, map, tap, takeUntil } from 'rxjs/operators';
import { NarucivanjeService } from 'src/app/med-sestra/narucivanje/narucivanje.service';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { ImportService } from 'src/app/shared/import.service';
import {Narudzba} from './narudzba.model';

@Component({
  selector: 'app-narudzba',
  templateUrl: './narudzba.component.html',
  styleUrls: ['./narudzba.component.css']
})
export class NarudzbaComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
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
    //Primam podatke od roditelja
    @Input() primljenaNarudzba: {
        idNarudzba: string,
        vrijeme:Time,
        danUTjednu: string,
        datum: Date
    };
    //Kreiram formu
    forma: FormGroup;
    //Spremam detalje narudžbe koje sam dobio iz tablice
    narudzba: Narudzba;
    //Spremam vrijeme narudžbe da ga prikažem na praznoj ćeliji
    vrijemeNarudzba: Time;
    //Spremam datum narudžbe da ga prikažem na praznoj ćeliji
    datumNarudzba: Date;
    //Spremam pacijente
    pacijenti: string[] = [];
    //Spremam različite vrste pregleda za dropdown
    razliciteVrstePregleda: string[] = [];

    constructor(
        //Dohvaćam servis naručivanja
        private narucivanjeService: NarucivanjeService,
        //Dohvaćam servis dialoga
        private dialog: MatDialog,
        //Dohvaćam import servis
        private importService: ImportService
    ) { }

    //Metoda koja se pokreće inicijalizicijom komponente
    ngOnInit() {

        const combined = forkJoin([
            this.narucivanjeService.getRazliciteVrstePregleda(),
            this.importService.getPacijenti(),
            this.narucivanjeService.dohvatiDatum(
                this.primljenaNarudzba.danUTjednu,
                this.primljenaNarudzba.datum
            ),
            this.narucivanjeService.getNarudzba(this.primljenaNarudzba.idNarudzba),
            this.narucivanjeService.dohvatiVrijeme(this.primljenaNarudzba.vrijeme)
        ]).pipe(
            map(podatci => {
                return {
                    vrstePregleda: podatci[0],
                    pacijenti: podatci[1],
                    datum: podatci[2][0],
                    narudzba: podatci[3],
                    vrijeme: podatci[4][0]
                };
            }),
            tap(podatci => {
                //Spremam podatke pacijenta u svoje polje pacijenata
                for(const pacijent of podatci.pacijenti){
                    this.pacijenti.push(pacijent.Pacijent);
                }
                //Spremam sve različite vrste pregleda
                for(const vrsta of podatci.vrstePregleda){
                    this.razliciteVrstePregleda.push(vrsta.nazivVrstaPregled);
                }
                //Ako ima podataka narudžbe
                if(podatci.narudzba.length > 0){
                    //Označavam da ima pacijenta
                    this.isPacijent = true;
                    //Spremam sve podatke kliknute narudžbe
                    this.narudzba = new Narudzba(podatci.narudzba[0]);
                }
                //Spremam vrijeme narudžbe u svoju varijablu
                this.vrijemeNarudzba = podatci.vrijeme.vrijeme;
                //Spremam datum narudžbe u svoju varijablu
                this.datumNarudzba = podatci.datum.datum;

                //Kreiram formu
                this.forma = new FormGroup({
                    //Ako već postoji narudžba pacijenta, popuni podatke forme s podatcima narudžbe, a ako ne postoji, stavi null ili stavi VRIJEME I DATUM
                    'vrijeme': new FormControl(
                        this.isPacijent ? this.narudzba.vrijemeNarucivanje : this.vrijemeNarudzba,
                        [Validators.required]),
                    'vrstaPregleda': new FormControl(null,
                        [Validators.required,
                        this.isValidVrstaPregleda.bind(this)]),
                    'datum': new FormControl(
                        this.isPacijent ? this.narudzba.datumNarucivanje : this.datumNarudzba,
                        [Validators.required,
                        Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]),
                    'pacijenti': new FormControl(null,
                        [Validators.required,
                        this.isValidPacijent.bind(this)]),
                    'napomena': new FormControl(this.isPacijent ? this.narudzba.napomenaNarucivanje : null)
                });
                //Postavljam inicijalnu vrijednost dropdowna na vrijednost PACIJENTA koji je kliknut u ćeliji tablice
                this.forma.get('pacijenti').patchValue(this.isPacijent ? this.narudzba.pacijent : null,{emitEvent: false});
                //Postavljam inicijalnu vrijednost dropdowna na vrijednost VRSTU PREGLEDA koju kliknuti pacijent ima
                this.forma.get('vrstaPregleda').patchValue(this.isPacijent ? this.narudzba.nazivVrstaPregled : null,{emitEvent: false});
            })
        ).subscribe();

    }

    //Metoda koja provjerava je li vrsta pregleda ispravno unesena tj. je li unesena vrijednost koja nije dio polja vrsta pregleda
    isValidVrstaPregleda(control: FormControl): {[key: string]: boolean}{
        //Ako vrijednost vrsta pregleda koje je korisnik unio nije dio polja vrsta pregleda (znači vraća -1 ako nije dio polja)
        if(this.razliciteVrstePregleda.indexOf(control.value) === -1){
            return {'vrstaIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
    }
    //Metoda koja provjerava je li pacijent ispravno unesen tj. je li unesena vrijednost koja nije dio polja pacijenata
    isValidPacijent(control: FormControl): {[key: string]: boolean}{
        //Ako vrijednost pacijenta koje je korisnik unio nije dio polja pacijenata (znači vraća -1 ako nije dio polja)
        if(this.pacijenti.indexOf(control.value) === -1){
            return {'pacijentIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
    }

    //Metoda koja ažurira narudžbu
    onAzurirajNarudzbu(){

        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na ažuriranje narudžbe
        this.narucivanjeService.azurirajNarudzbu(
            this.primljenaNarudzba.idNarudzba,
            this.vrijeme.value,
            this.vrstaPregleda.value,
            this.datum.value,
            this.pacijentiForm.value,
            this.napomena.value).pipe(
            concatMap(
                //Dohvaćam odgovor servera
                (odgovor) => {
                    //Otvaram dialog
                    let dialogRef = this.dialog.open(DialogComponent, {data: {message: odgovor.message}});
                    return dialogRef.afterClosed().pipe(
                        tap(result => {
                            //Ako je sestra kliknula "Izađi"
                            if(!result){
                                //Pokrećem event
                                this.azuriranje.emit();
                            }
                        })
                    );
                }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }

    //Metoda koja naručuje pacijenta na neki termin
    onNaruciPacijenta(){

        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na naručivanje pacijenta
        this.narucivanjeService.naruciPacijenta(
            this.vrijeme.value,
            this.vrstaPregleda.value,
            this.datum.value,
            this.pacijentiForm.value,
            this.napomena.value).pipe(
            concatMap(
                //Dohvaćam odgovor servera
                (odgovor) => {
                    //Otvaram dialog
                    let dialogRef = this.dialog.open(DialogComponent, {data: {message: odgovor.message}});
                    return dialogRef.afterClosed().pipe(
                        tap(result => {
                            //Ako je sestra kliknula "Izađi"
                            if(!result){
                                //Pokrećem event
                                this.narucivanje.emit();
                            }
                        })
                    );
                }
            )
        ).subscribe();
    }

    //Metoda koja otkazuje narudžbu pacijenta
    onOtkaziNarudzbu(){

        //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na OTKAZIVANJE narudžbe pacijenta
        this.narucivanjeService.otkaziNarudbu(this.primljenaNarudzba.idNarudzba).pipe(
            concatMap(
                //Dohvaćam odgovor servera
                (odgovor) => {
                    //Otvaram dialog
                    let dialogRef = this.dialog.open(DialogComponent, {data: {message: odgovor.message}});
                    return dialogRef.afterClosed().pipe(
                        tap(result => {
                            //Ako je sestra kliknula "Izađi"
                            if(!result){
                                //Pokrećem event
                                this.otkazivanje.emit();
                            }
                        })
                    );
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
