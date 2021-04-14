import { FormControl, FormGroup, ValidatorFn } from "@angular/forms";
import { DrzavaOsiguranja } from "src/app/shared/modeli/drzavaOsiguranja.model";
import { KategorijaOsiguranja } from "src/app/shared/modeli/kategorijaOsiguranja.model";
import { Pacijent } from "src/app/shared/modeli/pacijent.model";
import { PodrucniUred } from "src/app/shared/modeli/podrucniUred.model";

//Metoda koja INICIJALNO postavlja da bude required jedan od tipova slučaja
export function atLeastOneRequiredTipSlucaj() : ValidatorFn {
    return (group: FormGroup): {[s:string ]: boolean} | null => {
        if (group) {
          if(group.controls['noviSlucaj'].value || group.controls['povezanSlucaj'].value) {
              return null;
          }
        }
        return {'baremJedanTipSlucaj': true};
    }
}

//Metoda koja provjerava je li uneseni MBO jednak MBO-u koji ima trenutno aktivni pacijent
export function isValidMBO(pacijent: Pacijent): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        //Ako uneseni MBO pacijenta nije jednak MBO-u pacijenta koji je trenutno aktivan u obradi
        if(control.value !== pacijent.mbo){
            return {'nePostojiMBO':true};
        }
        return null;
    }
}

//Metoda koja provjerava je li uneseni BROJ ISKAZNICE DOPUNSKOG OSIGURANJA jednak BROJU koji ima trenutno aktivni pacijent
export function isValidDopunsko(pacijent: Pacijent): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        //Ako uneseni broj iskaznice  NIJE JEDNAK broju koji ima trenutno aktivni pacijent
        if(control.value !== pacijent.brIskDopunsko){
            return {'nePostojiBrojDopunsko':true};
        }
        return null;
    }
}

//Metoda koja provjerava je li država osiguranja ispravno unesena tj. je li unesena vrijednost koja nije dio polja država osiguranja
export function isValidDrzavaOsiguranja(drzave: DrzavaOsiguranja[]): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        //Vraća vrijednost prvog elementa u polju koji zadovoljava traženi uvjet
        const isNaziv = drzave.find(element => {
            return element.nazivDrzave === control.value;
        });
        //Ako find() nije našao u polju unesenu vrijednost
        if(!isNaziv){
            return {'drzaveIsForbidden': true};
        }
        //Ako je našao unesenu vrijednost
        else{
            return null;
        }
    }
}

//Metoda koja provjerava je li kategorija osiguranja ispravno unesena tj. je li unesena vrijednost koja nije dio polja kategorija osiguranja
export function isValidKategorijaOsiguranja(katOsiguranja: KategorijaOsiguranja[]): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        const isOpis = katOsiguranja.find(element => {
            return element.opisOsiguranika === control.value;
        });
        if(!isOpis){
            return {'opisIsForbidden': true};
        }
        else{
            return null;
        }
    }
}
//Metoda koja provjerava je li područni ured ispravno unesen tj. je li unesena vrijednost koja nije dio polja područnih ureda
export function isValidPodrucniUred(podrucniUredi: PodrucniUred[]): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        const isNaziv = podrucniUredi.find(element => {
          return element.nazivSluzbe === control.value;
        });
        if(!isNaziv){
            return {'uredIsForbidden': true};
        }
        else{
            return null;
        }
    }
}
