import { Time } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {forkJoin, Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NarucivanjeService } from './narucivanje.service';
@Component({
  selector: 'app-narucivanje',
  templateUrl: './narucivanje.component.html',
  styleUrls: ['./narucivanje.component.css']
})
export class NarucivanjeComponent implements OnInit, OnDestroy{

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li prozor sa detaljima narudžbe otvoren
    isNarudzba: boolean = false;
    //Označavam je li ima odgovora servera
    response: boolean = false;
    //Spremam odgovor servera
    responsePoruka: string = null;
    //Kreiram svoju formu
    forma: FormGroup;
    //Spremam podatke kojima će biti popunjen prvi redak (HEAD)
    datumiNazivi: any;
    //Spremam sva vremena
    narudzbe: any;
    //Pokušaj kreiranja dinamične tablice
    formaTablica: FormGroup;
    //Današnji datum
    danasnjiDatum: Date;
    constructor(
        //Dohvaćam trenutni route zbog podataka iz Resolvera
        private route: ActivatedRoute,
        //Dohvaćam servis naručivanja
        private narucivanjeService: NarucivanjeService
    ) { }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {

        this.route.data.pipe(
            takeUntil(this.pretplateSubject)
        ).subscribe(
            //Dohvaćam podatke iz Resolvera
            (podatci : {podatci: any}) => {
                //Spremam podatke iz Resolvera u svoje polje
                this.datumiNazivi = podatci.podatci["datumiNazivi"];
                //Spremam sva vremena
                this.narudzbe = podatci.podatci["narudzbe"];
                console.log(this.narudzbe);
                //Spremam današnji datum
                this.danasnjiDatum = podatci.podatci["danasnjiDatum"];

                //Kreiram svoju formu za početne datume
                this.forma = new FormGroup({
                    'datum': new FormControl(this.danasnjiDatum)
                });
                
                //Kreiram reactive formu koja sadržava sve retke i stupce tablice narudžbi
                this.formaTablica = new FormGroup({
                    //FormArray koji sadrži sve datume i nazive dana u tjednu u prvom retku (formcontrolove)
                    'datumiNaziviDana': new FormArray([
                        new FormControl('Vrijeme')
                    ]),
                    'tbody': new FormArray([])
                });
                //Za svaki podatak u polju datumi i nazivi, DODAJ JEDAN FORM CONTROL U FORM ARRAY KOJI JE PRVI REDAK
                for(let datumNaziv of this.datumiNazivi){
                    //Kao vrijednost form controla inicijalno postavi DATUM + NAZIV DANA U TJEDNU
                    this.dodajDatumINazivDana(datumNaziv.NazivDana+" "+datumNaziv.Datum);
                }
                //Za svaki podataka u polju narudzbe, DODAJ JEDAN FORM CONTROL U FORM ARRAY 
                for(let narudzba of this.narudzbe){
                    //Kao vrijednost form controla inicijalno postavi VREMENA I NARUDŽBE
                    this.dodajTbody(narudzba);
                }
        });        

        //Pretplaćujem se na promjene u datumu
        this.forma.get('datum').valueChanges.pipe(
            takeUntil(this.pretplateSubject)
        ).subscribe(
            //Dohvaćam vrijednost datuma
            (datum) => {
                //Pozivam metodu da promijeni stanje tablice
                this.dohvatiNovoStanje(datum);
            }
        );
        
    }

    //Metoda koja dohvaća novo stanje tablice kada se promjeni datum
    dohvatiNovoStanje(datum: Date){

        const combined = forkJoin([
            this.narucivanjeService.dohvatiNovoStanje(datum),
            this.narucivanjeService.dohvatiNovoStanjeDatumiNazivi(datum)
        ]).pipe(
            takeUntil(this.pretplateSubject)
        ).subscribe(
            //Dohvaćam odgovor
            (odgovor) => {
                //Spremam narudžbe i vremena
                this.narudzbe = odgovor[0];
                //Prolazim kroz polje vremena i narudžbi
                this.narudzbe.forEach((element,index) => {
                    this.azurirajFormu(element,index);
                });
                //Spremam datume i nazive dana
                this.datumiNazivi = odgovor[1];
                //Postavljam hard-codiranu vrijednost 'Vrijeme' prvo na nultu poziciju
                (<FormArray>this.formaTablica.get('datumiNaziviDana')).at(0).patchValue('Vrijeme');
                //Prolazim kroz polje datuma i naziva dana u tjednu
                this.datumiNazivi.forEach((element,index) => {
                    //Postavljam datume i nazive dana u tjednu u tablicu narudžbi
                    (<FormArray>this.formaTablica.get('datumiNaziviDana')).at(index+1).patchValue(element.NazivDana+" "+element.Datum);    
                });
            }
        );
    }

