import { FormGroup, FormArray } from "@angular/forms";

//Funkcija koja popunjava unos naziva sekundarne dijagnoze, kada je unesena njena MKB šifra u polje unosa MKB šifre
export function MKBtoNazivSekundarna(mkbSifra: string,dijagnoze: any,forma: FormGroup,index: number){
    //Prolazim kroz nazive i šifre svih dijagnoza
    for(const dijagnoza of dijagnoze){
        //Ako je unesena MKB šifra JEDNAKA MKB šifri iz importanog polja
        if(dijagnoza.mkbSifra.toLowerCase() === mkbSifra.toLowerCase()){
            //U polje naziva sekundarne dijagnoze postavljam naziv koji odgovara toj jednakoj MKB šifri
            (<FormGroup>(<FormArray>forma.get('sekundarnaDijagnoza')).at(index)).get('nazivSekundarna').patchValue(dijagnoza.imeDijagnoza,{emitEvent: false});
        }
    }
    //Ažuriram promjene u polju sekundarnih dijagnoza
    (<FormGroup>(<FormArray>forma.get('sekundarnaDijagnoza')).at(index)).updateValueAndValidity({emitEvent: false});
}

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

//Metoda koja popunjava polje MKB šifre dijagnoze kada se unese ime primarne dijagnoze
export function nazivToMKB(nazivPrimarna: string,dijagnoze: any,forma: FormGroup){
    //Prolazim kroz polje naziva i MKB šifri dijagnoza
    for(const dijagnoza of dijagnoze){
        //Ako je uneseni naziv primarne dijagnoze od strane liječnika JEDNAK nazivu primarne dijagnoze u importanom polju
        if(dijagnoza.imeDijagnoza === nazivPrimarna){
            //U polje MKB šifre primarne dijagnoze ubacivam MKB šifru te dijagnoze koja je jednaka
            forma.get('mkbPrimarnaDijagnoza').patchValue(dijagnoza.mkbSifra,{emitEvent: false});
        }
    }
    forma.get('mkbPrimarnaDijagnoza').updateValueAndValidity({emitEvent: false});
}

//Funkcija koja popunjava unos naziva primarne dijagnoze, kada je unesen njena MKB šifra u polje unosa MKB šifre
export function MKBtoNaziv(mkbSifra: string,dijagnoze: any,forma: FormGroup){
    //Prolazim kroz nazive i šifre svih dijagnoza
    for(const dijagnoza of dijagnoze){
        //Ako je unesena MKB šifra JEDNAKA MKB šifri iz importanog polja
        if(dijagnoza.mkbSifra.toLowerCase() === mkbSifra.toLowerCase()){
            //U polje naziva primarne dijagnoze postavljam naziv koji odgovara toj jednakoj MKB šifri
            forma.get('primarnaDijagnoza').patchValue(dijagnoza.imeDijagnoza,{emitEvent: false});
        }
    }
    //Ažuriram promjene u polje naziva primarne dijagnoze
    forma.get('primarnaDijagnoza').updateValueAndValidity({emitEvent: false});
}