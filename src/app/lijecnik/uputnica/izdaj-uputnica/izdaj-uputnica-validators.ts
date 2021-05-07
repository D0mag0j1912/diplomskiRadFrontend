import { ValidatorFn, FormControl, FormGroup } from "@angular/forms";
import { ZdravstvenaDjelatnost } from "src/app/shared/modeli/zdravstvenaDjelatnost.model";
import { ZdravstvenaUstanova } from "src/app/shared/modeli/zdravstvenaUstanova.model";

//Funkcija koja provjerava je li unesena zdr. ustanova kada je izabrana lab. dijagnostika
export function requiredZdrUstanova(
    tip: string
    ): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if(group){
            //Ako je tip uputnice LABORATORIJSKA DIJAGNOSTIKA te zdr. ustanova NIJE UNESENA
            if(tip === 'laboratorijskaDijagnostika'
            && !group.get('nazivZdrUst').value
            && !group.get('sifZdrUst').value){
                return {'requiredZdrUstanova': true};
            }
            return null;
        }
    }
}

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
