import { FormControl, ValidatorFn } from "@angular/forms";
//Funkcija koja provjerava je li unesen broj
export function isBroj(): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        if(!isNaN(parseFloat(control.value)) && isFinite(control.value)){
            return null;
        }
        return {'samoBrojevi': true};
    }
}


