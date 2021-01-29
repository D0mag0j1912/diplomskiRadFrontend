import { AbstractControl, FormGroup } from "@angular/forms";
import { of, Subject } from "rxjs";
import { concatMap, takeUntil, tap } from "rxjs/operators";
import {ReceptService} from './recept.service';

//Funkcija koja prati promjene u polju unosa frekvencije doziranja
export function promjenaFormeDoziranje(forma: AbstractControl,pretplateSubject: Subject<any>,cijelaForma: AbstractControl,receptService: ReceptService){
    forma.valueChanges.pipe(
        takeUntil(pretplateSubject),
        tap(value => {
            console.log(value);
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
        }),
        concatMap(value => {
            let lijek;
            let doza;
            //Dohvaćam uneseni lijek
            if(cijelaForma.get('osnovnaListaLijek.osnovnaListaLijekDropdown').value){
                lijek = cijelaForma.get('osnovnaListaLijek.osnovnaListaLijekDropdown').value;
            }
            else if(cijelaForma.get('osnovnaListaLijek.osnovnaListaLijekText').value){
                lijek = cijelaForma.get('osnovnaListaLijek.osnovnaListaLijekText').value;
            }
            else if(cijelaForma.get('dopunskaListaLijek.dopunskaListaLijekDropdown').value){
                lijek = cijelaForma.get('dopunskaListaLijek.dopunskaListaLijekDropdown').value;
            }
            else if(cijelaForma.get('dopunskaListaLijek.dopunskaListaLijekText').value){
                lijek = cijelaForma.get('dopunskaListaLijek.dopunskaListaLijekText').value;
            }
            //Dohvaćam unesenu dozu lijeka
            if(forma.get('doziranjeFrekvencija').value && forma.get('doziranjeFrekvencija').valid){
                doza = forma.get('doziranjeFrekvencija').value + "x" + forma.get('doziranjePeriod').value;
            }

            //Ako su popunjeni unosi lijeka, količine lijeka i doziranja lijeka:
            if(lijek && doza && cijelaForma.get('kolicina.kolicinaDropdown').value){
                return receptService.getDostatnost(lijek,cijelaForma.get('kolicina.kolicinaDropdown').value,doza).pipe(
                    takeUntil(pretplateSubject),
                    tap(odgovor => {
                        console.log(odgovor);
                    })
                );
            }
            console.log(lijek);
            //Ako NISU popunjeni unosi lijeka, količine lijeka i doziranja lijeka, vrati null
            return of(null);
        })
    ).subscribe();
}