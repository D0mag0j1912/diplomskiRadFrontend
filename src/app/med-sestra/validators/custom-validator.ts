import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidator{
    //Metoda koja provjerava je li naveden područni ured ako je naveden načina plaćanja HZZO
    static isEmptyPodrucniUred() : ValidatorFn {
        return (form: FormGroup): ValidationErrors | null => {
            //Ako je vrijednost od načina plaćanja HZZO:
            if(form.get('nacinPlacanja').value === 'hzzo'){
                //Ako je vrijednost područnog ureda null
                if(form.get('podrucniUred').value === null){
                    return {faliPodrucniUred: true};
                }
                else{
                    //form.controls['podrucniUred'].setErrors(null);
                    return null;
                }
            }
        }
    }

    //Metoda koja provjerava je li naveden područni ured ako je naveden načina plaćanja ozljeda na radu
    static isEmptyPodrucniUredOzljeda() : ValidatorFn {
        return (form: FormGroup): ValidationErrors | null => {
            //Ako je vrijednost od načina plaćanja ozljeda na radu:
            if(form.get('nacinPlacanja').value === 'ozljeda'){
                //Ako je vrijednost područnog ureda null
                if(form.get('ozljeda').value === null){
                    return {faliPodrucniUred: true};
                }
                else{
                    //form.controls['podrucniUred'].setErrors(null);
                    return null;
                }
            }
        }
    }

    //Metoda koja provjerava je li naveden naziv poduzeća ako je naveden načina plaćanja "Poduzeće"
    static isEmptyPoduzece(value: string) : ValidatorFn {
        return (form: FormGroup): ValidationErrors | null => {
            //Ako je vrijednost od načina plaćanja "Poduzeće":
            if(value === 'poduzece'){
                //Ako je vrijednost naziva poduzeća null
                if(form.get('poduzece').value === null){
                    form.controls['poduzece'].setErrors({faliNazivPoduzeca: true});
                }
                else{
                    form.controls['poduzece'].setErrors(null);
                }
            }
            return; 
            //return form.get('nacinPlacanja').value === 'poduzece' && form.get('poduzece').value === null ? {faliNazivPoduzeca: true} : null;
        }
    }
} 