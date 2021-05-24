import { Time } from "@angular/common";

export class Narudzba {
    public idVrstaPregled: number;
    public nazivVrstaPregled: string;
    public idPacijent: number;
    public pacijent: string;
    public idNarucivanje: number;
    public datumNarucivanje: Date;
    public vrijemeNarucivanje: Time;
    public napomenaNarucivanje: string;

    constructor(response: any){
        if(response.idVrstaPregled){
            this.idVrstaPregled = +response.idVrstaPregled;
        }
        if(response.nazivVrstaPregled){
            this.nazivVrstaPregled = response.nazivVrstaPregled;
        }
        if(response.idPacijent){
            this.idPacijent = +response.idPacijent;
        }
        if(response.Pacijent){
            this.pacijent = response.Pacijent;
        }
        if(response.idNarucivanje){
            this.idNarucivanje = +response.idNarucivanje;
        }
        if(response.datumNarucivanje){
            this.datumNarucivanje = response.datumNarucivanje;
        }
        if(response.vrijemeNarucivanje){
            this.vrijemeNarucivanje = response.vrijemeNarucivanje;
        }
        if(response.napomenaNarucivanje){
            this.napomenaNarucivanje = response.napomenaNarucivanje;
        }
    }
}
