import { ValidatorFn, FormControl, FormGroup } from "@angular/forms";
import { Dijagnoza } from "./modeli/dijagnoza.model";
import { ZdravstveniRadnik } from "./modeli/zdravstveniRadnik.model";

//Funkcija koja provjerava je li šifra specijalista unesena
export function requiredSifraSpecijalist(isSpecijalist: boolean): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          //Ako je unesen proizvod koji traži šifru specijalista
          if(isSpecijalist){
              //Ako polje šifre specijalista nije uneseno
              if(!control.value){
                  //Vrati grešku
                  return {'requiredSpecijalist': true};
              }
              //Inače vrati da je u redu
              return null;
          }
      }
  }
}

//Funkcija koja provjerava JE LI šifra specijalista ISPRAVNO UNESENA
export function provjeraSifraSpecijalist(zdravstveniRadnici: ZdravstveniRadnik[],isSpecijalist: boolean): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          //Ako je potrebno upisati šifru specijalista:
          if(isSpecijalist && control.value){
              //Prolazim kroz polje zdravstvenih radnika
              for(const radnik of zdravstveniRadnici){
                  //Ako se unesena vrijednost nalazi u šiframa specijalista
                  if(+control.value === radnik.sifraSpecijalist){
                      //Vrati da je u redu
                      return null;
                  }
              }
              //Ako se unesena vrijednost NE NALAZI u šiframa specijalista, vrati grešku
              return {'neispravnaSifraSpecijalista': true};
          }
      }
  }
}

//Funkcija koja provjerava ispravnost unosa dijagnoza
export function provjeriNazivDijagnoza(dijagnoze: Dijagnoza[]):ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        const naziv = dijagnoze.find((element) => {
            return element.imeDijagnoza === control.value;
        });
        if(!naziv){
            return {'neispravanNazivDijagnoza': true};
        }
        else{
            return null;
        }
    }
}

//Funkcija koja provjerava ispravnost MKB šifre primarne dijagnoze
export function provjeriMKB(mkbSifre: string[]): ValidatorFn{
    return (control: FormControl): {[key: string]:boolean} | null => {
        if(control.value !== null){
            //Prolazim kroz sve MKB šifre
            for(const mkbSifra of mkbSifre){
                if(mkbSifra.toLowerCase() === control.value.toLowerCase()){
                    return null;
                }
            }
            //Vrati pogrešku
            return {'neispravanMKB': true};
        }
    }
}

//Funkcija koja nadodava REQUIRED validator na MKB šifru sek. dijagnoze
export function requiredMKBSifraSekundarna(): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if(group){
            //Ako je unesen naziv sekundarne dijagnoze, postavi REQUIRED validator na MKB šifru sekundarne dijagnoze
            if(group.get('nazivSekundarna').value && !group.get('mkbSifraSekundarna').value){
                //Vrati grešku
                return {'requiredMKB': true};
            }
            //Ako je sve u redu
            return null;
        }
    }
}
//Funkcija koja nadodava ISPRAVNOST? validator na MKB šifru sek. dijagnoze
export function provjeriMKBSifraSekundarna(mkbSifre: string[]): ValidatorFn{
    return (group: FormGroup): {[key: string]:boolean} | null => {
        //Ako su popunjeni i naziv sekundarne dijagnoze i njezina MKB šifra
        if(group.get('mkbSifraSekundarna').value){
            //Prolazim kroz sve MKB šifre
            for(const mkbSifra of mkbSifre){
                //Ako unesena MKB šifra postoji u polju ispravnih MKB šifri (bilo kojim slovima)
                if(mkbSifra.toLowerCase() === group.get('mkbSifraSekundarna').value.toLowerCase()){
                    return null;
                }
            }
            //Vrati pogrešku
            return {'neispravanMKB': true};
        }
    }
}
