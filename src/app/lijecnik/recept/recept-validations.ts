import { FormArray, FormControl } from "@angular/forms";
import { FormGroup, ValidatorFn } from "@angular/forms";

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

//Funkcija koja nadodava REQUIRED validator na NAZIV sek. dijagnoze
export function requiredNazivSekundarna(): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if(group){
            //Ako je unesena MKB šifra sek. dijagnoze, postavi REQUIRED validator na NAZIV sek. dijagnoze
            if(!group.get('nazivSekundarna').value && group.get('mkbSifraSekundarna').value){
                //Vrati grešku
                return {'requiredNazivSekundarna': true};
            }
            //Ako je sve u redu
            return null;
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

//Funkcija koja provjerava je li unesen broj ponavljanja recepta ako je "ponovljiv" checked
export function provjeriBrojPonavljanja(): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if(group){
            //Ako je "ponovljiv checked" te ako nije unesen broj ponavljanja
            if(group.get('ponovljivost').value && !group.get('brojPonavljanja').value){
                //Vrati grešku
                return {'mustBrojPonavljanja': true};
            }
            //Inače, vrati da je u redu
            return null;
        }
    }
}

//Funkcija koja provjerava ispravnost liječnikova unosa dostatnosti
export function provjeriDostatnost(isPonovljiv: boolean, brojPonavljanja: string): ValidatorFn{
    return (control: FormControl): {[key: string]:boolean} | null => {
        //Ako je definiran ovaj form control
        if(control){    
            //Ako je recept ponovljiv
            if(isPonovljiv){
                //Ako je broj ponavljanja 1 i vrijednost trajanja terapije je veća od 60:
                if(+brojPonavljanja === 1 && +control.value > 60){
                    //Vrati grešku
                    return {'najvise60': true};
                }
                //Ako je broj ponavljanja 2 i vrijednost trajanja terapije je veća od 90:
                else if(+brojPonavljanja === 2 && +control.value > 90){
                    //Vrati grešku
                    return {'najvise90': true};
                }
                //Ako je broj ponavljanja 3 i vrijednost trajanja terapije je veća od 120:
                else if(+brojPonavljanja === 3 && +control.value > 120){
                    //Vrati grešku
                    return {'najvise120': true};
                }
                //Ako je broj ponavljanja 4 i vrijednost trajanja terapije je veća od 150:
                else if(+brojPonavljanja === 4 && +control.value > 150){
                    //Vrati grešku
                    return {'najvise150': true};
                }
                //Ako je broj ponavljanja 5 i vrijednost trajanja terapije je veća od 180:
                else if(+brojPonavljanja === 5 && +control.value > 180){
                    //Vrati grešku
                    return {'najvise180': true};
                }
                //Ako je sve u redu
                return null;
            }
            //Ako je recept običan:
            else{
                //Ako je broj dana veći od 30:
                if(+control.value > 30){
                    return {'najvise30': true};
                }
                //Ako je sve u redu
                return null;
            }
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
//Metoda koja provjerava je li proizvod unesen
export function isUnesenProizvod(lijekoviOsnovnaListaOJP: string[],lijekoviDopunskaListaOJP:string[],
                                magPripravciOsnovnaLista: string[],magPripravciDopunskaLista: string[],
                                isLijek: boolean,isMagPripravak: boolean): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if(group){
            //Ako liječnik izabire lijekove
            if(isLijek){
                //Ako dropdown osnovne liste lijekova ima neku vrijednost
                if(group.get('osnovnaListaLijek.osnovnaListaLijekDropdown').value){
                    //Ako je ta vrijednost ispravna tj. dio osnovne liste lijekova
                    if(lijekoviOsnovnaListaOJP.indexOf(group.get('osnovnaListaLijek.osnovnaListaLijekDropdown').value) !== -1){
                        //Vrati da je u redu
                        return null;
                    }
                }
                //Ako tekstualno polje OSNOVNE liste lijekova ima neku vrijednost
                if(group.get('osnovnaListaLijek.osnovnaListaLijekText').value){
                    //Prolazim kroz sve vrijednost lijekova OSNOVNE liste
                    for(const lijek of lijekoviOsnovnaListaOJP){
                        //Ako lijek iz polja (malim slovima) je JEDNAK lijeku iz polja pretrage (malim slovima)
                        if(lijek.toLowerCase() === group.get('osnovnaListaLijek.osnovnaListaLijekText').value.toLowerCase()){
                            //Vrati da je u redu
                            return null;
                        }
                    }  
                }
                //Ako dropdown dopunske liste lijekova ima neku vrijednost
                if(group.get('dopunskaListaLijek.dopunskaListaLijekDropdown').value){
                    //Ako je ta vrijednost dio polja dopunske liste lijekova
                    if(lijekoviDopunskaListaOJP.indexOf(group.get('dopunskaListaLijek.dopunskaListaLijekDropdown').value) !== -1){
                        //Vrati da je u redu
                        return null;
                    }
                }
                //Ako tekstualno polje DOPUNSKE LISTE LIJEKOVA ima neku vrijednost
                if(group.get('dopunskaListaLijek.dopunskaListaLijekText').value){
                    //Prolazim kroz sve vrijednost lijekova DOPUNSKE liste
                    for(const lijek of lijekoviDopunskaListaOJP){
                        //Ako lijek iz polja (malim slovima) je JEDNAK lijeku iz polja pretrage (malim slovima)
                        if(lijek.toLowerCase() === group.get('dopunskaListaLijek.dopunskaListaLijekText').value.toLowerCase()){
                            //Vrati da je u redu
                            return null;
                        }
                    }
                }
                return {'baremJedan': true};
            }
            //Ako liječnik izabere magistralne pripravke
            else if(isMagPripravak){
                //Ako dropdown osnovne liste magistralnih pripravaka ima neku vrijednost
                if(group.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown').value){
                    //Ako je ta vrijednost ispravna tj. dio osnovne liste mag. pripravaka
                    if(magPripravciOsnovnaLista.indexOf(group.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown').value) !== -1){
                        //Vrati da je u redu
                        return null;
                    }
                }
                //Ako tekstualno polje OSNOVNE liste mag.pripravaka ima neku vrijednost
                if(group.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').value){
                    //Prolazim kroz sve vrijednosti mag. pripravaka OSNOVNE liste
                    for(const magPripravak of magPripravciOsnovnaLista){
                        //Ako mag. pripravak iz polja (malim slovima) je JEDNAK mag. pripravku iz polja pretrage (malim slovima)
                        if(magPripravak.toLowerCase() === group.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').value.toLowerCase()){
                            //Vrati da je u redu
                            return null;
                        }
                    }  
                }
                //Ako dropdown DOPUNSKE liste magistralnih pripravaka ima neku vrijednost
                if(group.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown').value){
                    //Ako je ta vrijednost ispravna tj. dio DOPUNSKE liste mag. pripravaka
                    if(magPripravciDopunskaLista.indexOf(group.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown').value) !== -1){
                        //Vrati da je u redu
                        return null;
                    }
                }
                //Ako tekstualno polje DOPUNSKE liste mag.pripravaka ima neku vrijednost
                if(group.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').value){
                    //Prolazim kroz sve vrijednosti mag. pripravaka DOPUNSKE liste
                    for(const magPripravak of magPripravciDopunskaLista){
                        //Ako mag. pripravak iz polja (malim slovima) je JEDNAK mag. pripravku iz polja pretrage (malim slovima)
                        if(magPripravak.toLowerCase() === group.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').value.toLowerCase()){
                            //Vrati da je u redu
                            return null;
                        }
                    }  
                }
                //Inače, vrati grešku
                return {'baremJedan': true};
            }
        }
    }
} 
//Metoda koja provjerava je li doziranje uneseno PRIJE proizvoda
export function doziranjePrijeProizvod(): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        //Ako doziranje ima upisanu ispravnu vrijednost
        if(group.get('doziranje.doziranjeFrekvencija').value && group.get('doziranje.doziranjeFrekvencija').valid){
            //Ako forma ima errora
            if(group.errors){
                //Ako proizvod nije unesen
                if('baremJedan' in group.errors){
                    //Vrati grešku
                    return {'doziranjePrijeProizvod': true};
                }
            }
        }
        //Ako je sve u redu, vraćam null
        return null;
    }
}
//Metoda koja provjerava je li količina proizvoda unesena PRIJE samog proizvoda
export function kolicinaPrijeProizvod(): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        //Ako je količina unesena, a da nije unesen proizvod
        if(group.get('kolicina.kolicinaDropdown').value && group.get('kolicina.kolicinaDropdown').valid){
            //Ako forma ima errora
            if(group.errors){
                //Ako proizvod nije unesen
                if('baremJedan' in group.errors){
                    //Vrati grešku
                    return {'kolicinaPrijeProizvod': true};
                }
            }
        }
        //Ako je sve u redu, vraćam null
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