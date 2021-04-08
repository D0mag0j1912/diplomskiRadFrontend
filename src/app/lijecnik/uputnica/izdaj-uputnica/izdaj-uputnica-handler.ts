import { FormGroup } from "@angular/forms";
import { ZdravstvenaDjelatnost } from "src/app/shared/modeli/zdravstvenaDjelatnost.model";
import { ZdravstvenaUstanova } from "src/app/shared/modeli/zdravstvenaUstanova.model";

//Funkcija koja popunjava polje ŠIFRE ZDR. USTANOVE na osnovu unesenog naziva
export function nazivZdrUstToSif(
    forma: FormGroup,
    zdrUstanove: ZdravstvenaUstanova[],
    uneseniNaziv: string){
    //Prolazim kroz sve zdravstvene ustanove
    for(const zdrUst of zdrUstanove){
        //Ako se pronađe vrijednost naziva zdravstvene ustanove u polju
        if(zdrUst.naziv === uneseniNaziv){
            //U polje šifre ustanove postavljam šifru koja odgovara unesenom nazivu
            forma.get('zdravstvenaUstanova.sifZdrUst').patchValue(zdrUst.id, {emitEvent: false});
        }
    }
}

//Funkcija koja popunjava polje NAZIVA ZDR. USTANOVA na osnovu unesenog naziva
export function sifraZdrUstToNaziv(
    forma: FormGroup,
    zdrUstanove: ZdravstvenaUstanova[],
    unesenaSifra: string){
    //Prolazim kroz sve zdravstvene ustanove
    for(const zdrUst of zdrUstanove){
        //Ako se pronađe vrijednost šifre zdravstvene ustanove u polju
        if(zdrUst.id === unesenaSifra){
            //U polje naziva ustanove postavljam naziv koja odgovara unesenoj šifri
            forma.get('zdravstvenaUstanova.nazivZdrUst').patchValue(zdrUst.naziv, {emitEvent: false});
        }
    }
}


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
