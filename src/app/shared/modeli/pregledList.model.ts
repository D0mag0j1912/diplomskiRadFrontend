import { Time } from "@angular/common";

export class PregledList{
    public idPregled: number;
    public datum: Date;
    public tipSlucaj: string;
    public vrijeme: Time;
    public bojaPregled: string;
    public sljedeciPregled: number;
    public prethodniNoviSlucaj: number;
    public prethodniPovezanSlucaj: number;

    constructor(response: any){
        if(response.idPovijestBolesti){
            this.idPregled = +response.idPovijestBolesti;
        }
        else if(response.idPregled){
            this.idPregled = +response.idPregled;
        }
        if(response.Datum){
            this.datum = response.Datum;
        }
        if(response.tipSlucaj){
            this.tipSlucaj = response.tipSlucaj;
        }
        if(response.vrijeme){
            this.vrijeme = response.vrijeme;
        }
        else if(response.vrijemePregled){
            this.vrijeme = response.vrijemePregled;
        }
        if(response.bojaPregled){
            this.bojaPregled = response.bojaPregled;
        }
        if(response.sljedeciPregled){
            this.sljedeciPregled = +response.sljedeciPregled;
        }
        if(response.prethodniNoviSlucaj){
            this.prethodniNoviSlucaj = +response.prethodniNoviSlucaj;
        }
        if(response.prethodniPovezanSlucaj){
            this.prethodniPovezanSlucaj = +response.prethodniPovezanSlucaj;
        }
    }
}