    //Metoda koja ažurira tablicu na nove vrijednosti
    azurirajFormu(element: any,index: number){
        return (<FormArray>this.formaTablica.get('tbody')).at(index).setValue({
            'vrijeme': element.Vrijeme,
            'ponedjeljak': {
                'imePrezimeMBO': element.Ponedjeljak !== null ? this.splitajPodatkeNarudzbe(element.Ponedjeljak).ime
                                + " " + this.splitajPodatkeNarudzbe(element.Ponedjeljak).prezime 
                                + "\n MBO: " + this.splitajPodatkeNarudzbe(element.Ponedjeljak).mbo 
                                : null,
                'vrijeme': element.Vrijeme,
                'danUTjednu': 'Ponedjeljak',
                'ime': element.Ponedjeljak !== null ? this.splitajPodatkeNarudzbe(element.Ponedjeljak).ime : null,
                'prezime': element.Ponedjeljak !== null ? this.splitajPodatkeNarudzbe(element.Ponedjeljak).prezime : null,
                'mbo': element.Ponedjeljak !== null ? this.splitajPodatkeNarudzbe(element.Ponedjeljak).mbo : null,
                'idNarudzba': element.Ponedjeljak !== null ? this.splitajPodatkeNarudzbe(element.Ponedjeljak).idNarudzba : null,
                'bojaPregled': element.Ponedjeljak !== null ? this.splitajPodatkeNarudzbe(element.Ponedjeljak).bojaPregled : null
            },
            'utorak': {
                'imePrezimeMBO': element.Utorak !== null ? this.splitajPodatkeNarudzbe(element.Utorak).ime
                                + " " + this.splitajPodatkeNarudzbe(element.Utorak).prezime 
                                + "\n MBO: " + this.splitajPodatkeNarudzbe(element.Utorak).mbo 
                                : null,
                'vrijeme': element.Vrijeme,
                'danUTjednu': 'Utorak',
                'ime': element.Utorak !== null ? this.splitajPodatkeNarudzbe(element.Utorak).ime : null,
                'prezime': element.Utorak !== null ? this.splitajPodatkeNarudzbe(element.Utorak).prezime : null,
                'mbo': element.Utorak !== null ? this.splitajPodatkeNarudzbe(element.Utorak).mbo : null,
                'idNarudzba': element.Utorak !== null ? this.splitajPodatkeNarudzbe(element.Utorak).idNarudzba : null,
                'bojaPregled': element.Utorak !== null ? this.splitajPodatkeNarudzbe(element.Utorak).bojaPregled : null
            },
            'srijeda': {
                'imePrezimeMBO': element.Srijeda !== null ? this.splitajPodatkeNarudzbe(element.Srijeda).ime
                                + " " + this.splitajPodatkeNarudzbe(element.Srijeda).prezime 
                                + "\n MBO: " + this.splitajPodatkeNarudzbe(element.Srijeda).mbo 
                                : null,
                'vrijeme': element.Vrijeme,
                'danUTjednu': 'Srijeda',
                'ime': element.Srijeda !== null ? this.splitajPodatkeNarudzbe(element.Srijeda).ime : null,
                'prezime': element.Srijeda !== null ? this.splitajPodatkeNarudzbe(element.Srijeda).prezime : null,
                'mbo': element.Srijeda !== null ? this.splitajPodatkeNarudzbe(element.Srijeda).mbo : null,
                'idNarudzba': element.Srijeda !== null ? this.splitajPodatkeNarudzbe(element.Srijeda).idNarudzba : null,
                'bojaPregled': element.Srijeda !== null ? this.splitajPodatkeNarudzbe(element.Srijeda).bojaPregled : null
            },
            'cetvrtak': {
                'imePrezimeMBO': element.Četvrtak !== null ? this.splitajPodatkeNarudzbe(element.Četvrtak).ime
                                + " " + this.splitajPodatkeNarudzbe(element.Četvrtak).prezime 
                                + "\n MBO: " + this.splitajPodatkeNarudzbe(element.Četvrtak).mbo 
                                : null,
                'vrijeme': element.Vrijeme,
                'danUTjednu': 'Četvrtak',
                'ime': element.Četvrtak !== null ? this.splitajPodatkeNarudzbe(element.Četvrtak).ime : null,
                'prezime': element.Četvrtak !== null ? this.splitajPodatkeNarudzbe(element.Četvrtak).prezime : null,
                'mbo': element.Četvrtak !== null ? this.splitajPodatkeNarudzbe(element.Četvrtak).mbo : null,
                'idNarudzba': element.Četvrtak !== null ? this.splitajPodatkeNarudzbe(element.Četvrtak).idNarudzba : null,
                'bojaPregled': element.Četvrtak !== null ? this.splitajPodatkeNarudzbe(element.Četvrtak).bojaPregled : null
            },
            'petak': {
                'imePrezimeMBO': element.Petak !== null ? this.splitajPodatkeNarudzbe(element.Petak).ime
                                + " " + this.splitajPodatkeNarudzbe(element.Petak).prezime 
                                + "\n MBO: " + this.splitajPodatkeNarudzbe(element.Petak).mbo 
                                : null,
                'vrijeme': element.Vrijeme,
                'danUTjednu': 'Petak',
                'ime': element.Petak !== null ? this.splitajPodatkeNarudzbe(element.Petak).ime : null,
                'prezime': element.Petak !== null ? this.splitajPodatkeNarudzbe(element.Petak).prezime : null,
                'mbo': element.Petak !== null ? this.splitajPodatkeNarudzbe(element.Petak).mbo : null,
                'idNarudzba': element.Petak !== null ? this.splitajPodatkeNarudzbe(element.Petak).idNarudzba : null,
                'bojaPregled': element.Petak !== null ? this.splitajPodatkeNarudzbe(element.Petak).bojaPregled : null
            }
        });
    }

