import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup,Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { LoginService } from './login.service';
import * as Validacija from './login-validations';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../shared/dialog/dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Definiram formu
    forma: FormGroup;

    constructor(
        //Dohvaćam login servis
        private loginService: LoginService,
        //Dohvaćam router klasu da se mogu preusmjeriti
        private router: Router,
        //Dohvaćam dialog servis
        private dialog: MatDialog
    ){}

    //Kada se komponenta loada
    ngOnInit(){
        //Kreiram formu
        this.forma = new FormGroup({
            'email': new FormControl(null,
                //Obični validatori
                [Validators.required,Validators.email],
                //Async validatori
                [Validacija.provjeriEmail(this.loginService,this.pretplateSubject)]),
            'password': new FormControl(null)
        });
        //Inicijalno postavljam validatore za polje lozinke
        this.password.setValidators(Validators.required);
        this.password.setAsyncValidators(Validacija.provjeriLozinku(this.loginService,this.forma, this.pretplateSubject));
        this.password.updateValueAndValidity({emitEvent: false});
        //Pretplaćujem se na promjene u email-u te postavljam ponovno validatore lozinke
        this.email.valueChanges.pipe(
            debounceTime(100),
            distinctUntilChanged(),
            tap(() => {
                this.password.setValidators(Validators.required);
                this.password.setAsyncValidators(Validacija.provjeriLozinku(this.loginService,this.forma, this.pretplateSubject));
                this.password.updateValueAndValidity({emitEvent: false});
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
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
                    //Otvaram dialog
                    this.dialog.open(DialogComponent, {data: {message: response['message']}});
                }

            })
        ).subscribe();
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
