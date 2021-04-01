import { FormGroup, FormArray } from "@angular/forms";

//Metoda koja popunjava polje MKB šifre SEKUNDARNE dijagnoze kada se unese NAZIV SEKUNDARNE dijagnoze
export function nazivToMKBSekundarna(nazivSekundarna: string,dijagnoze: any,forma: FormGroup,index: number){
    //Prolazim kroz polje naziva i MKB šifri dijagnoza
    for(const dijagnoza of dijagnoze){
        //Ako je uneseni naziv sekundarne dijagnoze od strane liječnika JEDNAK nazivu sekundarne dijagnoze u importanom polju
        if(dijagnoza.imeDijagnoza === nazivSekundarna){
            //U polje MKB šifre sekundarne dijagnoze ubacivam MKB šifru te dijagnoze koja je jednaka
            (<FormGroup>(<FormArray>forma.get('sekundarnaDijagnoza')).at(index)).get('mkbSifraSekundarna').patchValue(dijagnoza.mkbSifra,{emitEvent: false});
        }
    }
    (<FormGroup>(<FormArray>forma.get('sekundarnaDijagnoza')).at(index)).updateValueAndValidity({emitEvent: false});
}