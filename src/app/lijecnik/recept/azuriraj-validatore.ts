import { FormGroup } from '@angular/forms';
import { IzdajReceptComponent } from './pacijenti/izdaj-recept/izdaj-recept.component';
import * as Validacija from './recept-validations';

export function azurirajValidatore(forma: FormGroup,lijekoviOsnovnaListaOJP: string[],lijekoviDopunskaListaOJP: string[],
                                magPripravciOsnovnaLista: string[],magPripravciDopunskaLista: string[], isLijek: boolean,
                                isMagPripravak: boolean, /* isValidDijagnoze: {[key: string]: boolean} | null, */ isSpecijalist: boolean/* , 
                                izdajReceptComponent: IzdajReceptComponent */){
    forma.setValidators([Validacija.isUnesenProizvod(lijekoviOsnovnaListaOJP,lijekoviDopunskaListaOJP,
        magPripravciOsnovnaLista,magPripravciDopunskaLista,
        isLijek,isMagPripravak),/* 
        isValidDijagnoze.bind(izdajReceptComponent),  */
        Validacija.doziranjePrijeProizvod(),
        Validacija.kolicinaPrijeProizvod(),
        Validacija.provjeraSifraSpecijalist(isSpecijalist)]);
    //Ažuriram stanje validacije
    forma.updateValueAndValidity({emitEvent: false});
}