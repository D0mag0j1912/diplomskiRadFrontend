import { FormGroup, ValidatorFn } from '@angular/forms';
import * as Validacija from './recept-validations';

export function azurirajValidatore(forma: FormGroup,lijekoviOsnovnaListaOJP: string[],lijekoviDopunskaListaOJP: string[],
                                magPripravciOsnovnaLista: string[],magPripravciDopunskaLista: string[], isLijek: boolean,
                                isMagPripravak: boolean, isValidDijagnoze: ValidatorFn,isSpecijalist: boolean){
    forma.setValidators([Validacija.isUnesenProizvod(lijekoviOsnovnaListaOJP,lijekoviDopunskaListaOJP,
        magPripravciOsnovnaLista,magPripravciDopunskaLista,
        isLijek,isMagPripravak),
        isValidDijagnoze, 
        Validacija.doziranjePrijeProizvod(),
        Validacija.kolicinaPrijeProizvod(),
        Validacija.requiredSifraSpecijalist(isSpecijalist)]);
    //Ažuriram stanje validacije
    forma.updateValueAndValidity({emitEvent: false});
}