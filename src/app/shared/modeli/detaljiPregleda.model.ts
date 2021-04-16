export class DetaljiPregleda {
    public datumPregled: Date;
    public idObrada: number;
    public imePacijent: string;
    public prezimePacijent: string;
    public bmi?: string;

    constructor(response: any){
        if(response.Datum){
            this.datumPregled = response.Datum;
        }
        if(response.idObrada){
            this.idObrada = +response.idObrada;
        }
        if(response.imePacijent){
            this.imePacijent = response.imePacijent;
        }
        if(response.prezPacijent){
            this.prezimePacijent = response.prezPacijent;
        }
        if(response.bmi){
            this.bmi = response.bmi;
        }
    }
}
