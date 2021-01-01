import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Korisnik } from 'src/app/shared/modeli/korisnik.model';
import { LijecnikService } from '../lijecnik.service';

@Component({
  selector: 'app-azuriranje-osobnih-podataka',
  templateUrl: './azuriranje-osobnih-podataka.component.html',
  styleUrls: ['./azuriranje-osobnih-podataka.component.css']
})


export class AzuriranjeOsobnihPodatakaComponent implements OnInit, OnDestroy {

    //Kreiram varijable u kojoj ću spremiti pretplatu na servis
    subsResolver: Subscription;
    subsAzuriranje: Subscription;
    //Kreiram objekt tipa Korisnik u kojemu će se nalaziti svi osobni podatci liječnika
    osobniPodatci: Korisnik;

    //Varijabla u koju spremam ID liječnika 
    idLijecnik: number;
    //Oznaka je li postoji odgovor od backenda (za alert)
    response: boolean = false;
    //Poruka backenda (ako postoji response)
    responsePoruka: string = null;
    //Oznaka je li se spinner pokazuje
    isLoading: boolean = false;

    constructor(
      //Dohvaćam liječnički servis
      private lijecnikService: LijecnikService,
      //Dohvaćam podatke koje su poslani tom routu preko Resolvera
      private route: ActivatedRoute
    ) {}

    //Ova metoda se poziva kada se ova komponenta pokrene 
    ngOnInit() {
      //Pretplaćujem se na podatke koji su poslani preko Resolvera 
      this.subsResolver = this.route.data.subscribe(
        (data : {podatci: Korisnik}) => {
          //Podatke koje je backend vratio (baza), pridružujem svom objektu i pomoću ngModel te vrijednosti lijepim na template
          this.osobniPodatci = data.podatci;
          //ID liječnika koji je backend vratio spremam u varijablu
          this.idLijecnik = this.osobniPodatci[0].idLijecnik;
        }
      );

    }

    ngOnDestroy(){
      //Ako postoji pretplata
      if(this.subsResolver){
        //Izađi iz pretplate
        this.subsResolver.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsAzuriranje){
        //Izađi iz pretplate
        this.subsAzuriranje.unsubscribe();
      }
    }

    //Pokreće se kada korisnik stisne button "Ažuriraj"
    onSubmit(form: NgForm){
      //console.log(form);
      if(!form.valid){
        return;
      }
      
      //Pokrećem spinner
      this.isLoading = true;

      //Pretplaćujem se na Observable koji je vratio podatke za ažuriranje osobnih podataka
      this.subsAzuriranje = this.lijecnikService.editPersonalData(this.idLijecnik,form.value.email,form.value.ime,form.value.prezime,form.value.adresa,form.value.specijalizacija).subscribe(
        (response) => {
          //Ako postoji odgovor
          if(response){
            //Gasim spinner
            this.isLoading = false;
            //Označavam da ima odgovora servera
            this.response = true;
            //Spremam odgovor servera
            this.responsePoruka = response["message"];
          }    
        }  
      );
    }

    //Zatvaranje prozora poruke
    onClose(){
      this.response = false;
    }

}
