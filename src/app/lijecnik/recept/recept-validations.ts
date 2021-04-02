import { FormArray, FormControl } from "@angular/forms";
import { FormGroup, ValidatorFn } from "@angular/forms";
import { ZdravstveniRadnik } from "src/app/shared/modeli/zdravstveniRadnik.model";

//Funkcija koja provjerava je li doziranje prešlo max dozu
export function prekoracenjeDoze(objekt:{success:string,message:string,maxDoza:string} | null): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if(group){
            //Ako je server vratio poruku da je doziranje PREŠLO max dnevnu dozu
            if(objekt.success === "false"){
                return {'prekoracenje': true};
            }
            //Ako je server vratio poruku da doziranje NIJE PREŠLO max dnevnu dozu
            else if(objekt.success === "true"){
                return null;
            }
            else if(objekt === null){
                return null;
            }
        }
    }
}

//Funkcija koja popunjava polje tipa specijaliste ovisno o unesenoj šifri specijalista
export function sifraSpecijalistToTip(sifraSpecijalist: string,zdravstveniRadnici: ZdravstveniRadnik[], 
                                    forma: FormGroup, isSpecijalist: boolean){
    //Ako je potrebno upisati šifru specijalista
    if(isSpecijalist){
        //Prolazim poljem zdravstvenih radnika
        for(const radnik of zdravstveniRadnici){
            //Ako unesena vrijednost šifre specijalista odgovara nekoj šifri specijalista u polju
            if(radnik.sifraSpecijalist == +sifraSpecijalist){
                //Popuni polje tipa specijalista ovisno o toj šifri
                forma.get('specijalist.tipSpecijalist').patchValue(radnik.tipSpecijalist,{emitEvent: false});
            }
        }
        //Ažuriram vrijednosti
        forma.get('specijalist.tipSpecijalist').updateValueAndValidity({emitEvent: false});
    }
}

//Funkcija koja provjerava JE LI šifra specijalista ISPRAVNO UNESENA
export function provjeraSifraSpecijalist(zdravstveniRadnici: ZdravstveniRadnik[],isSpecijalist: boolean): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        if(control){
            //Ako je potrebno upisati šifru specijalista:
            if(isSpecijalist){
                //Prolazim kroz polje zdravstvenih radnika
                for(const radnik of zdravstveniRadnici){
                    //Ako se unesena vrijednost nalazi u šiframa specijalista
                    if(control.value === radnik.sifraSpecijalist){
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

//Funkcija koja provjerava je li šifra specijalista unesena
export function requiredSifraSpecijalist(isSpecijalist: boolean): ValidatorFn{
    return (group: FormGroup): {[key: string]: boolean} | null => {
        if(group){
            //Ako je unesen proizvod koji traži šifru specijalista
            if(isSpecijalist){
                //Ako polje šifre specijalista nije uneseno
                if(!group.get('specijalist.sifraSpecijalist').value){
                    //Vrati grešku
                    return {'requiredSpecijalist': true};
                }
                //Inače vrati da je u redu
                return null;
            }
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