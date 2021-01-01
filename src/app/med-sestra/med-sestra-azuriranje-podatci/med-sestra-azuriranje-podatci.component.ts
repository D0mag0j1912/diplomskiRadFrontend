import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Korisnik } from 'src/app/shared/modeli/korisnik.model';
import { MedSestraService } from '../med-sestra.service';

@Component({
  selector: 'app-med-sestra-azuriranje-podatci',
  templateUrl: './med-sestra-azuriranje-podatci.component.html',
  styleUrls: ['./med-sestra-azuriranje-podatci.component.css']
})
export class MedSestraAzuriranjePodatciComponent implements OnInit {
  
  //Kreiram varijable u kojima pohranjujem pretplate
  subsDohvatiPodatke: Subscription;
  subsAzuriranje: Subscription;
  //Kreiram varijablu u kojoj označavam postoji li odgovor servera
  response: boolean = false;
  //Kreiram varijablu u kojoj spremam odgovor servera
  responsePoruka: string = null;
  //Označavam je li spinner aktivan
  isLoading: boolean = false;
  //Kreiram objekt tipa Korisnik u kojemu će se nalaziti svi osobni podatci medicinske sestre
  osobniPodatci: Korisnik;
  //Varijabla u koju spremam ID medicinske sestre
  idMedSestra: number;

  constructor(
    //Dohvaćam podatke koje je Resolver poslao routu
    private route: ActivatedRoute,
    //Dohvaćam servis medicinske sestre
    private medSestraService: MedSestraService
  ) { }

  //Metoda koja se poziva kada se komponenta inicijalizira
  ngOnInit(){

    //Dohvaćam podatke iz Resolvera
    this.subsDohvatiPodatke = this.route.data.subscribe(
      (data: {podatci: Korisnik}) => {
        this.osobniPodatci = data.podatci;
        //Dohvaćam ID medicinske sestre
        this.idMedSestra = this.osobniPodatci[0].idMedSestra;
      }
    );
    
  }

  //Kada se klikne button "Ažuriraj"
  onSubmit(form: NgForm){

    //Ako forma nije validna
    if(!form.valid){
      return;
    }

    //Pokrećem spinner
    this.isLoading = true;

    //Pretplaćujem se na Observable koji je vratio podatke za ažuriranje osobnih podataka
    this.subsAzuriranje = this.medSestraService.editPersonalData(this.idMedSestra,form.value.email,form.value.ime,form.value.prezime,form.value.adresa,form.value.specijalizacija).subscribe(
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

  //Kada se klikne "Close" na prozoru odgovora
  onClose(){
    //Zatvori prozor
    this.response = false;
  }

}
