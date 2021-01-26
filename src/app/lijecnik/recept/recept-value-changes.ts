import { AbstractControl, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";

//Funkcija koja prati promjene u polju unosa frekvencije doziranja
export function promjenaFormeDoziranje(forma: AbstractControl,pretplateSubject: Subject<any>){
    forma.valueChanges.pipe(
        takeUntil(pretplateSubject),
        tap(value => {
            //Ako polje frekvencije doziranja ima neku ispravnu vrijednost
            if(forma.get('doziranjeFrekvencija').valid && forma.get('doziranjeFrekvencija').value){
                //Omogući unos perioda doziranja
                forma.get('doziranjePeriod').enable({onlySelf: true, emitEvent: false});
            }
            //Ako polje frekvencija doziranja NEMA neku ispravnu vrijednost
            else{
                //Onemogući unos perioda doziranja
                forma.get('doziranjePeriod').disable({onlySelf: true, emitEvent: false});
            }
        })
    ).subscribe();
}