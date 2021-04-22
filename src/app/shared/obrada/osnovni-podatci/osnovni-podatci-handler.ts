import { FormControl, FormGroup, ValidatorFn } from "@angular/forms";
import { BracnoStanje } from "../../modeli/bracnoStanje.model";
import { Mjesto } from "../../modeli/mjesto.model";
import { RadniStatus } from "../../modeli/radniStatus.model";
import { StatusPacijent } from "../../modeli/statusPacijent.model";

//Metoda koja automatski upisuje pbr na osnovu naziva mjesta
export function nazivMjestoToPbr(forma: FormGroup, mjesta: Mjesto[], value: string){
    for(const mjesto of mjesta){
        if(value === mjesto.nazivMjesto){
            forma.get('pbr').patchValue(mjesto.pbrMjesto,{emitEvent: false});
        }
    }
    forma.get('pbr').updateValueAndValidity({emitEvent: false});
}

//Metoda koja automatski upisuje naziv mjesta koji odgovara upisanom poštanskom broju
export function pbrToNazivMjesto(value: number, mjesta: Mjesto[], forma: FormGroup){
    //Prolazim kroz polje sa poštanskim brojevima i nazivima mjesta
    for(let pbr of mjesta){
      //Ako je vrijednost polja poštanskog broja jednaka vrijednost poštanskog broja u polju
      if(value === pbr["pbrMjesto"]){
        //Postavi naziv mjesta na naziv koji odgovora tom poštanskom broju
        forma.get('mjesto').patchValue(pbr["nazivMjesto"], {emitEvent: false});
      }
    }
    forma.get('mjesto').updateValueAndValidity();
  }

//Metoda koja provjerava je li mjesto ispravno uneseno tj. je li unesena vrijednost koja nije dio polja mjesta
export function isValidMjesto(mjesta: Mjesto[]): ValidatorFn {
    return (control: FormControl): {[key: string]: boolean} | null => {
        const mjesto = mjesta.find(element => element.nazivMjesto === control.value);
        //Ako vrijednost mjesta koje je korisnik unio nije dio polja naziva mjesta (znači vraća -1 ako nije dio polja)
        if(!mjesto){
            return {'mjestaIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
  }
}
//Metoda koja provjerava je li bračno stanje ispravno uneseno tj. je li unesena vrijednost koja nije dio polja bračnog stanja
export function isValidBracnoStanje(bracnaStanja: BracnoStanje[]): ValidatorFn {
    return (control: FormControl): {[key: string]: boolean} | null => {
        const bracnoStanje = bracnaStanja.find(element => element.nazivBracnoStanje === control.value);
        //Ako vrijednost bračnog stanja koje je korisnik unio nije dio polja naziva bračnih stanja (znači vraća -1 ako nije dio polja)
        if(!bracnoStanje){
            return {'bracnaStanjaIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
    }
}
//Metoda koja provjerava je li radni status ispravno unesen tj. je li unesena vrijednost koja nije dio polja radnih statusa
export function isValidRadniStatus(radniStatusi: RadniStatus[]): ValidatorFn {
    return (control: FormControl): {[key: string]: boolean} | null => {
        const radniStatus = radniStatusi.find(element => element.nazivRadniStatus === control.value);
        //Ako vrijednost radnog statusa koje je korisnik unio nije dio polja naziva radnih statusa (znači vraća -1 ako nije dio polja)
        if(!radniStatus){
            return {'radniStatusIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
    }
}
//Metoda koja provjerava je li status pacijenta ispravno unesen tj. je li unesena vrijednost koja nije dio polja statusa pacijenata
export function isValidStatusPacijent(statusiPacijenta: StatusPacijent[]): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        const statusPacijent = statusiPacijenta.find(element => element.nazivStatusPacijent === control.value);
        //Ako vrijednost statusa pacijenta koje je korisnik unio nije dio polja naziva statusa pacijenata (znači vraća -1 ako nije dio polja)
        if(!statusPacijent){
            return {'statusPacijentIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
    }
}
//Metoda koja provjerava je li poštanski broj mjesta ispravno unesen tj. je li unesena vrijednost koja nije dio polja poštanskih brojeva
export function isValidPostanskiBroj(mjesta: Mjesto[]): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        const pbr = mjesta.find(element => element.pbrMjesto === control.value);
        //Ako vrijednost poštanskog broja koje je korisnik unio nije dio polja poštanskih brojeva (znači vraća -1 ako nije dio polja)
        if(!pbr){
            return {'pbrIsForbidden': true};
        }
        //Ako je vrijednost naziva mjesta ok, vraćam null
        return null;
    }
}
//Metoda koja provjerava točnost kombinacije poštanskog broja i naziva mjesta
export function isValidKombinacija(mjesta: Mjesto[]): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        //Prolazim kroz polje mjesta
        for(let mjesto of mjesta){
            //Ako je uneseni poštanski broj jednak onome u polju
            if(group.get('pbr').value === mjesto["pbrMjesto"]){
                //Ako uneseni naziv mjesta nije jednak nazivu mjesta za taj poštanski broj
                if(group.get('mjesto').value !== mjesto["nazivMjesto"]){
                    return {'krivaKombinacija': true};
                }
            }
        }
        //Ako je kombinacija u redu, vraća null
        return null;
    }
}
//Metoda koja provjerava je li ime i prezime ispravno uneseno
export function  validacijaImePrezime(abeceda: string[]): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        //Ako se vrijednost polja imena ili prezimena ne nalazi u polju abecede
        for(let i in control.value){
            if(abeceda.indexOf(control.value.charAt(i)) === -1){
                return {'neispravanZnak':true};
            }
        }
        return null;
    }
}
