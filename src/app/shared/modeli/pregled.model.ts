import { Time } from "@angular/common";

export class Pregled {
    public idPregled: number;
    public nacinPlacanja: string;
    public podrucniUredHZZO?: number;
    public podrucniUredOzljeda?: number;
    public nazivPoduzeca?: string;
    public nazivSluzbe: string;
    public oznakaOsiguranika: string;
    public opisOsiguranika: string;
    public nazivDrzave: string;
    public mkbSifraPrimarna: string;
    public tipSlucaj: string;
    public datum: Date;
    public vrijeme: Time;

    constructor(response: any){
        if(response.idPregled){
            this.idPregled = +response.idPregled;
        }
        if(response.nacinPlacanja){
            this.nacinPlacanja = response.nacinPlacanja;
        }
        if(response.podrucniUredHZZO){
            this.podrucniUredHZZO = +response.podrucniUredHZZO;
        }
        if(response.podrucniUredOzljeda){
            this.podrucniUredOzljeda = +response.podrucniUredOzljeda;
        }
        if(response.nazivPoduzeca){
            this.nazivPoduzeca = response.nazivPoduzeca;
        }
        if(response.nazivSluzbe){
            this.nazivSluzbe = response.nazivSluzbe;
        }
        if(response.oznakaOsiguranika){
            this.oznakaOsiguranika = response.oznakaOsiguranika;
        }
        if(response.opisOsiguranika){
            this.opisOsiguranika = response.opisOsiguranika;
        }
        if(response.nazivDrzave){
            this.nazivDrzave = response.nazivDrzave;
        }
        if(response.mkbSifraPrimarna){
            this.mkbSifraPrimarna = response.mkbSifraPrimarna;
        }
        if(response.tipSlucaj){
            this.tipSlucaj = response.tipSlucaj;
        }
        if(response.Datum){
            this.datum = response.Datum;
        }
        if(response.vrijemePregled){
            this.vrijeme = response.vrijemePregled;
        }
    }
}