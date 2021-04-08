import { ValidatorFn, FormControl } from "@angular/forms";
import { ZdravstvenaDjelatnost } from "src/app/shared/modeli/zdravstvenaDjelatnost.model";
import { ZdravstvenaUstanova } from "src/app/shared/modeli/zdravstvenaUstanova.model";

//Funkcija koja provjerava ispravnost unosa NAZIVA zdr.ustanove
export function provjeriNazivZdrUstanove(zdrUstanove: ZdravstvenaUstanova[]): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        if(control){
            //Vraća vrijednost prvog elementa u polju koji zadovoljava traženi uvjet
            const isNaziv = zdrUstanove.find(element => {
                return element.naziv === control.value;
            });
            //Ako find() nije našao u polju unesenu vrijednost
            if(!isNaziv){
                return {'neispravanNazivZdrUstanova': true};
            }
            //Ako je našao unesenu vrijednost
            else{
                return null;
            }
        }
    }
}

//Funkcija koja provjerava ispravnost unosa ŠIFRE zdr. ustanove
export function provjeriSifruZdrUstanove(zdrUstanove: ZdravstvenaUstanova[]): ValidatorFn{
  return (control: FormControl): {[key:string]: boolean} | null => {
      if(control){
          //Vraća vrijednost prvog elementa u polju koji zadovoljava traženi uvjet
          const isNaziv = zdrUstanove.find(element => {
              return element.id === control.value;
          });
          //Ako find() nije našao u polju unesenu vrijednost
          if(!isNaziv){
              //Vraćam error
              return {'neispravnaSifraZdrUstanova': true};
          }
          //Ako je našao unesenu vrijednost
          else{
              return null;
          }
      }
  }
}

//Funkcija koja provjerava ispravnost unosa NAZIVA zdr. djelatnosti
export function provjeriNazivZdrDjelatnosti(zdrDjelatnosti: ZdravstvenaDjelatnost[]): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        if(control){
            //Vraća vrijednost prvog elementa u polju koji zadovoljava traženi uvjet
          const isNaziv = zdrDjelatnosti.find(element => {
              return element.nazivDjelatnosti === control.value;
          });
          //Ako find() nije našao u polju unesenu vrijednost
          if(!isNaziv){
              //Vraćam error
              return {'neispravanNazivZdrDjelatnosti': true};
          }
          //Ako je našao unesenu vrijednost
          else{
              return null;
          }
        }
    }
}

//Funkcija koja provjerava ispravnost unosa ŠIFRE zdr. djelatnosti
export function provjeriSifruZdrDjelatnosti(zdrDjelatnosti: ZdravstvenaDjelatnost[]): ValidatorFn{
  return (control: FormControl): {[key:string]: boolean} | null => {
      if(control){
          //Vraća vrijednost prvog elementa u polju koji zadovoljava traženi uvjet
          const isNaziv = zdrDjelatnosti.find(element => {
              return element.sifDjelatnosti === +control.value;
          });
          //Ako find() nije našao u polju unesenu vrijednost
          if(!isNaziv){
              //Vraćam error
              return {'neispravnaSifraZdrDjelatnosti': true};
          }
          //Ako je našao unesenu vrijednost
          else{
              return null;
          }
      }
  }
}