    //Metoda koja se izvršava kada korisnik otkaže narudžbu (FORMA SE AŽURIRA)
    onOtkazivanjeNarudzba(){

        const combined = forkJoin([
            this.narucivanjeService.getVremena(),
            this.narucivanjeService.getDatumiNazivi()
        ]).pipe(
            takeUntil(this.pretplateSubject)
        ).subscribe(
            (odgovor) => {
                //Dohvaćam narudžbe i vremena
                this.narudzbe = odgovor[0];
                //Prolazim kroz polje vremena i narudžbi
                this.narudzbe.forEach((element,index) => {
                    this.azurirajFormu(element,index);
                });
                //Dohvaćam datume i nazive dana
                this.datumiNazivi = odgovor[1];
                //Postavljam hard-codiranu vrijednost 'Vrijeme' prvo na nultu poziciju
                (<FormArray>this.formaTablica.get('datumiNaziviDana')).at(0).patchValue('Vrijeme');
                //Prolazim kroz polje datuma i naziva dana u tjednu
                this.datumiNazivi.forEach((element,index) => {
                    //Postavljam datume i nazive dana u tjednu u tablicu narudžbi
                    (<FormArray>this.formaTablica.get('datumiNaziviDana')).at(index+1).patchValue(element.NazivDana+" "+element.Datum);    
                });
            }
        );
    }

    //Metoda koja se izvršava kada se narudžba ažurira 
    onAzuriranjeNarudzba(){

        const combined = forkJoin([
            this.narucivanjeService.getVremena(),
            this.narucivanjeService.getDatumiNazivi()
        ]).pipe(
            takeUntil(this.pretplateSubject)
        ).subscribe(
            (odgovor) => {
                //Dohvaćam narudžbe i vremena
                this.narudzbe = odgovor[0];
                //Prolazim kroz polje vremena i narudžbi
                this.narudzbe.forEach((element,index) => {
                    this.azurirajFormu(element,index);
                });
                //Dohvaćam datume i nazive dana
                this.datumiNazivi = odgovor[1];
                //Postavljam hard-codiranu vrijednost 'Vrijeme' prvo na nultu poziciju
                (<FormArray>this.formaTablica.get('datumiNaziviDana')).at(0).patchValue('Vrijeme');
                //Prolazim kroz polje datuma i naziva dana u tjednu
                this.datumiNazivi.forEach((element,index) => {
                    //Postavljam datume i nazive dana u tjednu u tablicu narudžbi
                    (<FormArray>this.formaTablica.get('datumiNaziviDana')).at(index+1).patchValue(element.NazivDana+" "+element.Datum);    
                });
            }
        );
    }

