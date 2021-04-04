import { Time } from "@angular/common";

export class InicijalneDijagnoze {
    public nazivPrimarna: string;
    public nazivSekundarna: string;
    public datum: Date;
    public idObradaLijecnik: number;
    public tipSlucaj: string;
    public vrijeme: Time;

    constructor(response: any){
        if(response.NazivPrimarna){
            this.nazivPrimarna = response.NazivPrimarna;
        }
        if(response.NazivSekundarna){
            this.nazivSekundarna = response.NazivSekundarna;
        }
        if(response.datum){
            this.datum = response.datum;
        }
        if(response.idObradaLijecnik){
            this.idObradaLijecnik = +response.idObradaLijecnik;
        }
        if(response.tipSlucaj){
            this.tipSlucaj = response.tipSlucaj;
        }
        if(response.vrijeme){
            this.vrijeme = response.vrijeme;
        }
    }
}