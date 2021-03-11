import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { LoginService } from './login.service';
import * as Validacija from './login-validations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Ovdje spremam ima li odgovora servera
    response: boolean = false;
    forma: FormGroup;
    //Ovdje spremam poruku odgovora servera
    responsePoruka: string = null;

    constructor(
      private loginService: LoginService,
      //Dohvaćam router klasu da se mogu preusmjeriti
      private router: Router
    ) 
    {}
    
    //Kada se komponenta loada
    ngOnInit(){
        //Kreiram formu
        this.forma = new FormGroup({
            'email': new FormControl(null,[Validators.required,Validators.email],[Validacija.provjeriEmail(this.loginService,this.pretplateSubject)]),
            'password': new FormControl(null,[Validators.required])
        });
        this.password.setAsyncValidators([Validacija.provjeriLozinku(this.loginService,this.forma,this.pretplateSubject)]); 
    }

    //Kada se klikne button "Login"
    onSubmit(){
      //Ako forma nije valjana
      if(!this.forma.valid){
        return;
      }

      this.loginService.login(this.email.value,this.password.value).pipe(
          tap((response) => {
              //Ako je korisnik uspješno prijavljen
              if(response["success"] == "true"){
                  //Ako je tip korisnika "Medicinska sestra":
                  if(response["tip"] == "sestra"){
                      //Pozivam metodu koja handlea login
                      this.loginService.handleLogin(this.email.value,this.password.value,response["token"],response["tip"],response["expiresIn"]);
                      //Preusmjeri medicinsku sestru na njezinu stranicu
                      this.router.navigate(['/med-sestra/obrada/opciPodatci']); 
                  }
                  //Ako je tip korisnika "Liječnik":
                  else if(response["tip"] == "lijecnik"){
                      //Pozivam metodu koja handlea login
                      this.loginService.handleLogin(this.email.value,this.password.value,response["token"],response["tip"],response["expiresIn"]);
                      //Preusmjeri liječnika na njegovu stranicu
                      this.router.navigate(['/lijecnik/obrada/povijestBolesti']);
                  }
              }
              else{
                  //Označavam da postoji negativni odgovor servera
                  this.response = true;
                  //Odgovor servera spremam u varijablu "responsePoruka"
                  this.responsePoruka = response["message"];
              }
          
          }),
          takeUntil(this.pretplateSubject)
      ).subscribe();
    }

    //Metoda koja zatvara prozor poruke
    onClose(){
      this.response = false;
    }

    //Ova metoda se pokreće kad se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

    get email(): FormControl{
        return this.forma.get('email') as FormControl;
    }
    get password(): FormControl{
        return this.forma.get('password') as FormControl;
    }
}
