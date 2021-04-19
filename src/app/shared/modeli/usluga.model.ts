import { Recept } from "./recept.model";
import { Uputnica } from "./uputnica.model";

export class Usluga {
    public iznosUsluga: number;
    public bmi?: string;
    public _recept?: Recept;
    public _uputnica?: Uputnica;

    constructor(response: any){
        if(response.iznosUsluga){
            this.iznosUsluga = +response.iznosUsluga;
        }
        if(response.bmi){
            this.bmi = response.bmi;
        }
    }
}
