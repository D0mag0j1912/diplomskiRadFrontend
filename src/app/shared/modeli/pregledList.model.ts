import { Time } from "@angular/common";

export class PregledList{
    public idPregled: number;
    public datum: Date;
    public tipSlucaj: string;
    public vrijeme: Time;

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
    }
}