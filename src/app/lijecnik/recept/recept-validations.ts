import { FormArray } from "@angular/forms";
import { FormGroup, ValidatorFn } from "@angular/forms";

//Funkcija koja popunjava unos naziva primarne dijagnoze, kada je unesen njena MKB šifra u polje unosa MKB šifre
export function MKBtoNaziv(mkbSifra: string,dijagnoze: any,forma: FormGroup){
    //Prolazim kroz nazive i šifre svih dijagnoza
    for(const dijagnoza of dijagnoze){
        //Ako je unesena MKB šifra JEDNAKA MKB šifri iz importanog polja
        if(dijagnoza.mkbSifra === mkbSifra){
            //U polje naziva primarne dijagnoze postavljam naziv koji odgovara toj jednakoj MKB šifri
            forma.get('primarnaDijagnoza').patchValue(dijagnoza.imeDijagnoza,{emitEvent: false});
        }
    }
    //Ažuriram promjene u polje naziva primarne dijagnoze
    forma.get('primarnaDijagnoza').updateValueAndValidity({emitEvent: false});
}

//Metoda koja popunjava polje MKB šifre dijagnoze kada se unese ime primarne dijagnoze
export function nazivToMKB(nazivPrimarna: string,dijagnoze: any,forma: FormGroup){
    //Prolazim kroz polje naziva i MKB šifri dijagnoza
    for(const dijagnoza of dijagnoze){
        //Ako je uneseni naziv primarne dijagnoze od strane liječnika JEDNAK nazivu primarne dijagnoze u importanom polju
        if(dijagnoza.imeDijagnoza === nazivPrimarna){
            //U polje MKB šifre primarne dijagnoze ubacivam MKB šifru te dijagnoze koja je jednaka
            forma.get('mkbPrimarnaDijagnoza').patchValue(dijagnoza.mkbSifra,{onlySelf: true,emitEvent: false});
        }
    }
    forma.get('mkbPrimarnaDijagnoza').updateValueAndValidity({onlySelf: true,emitEvent: false});
}
//Metoda koja provjerava je li proizvod unesen
export function isUnesenProizvod(): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        //Ako nijedan proizvod nije unesen
        if(!group.get('osnovnaListaLijek.osnovnaListaLijekDropdown').value  && 
            !group.get('osnovnaListaLijek.osnovnaListaLijekText').value && 
            !group.get('dopunskaListaLijek.dopunskaListaLijekDropdown').value && 
            !group.get('dopunskaListaLijek.dopunskaListaLijekText').value && 
            !group.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown').value && 
            !group.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').value && 
            !group.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown').value && 
            !group.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').value){
                //Vrati grešku
                return {'baremJedan': true};
        }
        //Ako je barem jedan proizvod unesen, vrati da je u redu
        return null;
    }
}
//Metoda koja provjerava jesu li OBA DOZIRANJA UNESENA
export function obaDoziranjaZabranjeno(): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if(group){
            //Ako su oba dvije vrste doziranja unesene, prikaži error
            if(group.controls['doziranjeFrekvencija'].value && 
                group.controls['doziranjePeriod'].value && 
                group.controls['doziranjeText'].value){
                //Vrati grešku
                return {'bothForbidden': true};
            }
        }
        //Ako nisu oba dvije vrste unosa unesene, vrati da je u redu
        return null;
    }
}
//Funkcija koja provjerava je li barem jedno doziranje uneseno
export function baremJednoDoziranje(): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if(group){
            //Ako barem jedna vrsta doziranja nije unesena
            if(!group.get('doziranjeFrekvencija').value && 
                !group.get('doziranjeText').value){
                    //Vrati grešku
                    return {'baremJednoDoziranje': true};
            }
        }
        //Inače vrati da je sve u redu
        return null;
    }
}
//Metoda koja provjerava je li uneseno više istih sekundarnih dijagnoza
export function isValidSekundarnaDijagnoza(sekDijagnoza: string): ValidatorFn{
    return (array: FormArray): {[key: string]: boolean} | null => {
        //Kreiram pomoćno polje
        let pom = [];
        //Prolazim kroz array 
        for(let control of array.controls){
            //Ako se vrijednost sekundarne dijagnoze VEĆ NALAZI u pom polju, ali da nije "Odaberite sekundarnu dijagnozu"
            if(pom.indexOf(control.value) !== -1 && control.value !== null){
                //U svoju varijablu spremam sekundarnu dijagnozu koja je duplikat
                sekDijagnoza = control.value;
                console.log(this.sekDijagnoza);
                return {'duplikat': true};
            }
            //Ako se vrijednost sekundarne dijagnoze NE NALAZI u pom polju
            else{
                //Dodaj ga u pom polje
                pom.push(control.value);
            }
        }
        return null;
    }
} 