import { AbstractControl, FormGroup } from "@angular/forms";
import { forkJoin, Observable, of, Subject } from "rxjs";
import { tap, takeUntil, switchMap } from "rxjs/operators";
import {ReceptService} from './recept.service';
import * as Validacija from './recept-validations';

//Funkcija koja vraća Observable u kojemu se nalazi MAKSIMALNA doza nekog lijeka (dnevna/tjedna)
export function dohvatiDefiniranaDoza(forma: AbstractControl, receptService: ReceptService): Observable<any>{
    //Inicijaliziram dozu i lijek
    let doza: string;
    let lijek: string;
    //Dohvaćam unesenu dozu lijeka
    if(forma.get('doziranje.doziranjeFrekvencija').value && forma.get('doziranje.doziranjeFrekvencija').valid){
        //Formiram doziranje
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
    //Ako su popunjeni unosi lijeka i doziranja lijeka:
    if(lijek && doza){
        //Vraćam Observable u kojemu se nalazi maksimalna doza
        return receptService.getMaksimalnaDoza(lijek,doza);
    }
    //Ako NISU popunjeni unosi lijeka i doziranja lijeka, vrati null
    else{
        return of(null);
    }
}

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
//Funkcija koja vraća Observable ažuriranja dostatnosti te koja ažurira potrebna polja
export function azuriranjeDostatnostiHandler(forma: FormGroup,receptService: ReceptService,
                                            pretplateSubject: Subject<boolean>,trajanjeTerapije: number) : Observable<any>{
    return forkJoin([
        azuriranjeDostatnosti(forma,receptService)
    ]).pipe(
        tap(value => {
            //Vrijednost dostatnosti stavljam u polje
            forma.get('trajanje.dostatnost').patchValue(value[0] === null ? value[0] : value[0].toString(),{emitEvent: false});
        }),
        //Svaku vrijednost dostatnosti prosljeđujem funkciji koja izvodi DATUM od te DOSTATNOSTI
        switchMap(value => {
            console.log(value);
            //Ako vrijednost dostatnosti nije null
            if(value[0] !== null){
                return receptService.getDatumDostatnost(value[0].toString()).pipe(
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
                    //Računam trajanje terapije
                    trajanjeTerapije = trajanjeTerapije * (+forma.get('ostaliPodatci.brojPonavljanja').value + 1);
                }
                return of(null).pipe(
                    tap(value => {
                        //Postavi dostatnost inicijalno na 30 dana
                        forma.get('trajanje.dostatnost').patchValue(trajanjeTerapije.toString(),{emitEvent: false});
                    }),
                    //Kada server vrati null za dostatnost, pozovi funkciju koja ažurira datum "vrijediDo"
                    switchMap(value => {
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

//Funkcija koja dohvaća informaciju je li trenutno doziranje prešlo dnevno definiranu dozu
export function doziranjePresloDDD(forma: FormGroup, receptService: ReceptService): Observable<any>{
    return dohvatiDefiniranaDoza(forma,receptService).pipe(
        tap(value => {
            //Ako server nije vratio null za prekoračenje doze (vratio je null ako lijek ne završava na mg ili g)
            if(value !== null){
                //Ako je server vratio da je doziranje prekoračilo dnevno definiranu dozu
                if(value["success"] === "false"){
                    //U polje unosa definirane doze postavljam vrijednost sa servera
                    forma.get('doziranje').get('dddLijek').patchValue(value["maxDoza"],{emitEvent: false});
                    //Pozivam validator za prekoračenje doze
                    forma.get('doziranje').setValidators(Validacija.prekoracenjeDoze(value));
                    forma.get('doziranje').updateValueAndValidity({emitEvent: false});
                }
            }
            //Ako je server vratio null ILI je vratio da je success === true, tj. da doziranje ne prelazi dnevno definiranu dozu
            if(value === null || value["success"] === "true"){
                //Praznim polje unosa DDD-a 
                forma.get('doziranje').get('dddLijek').patchValue(null,{emitEvent: false});
                //Resetiram vrijednosti svjesnog prekoračenja
                forma.get('svjesnoPrekoracenje').reset();
                //Dižem validatore koji su vezani za DDD
                forma.get('doziranje').clearValidators();
                forma.get('doziranje').updateValueAndValidity({emitEvent: false});
            }
        })
    );
}
