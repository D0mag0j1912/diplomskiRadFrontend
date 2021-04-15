import { FormControl, ValidatorFn } from "@angular/forms";

//Funkcija koja provjerava ispravnost unosa visina
export function visinaValidator(): ValidatorFn{
    return (control: FormControl): {[s: string]: boolean} | null => {
        if(control){
            if(+control.value < 0){
                return {'moraBitiPozitivanBroj': true};
            }
            else if(control.value && +control.value < 120){
                return {'neispravanUnos': true};
            }
            else if(control.value && +control.value > 270){
                return {'neispravanUnos': true};
            }
            else{
                return null;
            }
        }
    }
}

//Funkcija koja provjerava ispravnost unosa težine
export function tezinaValidator(): ValidatorFn{
    return (control: FormControl): {[s: string]: boolean} | null => {
        if(control){
            if(+control.value < 0){
                return {'moraBitiPozitivanBroj': true};
            }
            else if(control.value && +control.value < 20){
                return {'neispravanUnos': true};
            }
            else if(control.value && +control.value > 700){
                return {'neispravanUnos': true};
            }
            else{
                return null;
            }
        }
    }
}
