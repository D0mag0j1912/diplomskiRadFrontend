import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Korisnik } from '../shared/modeli/korisnik.model';
import { SignupService } from './signup.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

  //Varijabla u kojoj pohranjujem pretplatu na signup Observable
  subs: Subscription;

  //Inicijalizacija boolean varijable za postojanje responsa
  response: boolean = false;
  
  //Varijabla koja pohranjuje vrijednost odgovora backenda
  responsePoruka: string = null;
  
  //Inicijalizacija instance objekta "Korisnik"
  noviKorisnik: Korisnik = null;

  //Varijabla u kojoj pohranjujem stanje spinnera (na početku false)
  isLoading: boolean = false;
  
  //Kreiram instancu servisa
  constructor(
    private signupService: SignupService
  ) { }

  //Kada se komponenta loada, poziva se ova metoda
  ngOnInit() {
  }

  //Kada ova komponenta čuje event od Alert komponente, vraća response varijablu na false i gasi se prozor
  onClose(){
    this.response = false;
  }

  //Kada se klikne button "Registriraj se":
  onSubmit(form: NgForm){
    //Još jedna provjera da vidim je li forma valjana
    if(!form.valid){
      return;
    }
    //Postavljam spinner na true
    this.isLoading = true;

    //Pozivam metodu signup() iz servisa
    this.subs = this.signupService.signup(
        form.value.tip,
        form.value.ime,
        form.value.prezime,
        form.value.adresa,
        form.value.specijalizacija,
        form.value.email,
        form.value.lozinka,
        form.value.ponovnoLozinka
    ).subscribe(
      (response) => {
        console.log(response);
        //Gasim spinner 
        this.isLoading = false;
        //Odgovor backenda => true
        this.response = true;
        //Vrijednost odgovora backenda se sprema u varijablu "responsePoruka"
        this.responsePoruka = response['message'];
      }
    );
  }

  //Metoda koja je poziva kada se komponenta uništi
  ngOnDestroy(){
    //Ako postoji preplata
    if(this.subs){
      //Izađi iz pretplate
      this.subs.unsubscribe();
    }
  }
}