    //Metoda koja se pokreće kada ova komponenta primi poruku da je novi pacijent naručen
    onNarucivanjePacijenta(){

        const combined = forkJoin([
            this.narucivanjeService.getVremena(),
            this.narucivanjeService.getDatumiNazivi()
        ]).pipe(
            takeUntil(this.pretplateSubject)
        ).subscribe(
            //Dohvaćam odgovor servera
            (odgovor) => {
                //Spremam narudžbe i vremena
                this.narudzbe = odgovor[0];
                //Prolazim kroz polje vremena i narudžbi
                this.narudzbe.forEach((element,index) => {
                    this.azurirajFormu(element,index);
                }); 
                //Thead sa servera spremam u svoje polje
                this.datumiNazivi = odgovor[1];
                //Postavljam hard-codiranu vrijednost 'Vrijeme' prvo na nultu poziciju
                (<FormArray>this.formaTablica.get('datumiNaziviDana')).at(0).patchValue('Vrijeme');
                //Prolazim kroz polje datuma i naziva dana u tjednu
                this.datumiNazivi.forEach((element,index) => {
                    //Postavljam datume i nazive dana u tjednu u tablicu narudžbi
                    (<FormArray>this.formaTablica.get('datumiNaziviDana')).at(index+1).patchValue(element.NazivDana+" "+element.Datum);  
                });
            }
        );
    }
    //Metoda koja kao parametar prima podatke iz baze i iz tih podataka uzima ime,prezime,mbo pacijenta i ID narudžbe te ih VRAĆA u objektu
    splitajPodatkeNarudzbe(narudzba: string){
        //Ovo vraća polje sa imenom, prezimenom, mbo-om i id narudžbe kao elementima
        const transformiraniPodatci = narudzba.split(" ");
        //Svaki od elemenata polja stavlja u svoju varijablu
        const [ime,prezime,mbo,idNarudzba,bojaPregled] = transformiraniPodatci;
        //Vraćam objekt
        return {ime:ime,prezime:prezime,mbo:mbo,idNarudzba:idNarudzba,bojaPregled:bojaPregled};
    }

    //Dohvaća formarray TBODY unutar glavnog polja
    getControlsTbody(){
        return (this.formaTablica.get('tbody') as FormArray).controls;
    }

    getControlsThead(){
        return (this.formaTablica.get('datumiNaziviDana') as FormArray).controls;
    }

