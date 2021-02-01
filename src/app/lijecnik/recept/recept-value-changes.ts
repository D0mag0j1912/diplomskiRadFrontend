import { AbstractControl } from "@angular/forms";
import { Observable, of, Subject } from "rxjs";
import { concatMap, takeUntil, tap } from "rxjs/operators";
import {ReceptService} from './recept.service';

//Funkcija koja prima PROIZVOD te za svaku promjenu proizvoda, ažurira DOSTATNOST
export function promjenaDostatnostiLijek(forma: AbstractControl,receptService: ReceptService,pretplateSubject: Subject<boolean>): Observable<any>{
    //Dohvaćam količinu
    let kolicina: string = forma.get('kolicina.kolicinaDropdown').value;
    //Inicijaliziram dozu i lijek
    let doza: string;
    let lijek: string;
    //Dohvaćam unesenu dozu lijeka
    if(forma.get('doziranje.doziranjeFrekvencija').value && forma.get('doziranje.doziranjeFrekvencija').valid){
        doza = forma.get('doziranje.doziranjeFrekvencija').value + "x" + forma.get('doziranje.doziranjePeriod').value;
    }
    //Dohvaćam uneseni lijek
    if(forma.get('osnovnaListaLijek.osnovnaListaLijekDropdown').value){
        lijek = forma.get('osnovnaListaLijek.osnovnaListaLijekDropdown').value;
    }
    else if(forma.get('osnovnaListaLijek.osnovnaListaLijekText').value){
        lijek = forma.get('osnovnaListaLijek.osnovnaListaLijekText').value;
    }
    else if(forma.get('dopunskaListaLijek.dopunskaListaLijekDropdown').value){
        lijek = forma.get('dopunskaListaLijek.dopunskaListaLijekDropdown').value;
    }
    else if(forma.get('dopunskaListaLijek.dopunskaListaLijekText').value){
        lijek = forma.get('dopunskaListaLijek.dopunskaListaLijekText').value;
    }
    //Ako su popunjeni unosi lijeka, količine lijeka i doziranja lijeka:
    if(lijek && doza && kolicina){
        return receptService.getDostatnost(lijek,kolicina,doza).pipe(
            tap(odgovor => {
                console.log(odgovor);
            }),
            takeUntil(pretplateSubject)
        );
    }
    //Ako NISU popunjeni unosi lijeka, količine lijeka i doziranja lijeka, vrati null
    else{
        //Polje dostatnosti i polje datuma stavljam na null
        forma.get('trajanje.dostatnost').patchValue(null,{onlySelf: true,emitEvent: false});
        forma.get('trajanje.vrijediDo').patchValue(null,{onlySelf: true,emitEvent: false});
        return of(null);
    }
}

//Funkcija koja prati promjene u polju unosa frekvencije doziranja
export function promjenaFormeDoziranje(forma: AbstractControl,pretplateSubject: Subject<any>,cijelaForma: AbstractControl,receptService: ReceptService){
    forma.valueChanges.pipe(
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
            //Dohvaćam količinu
            let kolicina: string = cijelaForma.get('kolicina.kolicinaDropdown').value;
            let lijek;
            let doza;
            //Dohvaćam uneseni proizvod
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
            if(lijek && doza && kolicina){
                return receptService.getDostatnost(lijek,kolicina,doza).pipe(
                    concatMap(dostatnost => {
                        //Ako server nije vratio null za dostatnost
                        if(dostatnost !== null){
                            //U polje dostatnosti postavljam izračunatu dostatnost
                            cijelaForma.get('trajanje.dostatnost').patchValue(dostatnost,{onlySelf: true, emitEvent: false});
                            return receptService.getDatumDostatnost(dostatnost.toString()).pipe(
                                tap(datum => {
                                    //Dohvaćeni datum postavi u njegovo polje "Vrijedi do:"
                                    cijelaForma.get('trajanje.vrijediDo').patchValue(datum,{onlySelf: true, emitEvent: false});
                                }),
                                takeUntil(pretplateSubject)
                            );
                        }
                        else{
                            return of(null);
                        }
                    }),
                    takeUntil(pretplateSubject)
                );
            }
            //Ako NISU popunjeni unosi lijeka, količine lijeka i doziranja lijeka, vrati null
            else{
                //Polje dostatnosti i polje datuma stavljam na null
                cijelaForma.get('trajanje.dostatnost').patchValue(null,{onlySelf: true,emitEvent: false});
                cijelaForma.get('trajanje.vrijediDo').patchValue(null,{onlySelf: true,emitEvent: false});
                return of(null);
            }
        }),
        takeUntil(pretplateSubject)
    ).subscribe();
}