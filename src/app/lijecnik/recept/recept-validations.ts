import { EventEmitter } from "@angular/core";
import { FormArray, FormControl } from "@angular/forms";
import { FormGroup, ValidatorFn } from "@angular/forms";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { take, takeUntil, tap } from "rxjs/operators";

//Funkcija koja provjerava ispravnost MKB šifre primarne dijagnoze
export function provjeriMKB(mkbSifre: string[]): ValidatorFn{
    return (control: FormControl): {[key: string]:boolean} | null => {
        if(control){
            //Ako se vrijednost unosa MKB šifre nalazi u polju MKB šifri
            if(mkbSifre.indexOf(control.value) !== -1){
                //Vrati da je u redu
                return null;
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
        if(dijagnoza.mkbSifra === mkbSifra){
            //U polje naziva primarne dijagnoze postavljam naziv koji odgovara toj jednakoj MKB šifri
            forma.get('primarnaDijagnoza').patchValue(dijagnoza.imeDijagnoza,{onlySelf: true,emitEvent: false});
        }
    }
    //Ažuriram promjene u polje naziva primarne dijagnoze
    forma.get('primarnaDijagnoza').updateValueAndValidity({onlySelf:true,emitEvent: false});
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
//Metoda koja provjerava je li doziranje uneseno PRIJE količine 
export function doziranjePrijeKolicina(): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        //Ako je doziranje ispravno uneseno, a da NIJE unesena količina proizvoda
        if(group.get('doziranje.doziranjeFrekvencija').valid 
            && !group.get('kolicina.kolicinaDropdown').value){
            //Vraćam grešku
            return {'doziranjePrijeKolicina': true};
        }
        //Ako je sve u redu, vraćam null
        return null;
    }
}
//Metoda koja provjerava je li količina proizvoda unesena PRIJE samog proizvoda
export function kolicinaPrijeProizvod(): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        //Ako je količina unesena, a da nije unesen proizvod
        if(group.get('kolicina.kolicinaDropdown').value 
            && (!group.get('osnovnaListaLijek.osnovnaListaLijekDropdown').value  && 
            !group.get('osnovnaListaLijek.osnovnaListaLijekText').value && 
            !group.get('dopunskaListaLijek.dopunskaListaLijekDropdown').value && 
            !group.get('dopunskaListaLijek.dopunskaListaLijekText').value && 
            !group.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown').value && 
            !group.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').value && 
            !group.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown').value && 
            !group.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').value)){
            //Vraćam grešku
            return {'kolicinaPrijeProizvod': true};
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