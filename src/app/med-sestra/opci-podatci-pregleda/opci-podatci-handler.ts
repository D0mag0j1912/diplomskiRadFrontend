import { FormGroup } from "@angular/forms";
import { KategorijaOsiguranja } from "src/app/shared/modeli/kategorijaOsiguranja.model";
import { PodrucniUred } from "src/app/shared/modeli/podrucniUred.model";


//Metoda koja automatski upisuje šifru područnog ureda na osnovu upisanog naziva službe
export function nazivSluzbeToSif(
    value: string,
    podrucniUredi: PodrucniUred[],
    forma: FormGroup){
    //Prolazim kroz polje područnih ureda
    for(let ured of podrucniUredi){
      //Ako je vrijednost polja naziva službe područnog ureda jednaka vrijednosti naziva službe područnog ureda u polju
      if(value === ured["nazivSluzbe"]){
          //Postavi šifru područnog ureda na onu šifru koja odgovara upisanom nazivu službe
          forma.get('sifUred').patchValue(ured["sifUred"],{emitEvent: false});
      }
    }
    forma.get('sifUred').updateValueAndValidity({emitEvent: false});
}
//Metoda koja automatski upisuje šifru područnog ureda na osnovu upisanog naziva službe
export function nazivSluzbeToSifOzljeda(
    value: string,
    podrucniUredi: PodrucniUred[],
    forma: FormGroup){
    //Prolazim kroz polje područnih ureda
    for(let ured of podrucniUredi){
        //Ako je vrijednost polja naziva službe područnog ureda jednaka vrijednosti naziva službe područnog ureda u polju
        if(value === ured["nazivSluzbe"]){
            //Postavi šifru područnog ureda na onu šifru koja odgovara upisanom nazivu službe
            forma.get('sifUredOzljeda').patchValue(ured["sifUred"],{emitEvent: false});
        }
    }
    forma.get('sifUredOzljeda').updateValueAndValidity({emitEvent: false});
}

//Metoda koja automatski upisuje oznaku osiguranika na osnovu upisanog opisa osiguranja
export function opisOsiguranikaToOznaka(
    value: string,
    katOsiguranja: KategorijaOsiguranja[],
    forma: FormGroup){
    //Prolazim kroz polje kategorija osiguranja
    for(let osiguranje of katOsiguranja){
        //Ako je vrijednost polja naziva službe područnog ureda jednaka vrijednosti naziva službe područnog ureda u polju
        if(value === osiguranje["opisOsiguranika"]){
            //Postavi oznaku osiguranika na onu oznaku koja odgovora odabranom opisu osiguranika
            forma.get('oznakaOsiguranika').patchValue(osiguranje["oznakaOsiguranika"],{emitEvent: false});
        }
    }
    forma.get('oznakaOsiguranika').updateValueAndValidity({emitEvent: false});
}
