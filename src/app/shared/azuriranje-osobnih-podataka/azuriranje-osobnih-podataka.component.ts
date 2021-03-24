import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { MedSestraService } from 'src/app/med-sestra/med-sestra.service';
import { Korisnik } from 'src/app/shared/modeli/korisnik.model';
import { LijecnikService } from '../../lijecnik/lijecnik.service';
import { ZdravstveniRadnik } from '../modeli/zdravstveniRadnik.model';

@Component({
  selector: 'app-azuriranje-osobnih-podataka',
  templateUrl: './azuriranje-osobnih-podataka.component.html',
  styleUrls: ['./azuriranje-osobnih-podataka.component.css']
})


export class AzuriranjeOsobnihPodatakaComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Kreiram objekt tipa Korisnik u kojemu će se nalaziti svi osobni podatci liječnika
    osobniPodatci: Korisnik;
    //Oznaka je li postoji odgovor od backenda (za alert)
    response: boolean = false;
    //Poruka backenda (ako postoji response)
    responsePoruka: string = null;
    //Definiram formu
    forma: FormGroup;
    //Spremam sve specijalizacije
    zdrRadnici: ZdravstveniRadnik[];

    constructor(
      //Dohvaćam liječnički servis
      private lijecnikService: LijecnikService,
      //Dohvaćam servis med. sestre
      private medSestraService: MedSestraService,
      //Dohvaćam podatke koje su poslani tom routu preko Resolvera
      private route: ActivatedRoute
    ) {}

    //Ova metoda se poziva kada se ova komponenta pokrene 
    ngOnInit() {
      //Pretplaćujem se na podatke koji su poslani preko Resolvera 
      this.route.data.pipe(
          tap(
            (data : {podatci: any}) => {
              //Kreiram objekt tipa "Korisnik" i u njega stavljam podatke sa servera
              this.osobniPodatci = new Korisnik(data.podatci[0][0]);
              this.zdrRadnici = data.podatci[1];
              //Kreiram formu
              this.forma = new FormGroup({
                  'ime': new FormControl(this.osobniPodatci.ime, [Validators.required]),
                  'prezime': new FormControl(this.osobniPodatci.prezime, [Validators.required]),
                  'email': new FormControl(this.osobniPodatci.email, [Validators.required, Validators.email]),
                  'adresa': new FormControl(this.osobniPodatci.adresa, [Validators.required]),
                  'specijalizacija': new FormControl(this.osobniPodatci.specijalizacija, [Validators.required])
              });
            }
          ),
          takeUntil(this.pretplateSubject)
      ).subscribe();

    }

    //Pokreće se kada korisnik stisne button "Ažuriraj"
    onSubmit(){
        //Ako forma nije valjana
        if(!this.forma.valid){
          return;
        }
        //Ako je definiran ID liječnika u modelu:
        if(this.osobniPodatci.idLijecnik){
            //Pretplaćujem se na Observable koji je vratio odgovor servera za ažuriranje osobnih podataka
            this.lijecnikService.editPersonalData(this.osobniPodatci.idLijecnik,this.email.value, 
                this.ime.value,this.prezime.value,this.adresa.value,this.specijalizacija.value).pipe(
                tap(
                  (response) => {
                      //Ako postoji odgovor
                      if(response){
                          //Označavam da ima odgovora servera
                          this.response = true;
                          //Spremam odgovor servera
                          this.responsePoruka = response["message"];
                      }    
                  }
                ),
                takeUntil(this.pretplateSubject)
            ).subscribe();
        }
        //Ako NIJE definiran ID liječnika u modelu:
        else{
            //Pretplaćujem se na Observable koji je vratio odgovor servera za ažuriranje osobnih podataka
            this.medSestraService.editPersonalData(this.osobniPodatci.idMedSestra, this.email.value, 
                this.ime.value, this.prezime.value, this.adresa.value, this.specijalizacija.value).pipe(
                tap(response => {
                    //Ako postoji odgovor
                    if(response){
                      //Označavam da ima odgovora servera
                      this.response = true;
                      //Spremam odgovor servera
                      this.responsePoruka = response["message"];
                    } 
                }),
                takeUntil(this.pretplateSubject)
            ).subscribe();
        }
    }

    //Zatvaranje prozora poruke
    onClose(){
        this.response = false;
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

    get ime(): FormControl{
        return this.forma.get('ime') as FormControl;
    }
    get prezime(): FormControl{
        return this.forma.get('prezime') as FormControl;
    }
    get email(): FormControl{
        return this.forma.get('email') as FormControl;
    }
    get adresa(): FormControl{
        return this.forma.get('adresa') as FormControl;
    }
    get specijalizacija(): FormControl{
        return this.forma.get('specijalizacija') as FormControl;
    }
}
