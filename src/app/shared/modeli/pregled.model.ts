import { Time } from "@angular/common";

export class Pregled {
    public idPregled: number;
    public nacinPlacanja: string;
    public oznakaOsiguranika: string;
    public nazivDrzave: string;
    public primarnaDijagnoza: string;
    public mkbSifraPrimarna: string;
    public tipSlucaj: string;
    public datum: Date;
    public vrijeme: Time;
    public sekundarneDijagnoze: string;
    public tip: string;
    constructor(response: any){
        if(response.idPregled){
            this.idPregled = +response.idPregled;
        }
        if(response.nacinPlacanja){
            this.nacinPlacanja = response.nacinPlacanja;
        }
        if(response.oznakaOsiguranika){
            this.oznakaOsiguranika = response.oznakaOsiguranika;
        }
        if(response.nazivDrzave){
            this.nazivDrzave = response.nazivDrzave;
        }
        if(response.primarnaDijagnoza){
            this.primarnaDijagnoza = response.primarnaDijagnoza;
        }
        if(response.mkbSifraPrimarna){
            this.mkbSifraPrimarna = response.mkbSifraPrimarna;
        }
        if(response.tipSlucaj){
            this.tipSlucaj = response.tipSlucaj;
        }
        if(response.datumPregled){
            this.datum = response.datumPregled;
        }
        if(response.vrijemePregled){
            this.vrijeme = response.vrijemePregled;
        }
        if(response.tip){
            this.tip = response.tip;
        }
    }

    set sekundarne(sekundarneDijagnoze: string){
        this.sekundarneDijagnoze = sekundarneDijagnoze;
    }
}