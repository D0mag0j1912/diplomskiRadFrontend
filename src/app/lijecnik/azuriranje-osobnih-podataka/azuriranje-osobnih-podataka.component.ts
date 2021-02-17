import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Korisnik } from 'src/app/shared/modeli/korisnik.model';
import { LijecnikService } from '../lijecnik.service';

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
    //Varijabla u koju spremam ID liječnika 
    idLijecnik: number;
    //Oznaka je li postoji odgovor od backenda (za alert)
    response: boolean = false;
    //Poruka backenda (ako postoji response)
    responsePoruka: string = null;

    constructor(
      //Dohvaćam liječnički servis
      private lijecnikService: LijecnikService,
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
              this.osobniPodatci = new Korisnik(data.podatci[0]);
              //ID liječnika koji je backend vratio spremam u varijablu
              this.idLijecnik = this.osobniPodatci.idLijecnik;
            }
          ),
          takeUntil(this.pretplateSubject)
      ).subscribe();

    }

    //Pokreće se kada korisnik stisne button "Ažuriraj"
    onSubmit(form: NgForm){

        if(!form.valid){
          return;
        }

        //Pretplaćujem se na Observable koji je vratio podatke za ažuriranje osobnih podataka
        this.lijecnikService.editPersonalData(this.idLijecnik,form.value.email,form.value.ime,form.value.prezime,form.value.adresa,form.value.specijalizacija).pipe(
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

    //Zatvaranje prozora poruke
    onClose(){
        this.response = false;
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

}
