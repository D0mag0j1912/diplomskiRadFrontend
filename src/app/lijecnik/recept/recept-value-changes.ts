import { AbstractControl } from "@angular/forms";
import { Observable, of } from "rxjs";
import {ReceptService} from './recept.service';

//Funkcija koja vraća Observable u kojemu se nalazi dostatnost u danima
export function azuriranjeDostatnosti(forma: AbstractControl,receptService: ReceptService): Observable<any>{
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
        //Vraćam Observable u kojemu se nalazi dostatnost u danima
        return receptService.getDostatnost(lijek,kolicina,doza);
    }
    //Ako NISU popunjeni unosi lijeka, količine lijeka i doziranja lijeka, vrati null
    else{
        //Polje dostatnosti i polje datuma stavljam na null
        forma.get('trajanje.dostatnost').patchValue(null,{onlySelf: true,emitEvent: false});
        forma.get('trajanje.vrijediDo').patchValue(null,{onlySelf: true,emitEvent: false});
        return of(null);
    }
}