    //Metoda za dodavanje novog formGroupa u FormArray "tbody"
    dodajTbody(narudzba: any){
        //U FormArray "vrijeme" dodavam formControl
        (<FormArray>this.formaTablica.get('tbody')).push(
            /* new FormGroup({
                'vrijeme': new FormControl(narudzba.Vrijeme),
                'imePrezPacijent': new FormControl(narudzba.imePacijent && narudzba.prezPacijent !== null 
                                                ? narudzba.imePacijent+" "+narudzba.prezPacijent+"\n MBO: "+narudzba.mboPacijent 
                                                : ""),
                'danUTjednu': new FormControl(narudzba.nazivDana) 
            }) */ 
            new FormGroup({
                'vrijeme': new FormControl(narudzba.Vrijeme),
                'ponedjeljak': new FormGroup({
                    //Ako nema rezerviranih pacijenata za Ponedjeljak, stavi null u ćeliju tablice, a ako ima postavi podatke naručenog pacijenta
                    'imePrezimeMBO': new FormControl(narudzba.Ponedjeljak !== null ? this.splitajPodatkeNarudzbe(narudzba.Ponedjeljak).ime
                                                    + " " + this.splitajPodatkeNarudzbe(narudzba.Ponedjeljak).prezime 
                                                    + "\n MBO: " + this.splitajPodatkeNarudzbe(narudzba.Ponedjeljak).mbo 
                                                    : null),
                    'vrijeme': new FormControl(narudzba.Vrijeme),
                    'danUTjednu': new FormControl('Ponedjeljak'),
                    //Ova tri form controla služe isključivo za prijenos podataka između komponenti
                    'ime': new FormControl(narudzba.Ponedjeljak !== null ? this.splitajPodatkeNarudzbe(narudzba.Ponedjeljak).ime : null),
                    'prezime': new FormControl(narudzba.Ponedjeljak !== null ? this.splitajPodatkeNarudzbe(narudzba.Ponedjeljak).prezime : null),
                    'mbo': new FormControl(narudzba.Ponedjeljak !== null ? this.splitajPodatkeNarudzbe(narudzba.Ponedjeljak).mbo : null),
                    'idNarudzba': new FormControl(narudzba.Ponedjeljak !== null ? this.splitajPodatkeNarudzbe(narudzba.Ponedjeljak).idNarudzba : null),
                    'bojaPregled': new FormControl(narudzba.Ponedjeljak !== null ? this.splitajPodatkeNarudzbe(narudzba.Ponedjeljak).bojaPregled : null)
                }),
                'utorak': new FormGroup({
                    //Ako nema rezerviranih pacijenata za Utorak, stavi null u ćeliju tablice, a ako ima postavi podatke naručenog pacijenta
                    'imePrezimeMBO': new FormControl(narudzba.Utorak !== null ? this.splitajPodatkeNarudzbe(narudzba.Utorak).ime
                                                    + " " + this.splitajPodatkeNarudzbe(narudzba.Utorak).prezime 
                                                    + "\n MBO: " + this.splitajPodatkeNarudzbe(narudzba.Utorak).mbo 
                                                    : null),
                    'vrijeme': new FormControl(narudzba.Vrijeme),
                    'danUTjednu': new FormControl('Utorak'),
                    //Ova tri form controla služe isključivo za prijenos podataka između komponenti
                    'ime': new FormControl(narudzba.Utorak !== null ? this.splitajPodatkeNarudzbe(narudzba.Utorak).ime : null),
                    'prezime': new FormControl(narudzba.Utorak !== null ? this.splitajPodatkeNarudzbe(narudzba.Utorak).prezime : null),
                    'mbo': new FormControl(narudzba.Utorak !== null ? this.splitajPodatkeNarudzbe(narudzba.Utorak).mbo : null),
                    'idNarudzba': new FormControl(narudzba.Utorak !== null ? this.splitajPodatkeNarudzbe(narudzba.Utorak).idNarudzba : null),
                    'bojaPregled': new FormControl(narudzba.Utorak !== null ? this.splitajPodatkeNarudzbe(narudzba.Utorak).bojaPregled : null)  
                }),
                'srijeda': new FormGroup({
                    //Ako nema rezerviranih pacijenata za Srijedu, stavi null u ćeliju tablice, a ako ima postavi podatke naručenog pacijenta
                    'imePrezimeMBO': new FormControl(narudzba.Srijeda !== null ? this.splitajPodatkeNarudzbe(narudzba.Srijeda).ime
                                                    + " " + this.splitajPodatkeNarudzbe(narudzba.Srijeda).prezime 
                                                    + "\n MBO: " + this.splitajPodatkeNarudzbe(narudzba.Srijeda).mbo 
                                                    : null),
                    'vrijeme': new FormControl(narudzba.Vrijeme),
                    'danUTjednu': new FormControl('Srijeda'),
                    //Ova tri form controla služe isključivo za prijenos podataka između komponenti
                    'ime': new FormControl(narudzba.Srijeda !== null ? this.splitajPodatkeNarudzbe(narudzba.Srijeda).ime : null),
                    'prezime': new FormControl(narudzba.Srijeda !== null ? this.splitajPodatkeNarudzbe(narudzba.Srijeda).prezime : null),
                    'mbo': new FormControl(narudzba.Srijeda !== null ? this.splitajPodatkeNarudzbe(narudzba.Srijeda).mbo : null),
                    'idNarudzba': new FormControl(narudzba.Srijeda !== null ? this.splitajPodatkeNarudzbe(narudzba.Srijeda).idNarudzba : null),
                    'bojaPregled': new FormControl(narudzba.Srijeda !== null ? this.splitajPodatkeNarudzbe(narudzba.Srijeda).bojaPregled : null)
                }),
                'cetvrtak': new FormGroup({
                    //Ako nema rezerviranih pacijenata za Četvrtak, stavi null u ćeliju tablice, a ako ima postavi podatke naručenog pacijenta
                    'imePrezimeMBO': new FormControl(narudzba.Četvrtak !== null ? this.splitajPodatkeNarudzbe(narudzba.Četvrtak).ime
                                                    + " " + this.splitajPodatkeNarudzbe(narudzba.Četvrtak).prezime 
                                                    + "\n MBO: " + this.splitajPodatkeNarudzbe(narudzba.Četvrtak).mbo 
                                                    : null),
                    'vrijeme': new FormControl(narudzba.Vrijeme),
                    'danUTjednu': new FormControl('Četvrtak'),
                    //Ova tri form controla služe isključivo za prijenos podataka između komponenti
                    'ime': new FormControl(narudzba.Četvrtak !== null ? this.splitajPodatkeNarudzbe(narudzba.Četvrtak).ime : null),
                    'prezime': new FormControl(narudzba.Četvrtak !== null ? this.splitajPodatkeNarudzbe(narudzba.Četvrtak).prezime : null),
                    'mbo': new FormControl(narudzba.Četvrtak !== null ? this.splitajPodatkeNarudzbe(narudzba.Četvrtak).mbo : null),
                    'idNarudzba': new FormControl(narudzba.Četvrtak !== null ? this.splitajPodatkeNarudzbe(narudzba.Četvrtak).idNarudzba : null),
                    'bojaPregled': new FormControl(narudzba.Četvrtak !== null ? this.splitajPodatkeNarudzbe(narudzba.Četvrtak).bojaPregled : null)
                }),
                'petak': new FormGroup({
                    //Ako nema rezerviranih pacijenata za Petak, stavi null u ćeliju tablice, a ako ima postavi podatke naručenog pacijenta
                    'imePrezimeMBO': new FormControl(narudzba.Petak !== null ? this.splitajPodatkeNarudzbe(narudzba.Petak).ime
                                                    + " " + this.splitajPodatkeNarudzbe(narudzba.Petak).prezime 
                                                    + "\n MBO: " + this.splitajPodatkeNarudzbe(narudzba.Petak).mbo 
                                                    : null),
                    'vrijeme': new FormControl(narudzba.Vrijeme),
                    'danUTjednu': new FormControl('Petak'),
                    //Ova tri form controla služe isključivo za prijenos podataka između komponenti
                    'ime': new FormControl(narudzba.Petak !== null ? this.splitajPodatkeNarudzbe(narudzba.Petak).ime : null),
                    'prezime': new FormControl(narudzba.Petak !== null ? this.splitajPodatkeNarudzbe(narudzba.Petak).prezime : null),
                    'mbo': new FormControl(narudzba.Petak !== null ? this.splitajPodatkeNarudzbe(narudzba.Petak).mbo : null),
                    'idNarudzba': new FormControl(narudzba.Petak !== null ? this.splitajPodatkeNarudzbe(narudzba.Petak).idNarudzba : null),
                    'bojaPregled': new FormControl(narudzba.Petak !== null ? this.splitajPodatkeNarudzbe(narudzba.Petak).bojaPregled : null)
                }),
            })
        );
    } 
    
