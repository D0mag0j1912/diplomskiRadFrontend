export class Cekaonica{
    public datumDodavanja: string;
    public odgovornaOsoba: string;
    public idCekaonica: number;
    public idObrada: number;
    public idPacijent: number;
    public imePacijent: string;
    public prezPacijent: string;
    public status: string;
    public tipKorisnik: string;
    public vrijemeDodavanja: string;
    constructor(response: any){
        if(response.DatumDodavanja){
            this.datumDodavanja = response.DatumDodavanja;
        }
        if(response.OdgovornaOsoba){
            this.odgovornaOsoba = response.OdgovornaOsoba;
        }
        if(response.idCekaonica){
            this.idCekaonica = response.idCekaonica;
        }
        if(response.idObrada){
            this.idObrada = response.idObrada;
        }
        if(response.idPacijent){
            this.idPacijent = response.idPacijent;
        }
        if(response.imePacijent){
            this.imePacijent = response.imePacijent;
        }
        if(response.prezPacijent){
            this.prezPacijent = response.prezPacijent;
        }
        if(response.statusCekaonica){
            this.status = response.statusCekaonica;
        }
        if(response.tip){
            this.tipKorisnik = response.tip;
        }
        if(response.vrijemeDodavanja){
            this.vrijemeDodavanja = response.vrijemeDodavanja;
        }
    }
}