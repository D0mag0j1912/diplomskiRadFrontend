import { AbstractControl, AsyncValidatorFn, FormGroup } from "@angular/forms";
import { of, Subject, timer } from "rxjs";
import { map, switchMap, takeUntil } from "rxjs/operators";
import { LoginService } from "./login.service";


//Funkcija koja provjerava unos lozinke
export function provjeriLozinku(loginService: LoginService, 
                                forma: FormGroup,pretplateSubject: Subject<boolean>): AsyncValidatorFn{
    return (control: AbstractControl) => {
        return timer(350).pipe(
            switchMap(() => {
                if(!control.value){
                    return of(null);
                }
                return loginService.getLozinka(forma.get('email').value,control.value).pipe(
                    map(response => {
                        if(response["success"] === "false"){
                            return {'neispravnaLozinka': true};
                        }
                        else{
                            return null;
                        }
                    }),
                    takeUntil(pretplateSubject)
                );
            })
        );
    }
}

//Funkcija koja provjerava unos emaila
export function provjeriEmail(loginService: LoginService,pretplateSubject: Subject<boolean>): AsyncValidatorFn {
    return (control: AbstractControl) => {
        return timer(350).pipe(
            switchMap(() => {
                if(!control.value){
                    return of(null);
                }
                return loginService.getAllEmails().pipe(
                    map(emails => {
                        //Ako se upisani email nalazi u registriranim emailovima
                        if(emails.indexOf(control.value) !== -1){
                            //Vrati da je u redu
                            return null;
                        }
                        //Ako upisani email ne postoji
                        else{
                            return {'neispravanEmail': true};
                        }
                    }),
                    takeUntil(pretplateSubject)
                );
            })
        );
    }
}