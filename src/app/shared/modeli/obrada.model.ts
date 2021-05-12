import { Time } from "@angular/common";

export class Obrada {
    public idObrada: number;
    public idPacijent: number;
    public datumDodavanja: Date;
    public vrijemeDodavanja: Time;
    public statusObrada: string;
    public tip?: string;

    constructor(response: any){
        if(response.tip){
            this.tip = response.tip;
        }
        if(response.idObrada){
            this.idObrada = response.idObrada;
        }
        if(response.idPacijent){
            this.idPacijent = response.idPacijent;
        }
        if(response.datumDodavanja){
            this.datumDodavanja = response.datumDodavanja;
        }
        if(response.vrijemeDodavanja){
            this.vrijemeDodavanja = response.vrijemeDodavanja;
        }
        if(response.statusObrada){
            this.statusObrada = response.statusObrada;
        }
    }
}
