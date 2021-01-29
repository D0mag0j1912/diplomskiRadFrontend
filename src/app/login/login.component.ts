import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { LoginService } from './login.service';

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
    }

    //Kada se klikne button "Login"
    onSubmit(form: NgForm){
      //Ako forma nije valjana
      if(!form.valid){
        return;
      }

      this.loginService.login(form.value.email,form.value.lozinka).pipe(
          takeUntil(this.pretplateSubject),
          tap((response) => {
              //Ako je korisnik uspješno prijavljen
              if(response["success"] == "true"){
                //Ako je tip korisnika "Medicinska sestra":
                if(response["tip"] == "sestra"){
                    //Pozivam metodu koja handlea login
                    this.loginService.handleLogin(form.value.email,form.value.lozinka,response["token"],response["tip"],response["expiresIn"]);
                    //Preusmjeri medicinsku sestru na njezinu stranicu
                    this.router.navigate(['/med-sestra/obrada/opciPodatci']); 
                }
                //Ako je tip korisnika "Liječnik":
                else if(response["tip"] == "lijecnik"){
                    //Pozivam metodu koja handlea login
                    this.loginService.handleLogin(form.value.email,form.value.lozinka,response["token"],response["tip"],response["expiresIn"]);
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
          
          })
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
}