    //Dohvaća pojedine form controlove unutar polja 
    getControlsDatumINazivDana(){
        return (this.formaTablica.get('datumiNaziviDana') as FormArray).controls;
    }

    //Metoda za dodavanje novog stupca u redak tablice
    dodajDatumINazivDana(datumNaziv: any){
        (<FormArray>this.formaTablica.get('datumiNaziviDana')).push(
          new FormControl(datumNaziv) 
        );
    }  

    //Metoda se pokreće kada korisnik izađe iz prozora poruke
    onClose(){
        //Zatvori prozor
        this.response = false;
    }

    //Metoda koja se pokreće kada korisnik klikne "Izađi" na prozoru narudžbe
    onCloseNarudzba(){
        //Izađi iz prozora
        this.isNarudzba = false;
    }

    onCellClick(idNarudzba: string,vrijeme: Time,danUTjednu: string){
        console.log(idNarudzba);
        let datum = this.datum.value;
        console.log(datum);
        //Dohvaćam BehaviourSubject iz servisa i punim ga potrebnim podatcima da ih mogu proslijediti PROZORU NARUDŽBE
        this.narucivanjeService.podatciNarudzbe.next({idNarudzba,vrijeme,danUTjednu,datum});
        //Otvaram prozor detalja narudžbe
        this.isNarudzba = true;
    }

    //Metoda koja se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

    //Pravim getter za datum koji se mijenja
    get datum(): FormControl{
        return this.forma.get('datum') as FormControl;
    }

}
