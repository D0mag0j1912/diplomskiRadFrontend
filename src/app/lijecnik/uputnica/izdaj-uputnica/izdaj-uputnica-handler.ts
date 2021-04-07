import { FormGroup } from "@angular/forms";
import { ZdravstvenaDjelatnost } from "src/app/shared/modeli/zdravstvenaDjelatnost.model";

//Funkcija koja popunjava polje ŠIFRE ZDR. DJELATNOSTI na osnovu unesenog naziva
export function nazivZdrDjelToSif(
    forma: FormGroup,
    zdrDjelatnosti: ZdravstvenaDjelatnost[],
    uneseniNaziv: string){
    //Prolazim kroz sve zdravstvene djelatnosti
    for(const zdrDjel of zdrDjelatnosti){
        //Ako se pronađe vrijednost naziva zdravstvene djelatnosti u polju
        if(zdrDjel.nazivDjelatnosti === uneseniNaziv){
            //U polje šifre djelatnosti postavljam šifru koja odgovara unesenom nazivu
            forma.get('zdravstvenaDjelatnost.sifZdrDjel').patchValue(zdrDjel.sifDjelatnosti, {emitEvent: false});
        }
    }
}

//Funkcija koja popunjava polje NAZIVA ZDR. DJELATNOSTI na osnovu unesenog naziva
export function sifraZdrDjelToNaziv(
    forma: FormGroup,
    zdrDjelatnosti: ZdravstvenaDjelatnost[],
    unesenaSifra: string){
    //Prolazim kroz sve zdravstvene djelatnosti
    for(const zdrDjel of zdrDjelatnosti){
        //Ako se pronađe vrijednost šifre zdravstvene djelatnosti u polju
        if(zdrDjel.sifDjelatnosti.toString() === unesenaSifra){
            //U polje naziva djelatnosti postavljam naziv koja odgovara unesenoj šifri
            forma.get('zdravstvenaDjelatnost.nazivZdrDjel').patchValue(zdrDjel.nazivDjelatnosti, {emitEvent: false});
        }
    }
}
