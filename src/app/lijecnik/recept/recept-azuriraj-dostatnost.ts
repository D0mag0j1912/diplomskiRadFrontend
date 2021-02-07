import { AbstractControl, FormGroup } from "@angular/forms";
import { Observable, of, Subject } from "rxjs";
import { tap, concatMap, takeUntil, switchMap } from "rxjs/operators";
import {ReceptService} from './recept.service';

//Funkcija koja vraća Observable u kojemu se nalazi dostatnost u danima
export function azuriranjeDostatnosti(forma: AbstractControl,receptService: ReceptService): Observable<any>{
    //Dohvaćam količinu
    let kolicina: string = forma.get('kolicina.kolicinaDropdown').value;
    //Inicijaliziram dozu i lijek
    let doza: string;
    let lijek: string;
    //Dohvaćam broj ponavljanja lijeka
    let brojPonavljanja: string = forma.get('ostaliPodatci.brojPonavljanja').value;
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
        //Vraćam Observable u kojemu se nalazi dostatnost u danima
        return receptService.getDostatnost(lijek,kolicina,doza,brojPonavljanja);
    }
    //Ako NISU popunjeni unosi lijeka, količine lijeka i doziranja lijeka, vrati null
    else{
        return of(null);
    }
}

export function azuriranjeDostatnostiHandler(forma: FormGroup,receptService: ReceptService,
                                            pretplateSubject: Subject<boolean>,trajanjeTerapije: number) : Observable<any>{
    return azuriranjeDostatnosti(forma,receptService).pipe(
        tap(value => {
            //Vrijednost dostatnosti stavljam u polje
            forma.get('trajanje.dostatnost').patchValue(value === null ? value : value.toString(),{emitEvent: false});
        }),
        //Svaku vrijednost dostatnosti prosljeđujem funkciji koja izvodi DATUM od te DOSTATNOSTI
        switchMap(value => {
            //Ako vrijednost dostatnosti nije null
            if(value !== null){
                return receptService.getDatumDostatnost(value.toString()).pipe(
                    tap(datum => {
                        //Vrijednost datuma postavljam u njegovo polje
                        forma.get('trajanje.vrijediDo').patchValue(datum,{emitEvent: false});
                    }),
                    takeUntil(pretplateSubject)
                );
            }
            //Ako je dostatnost null (uključuje da je odabran mag.pripravak ili je prazno doziranje, lijek ili količina)
            else{
                //Ponovno postavljam trajanje terapije na 30 dana
                trajanjeTerapije = 30;
                //Ako je postavljen broj ponavljanja
                if(forma.get('ostaliPodatci.brojPonavljanja').value){
                    trajanjeTerapije = trajanjeTerapije * (+forma.get('ostaliPodatci.brojPonavljanja').value + 1);
                }
                return of(null).pipe(
                    tap(value => {
                        //Postavi dostatnost inicijalno na 30 dana
                        forma.get('trajanje.dostatnost').patchValue(trajanjeTerapije.toString(),{emitEvent: false});
                    }),
                    //Kada server vrati null za dostatnost, pozovi funkciju koja ažurira datum "vrijediDo"
                    concatMap(value => {
                        return receptService.getDatumDostatnost(trajanjeTerapije.toString()).pipe(
                            tap(datum => {
                                //Postavi datum
                                forma.get('trajanje.vrijediDo').patchValue(datum,{emitEvent: false});
                            }),
                            takeUntil(pretplateSubject)
                        );
                    }),
                    takeUntil(pretplateSubject)
                );
            }
        }),
        takeUntil(pretplateSubject)
    )
}
