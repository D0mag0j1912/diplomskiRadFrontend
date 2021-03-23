//VALIDACIJE

import { FormControl, FormGroup, ValidatorFn } from "@angular/forms";
import { PodrucniUred } from "../../modeli/podrucniUred.model";

//Metoda koja provjerava je li država osiguranja ispravno unesena tj. je li unesena vrijednost koja nije dio polja država osiguranja
export function isValidDrzavaOsiguranja(naziviDrzava: string[]): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        //Ako vrijednost države osiguranja koje je korisnik unio nije dio polja država osiguranja (znači vraća -1 ako nije dio polja)
        if(naziviDrzava.indexOf(control.value) === -1){
            return {'drzaveIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
    }
}
//Metoda koja provjerava je li kategorija osiguranja ispravno unesena tj. je li unesena vrijednost koja nije dio polja kategorija osiguranja
export function isValidKategorijaOsiguranja(oznakeOsiguranika: string[]): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        //Ako vrijednost kategorije osiguranja koje je korisnik unio nije dio polja kategorija osiguranja (znači vraća -1 ako nije dio polja)
        if(oznakeOsiguranika.indexOf(control.value) === -1){
            return {'oznakaIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
    }
}
//Metoda koja provjerava je li područni ured ispravno unesen tj. je li unesena vrijednost koja nije dio polja područnih ureda
export function isValidPodrucniUred(naziviSluzbi: string[]): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        //Ako vrijednost područnog ureda koje je korisnik unio nije dio polja područnih ureda (znači vraća -1 ako nije dio polja)
        if(naziviSluzbi.indexOf(control.value) === -1){
            return {'uredIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
    }
}
//Metoda koja provjerava je li participacija ispravno unesena tj. je li unesena vrijednost koja nije dio polja participacije
export function isValidParticipacija(razloziParticipacije: string[]): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        //Ako vrijednost članka participacije koje je korisnik unio nije dio polja članka participacija (znači vraća -1 ako nije dio polja)
        if(razloziParticipacije.indexOf(control.value) === -1){
            return {'participacijaIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
    }
}
//Metoda koja provjerava ispravnost početnog i završnog datuma osnovnog osiguranja
export function isValidDatumiOsnovno(): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if (group) {
            if(group.controls['osnovnoOd'].value <= group.controls['osnovnoDo'].value) {
                return null;
            }
        }
        return {'neValjaDatumOsnovno': true};
    }
}
//Metoda koja provjerava ispravnost početnog i završnog datuma dopunskog osiguranja
export function isValidDatumiDopunsko(): ValidatorFn {
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if (group) {
            if(group.controls['dopunskoOd'].value <= group.controls['dopunskoDo'].value) {
                return null;
            }
        }
        return {'neValjaDatumDopunsko': true};
    }
} 
//Metoda koja provjerava jesu li uneseni ILI trajna participacija ILI datum participacije AKO JE OSLOBOĐEN PARTICIPACIJA CHECKED
export function atLeastOneRequiredParticipacija(): ValidatorFn {
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if (group) {
            //Ako su trajna participacija ILI datum participacijaDo UPISANI, a oslobođen participacije je CHECKED, NEMOJ PRIKAZATI ERROR
            if((group.get('participacija.trajnoParticipacija').value || group.get('participacija.participacijaDo').value)  
                && group.get('oslobodenParticipacije').value) {
                    return null;
            }
        }
        return {'baremJedan': true};
    }
}
//Metoda koja provjerava jesu li uneseni I trajno osnovno I datumi osnovnog osiguranja, jer je to zabranjeno
export function bothForbiddenOsnovno(): ValidatorFn {
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if(group){
            //Ako je trajno osiguranje CHECKED i upisani su ILI datum početka osnovnog osiguranja ILI datum završetka osnovnog osiguranja, PRIKAŽI ERROR
            if(group.get('trajnoOsnovno').value && (group.get('datumiOsnovno.osnovnoOd').value || group.get('datumiOsnovno.osnovnoDo').value)){
                return {'bothForbiddenOsnovno': true};
            }
        }
        return null;
    }
}
//Metoda koja provjerava jesu li uneseni I trajna participacija I datum participacije do, jer je to zabranjeno
export function bothForbiddenParticipacija(): ValidatorFn {
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if(group){
            //Ako je trajna participacija CHECKED I datum participacija do JE UNESEN, PRIKAŽI ERROR
            if(group.controls['trajnoParticipacija'].value && group.controls['participacijaDo'].value){
                return {'bothForbidden': true};
            }
        }
        return null;
    }
}
//Metoda koja provjerava jesu li uneseni dijelovi participacije, AKO "OSLOBOĐEN PARTICIPACIJE" NIJE CHECKED
export function mustOslobodenParticipacija(): ValidatorFn {
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if(group){
            //Ako je unesen jedan od dijelova participacije, a oslobođen participacije nije checked
            if((group.get("participacija.clanakParticipacija").value || group.get("participacija.trajnoParticipacija").value 
                || group.get("participacija.participacijaDo").value) && group.get("oslobodenParticipacije").value === null){
                    return {"mustBeCheckedParticipacija":true};
            }
        }
        return null;
    }
}
//Metoda koja INICIJALNO postavlja required trajno osiguranje ili datume osnovnog osiguranja
export function atLeastOneRequiredOsnovno(): ValidatorFn {
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if (group) {
            if(group.controls['trajnoOsnovno'].value || 
                (group.get('datumiOsnovno.osnovnoOd').value && 
                group.get('datumiOsnovno.osnovnoDo').value)) {
                return null;
            }
        }
        return {'baremJedanOsnovno': true};
    }
}
//Metoda koja automatski upisuje šifru područnog ureda na osnovu upisanog naziva službe
export function nazivSluzbeToSif(value: string, forma: FormGroup, podrucniUredi: PodrucniUred[]){
    //Prolazim kroz polje područnih ureda
    for(let ured of podrucniUredi){
      //Ako je vrijednost polja naziva službe područnog ureda jednaka vrijednosti naziva službe područnog ureda u polju
      if(value === ured["nazivSluzbe"]){
            //Postavi šifru područnog ureda na onu šifru koja odgovara upisanom nazivu službe
            forma.get('sifUred').patchValue(ured["sifUred"], {emitEvent: false});
      }
    }
    forma.get('sifUred').updateValueAndValidity({emitEvent: false}); 
}