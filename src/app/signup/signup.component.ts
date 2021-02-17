import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { SignupService } from './signup.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Inicijalizacija boolean varijable za postojanje responsa
    response: boolean = false;
    //Varijabla koja pohranjuje vrijednost odgovora backenda
    responsePoruka: string = null;
    
    //Kreiram instancu servisa
    constructor(
      private signupService: SignupService
    ) {}

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
        //Pozivam metodu signup() iz servisa
        this.signupService.signup(
            form.value.tip,
            form.value.ime,
            form.value.prezime,
            form.value.adresa,
            form.value.specijalizacija,
            form.value.email,
            form.value.lozinka,
            form.value.ponovnoLozinka
        ).pipe(
            tap(
              (response) => {
                console.log(response);
                //Odgovor backenda => true
                this.response = true;
                //Vrijednost odgovora backenda se sprema u varijablu "responsePoruka"
                this.responsePoruka = response['message'];
              }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }

    //Metoda koja je poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}
