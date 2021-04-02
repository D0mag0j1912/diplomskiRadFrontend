import { ValidatorFn, FormControl, FormGroup } from "@angular/forms";

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
