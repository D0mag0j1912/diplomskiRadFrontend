import { Time } from "@angular/common";

export class Recept{
    //Definiram propertye ovog objekta
    public mkbSifraPrimarna: string;
    public proizvod: string;
    public dostatnost: string;
    public datumRecept: Date;
    public mkbSifraSekundarna?: string[];
    public idRecept?: number;
    public oblikJacinaPakiranjeLijek?:string;
    public kolicina?: string;
    public doziranje?: string;
    public hitnost?: string;
    public ponovljivost?: string;
    public brojPonavljanja?: string;
    public sifraSpecijalist?: number;
    public idPacijent?: number;
    public imePrezimePacijent?: string;
    public vrijemeRecept?: Time;
    //U ovoj metodi dohvaćam cijeli objekt koji dolazi sa servera te podatke iz njega spremam u svoje varijable
    constructor(response: any){
        if(response.Datum){
            this.datumRecept = response.Datum;
        }
        if(response.Pacijent){
            this.imePrezimePacijent = response.Pacijent;
        }
        if(response.dostatnost){
            this.dostatnost = response.dostatnost;
        }
        if(response.mkbSifraPrimarna){
            this.mkbSifraPrimarna = response.mkbSifraPrimarna;
        }
        if(response.proizvod){
            this.proizvod = response.proizvod;
        }
        if(response.idPacijent){
            this.idPacijent = response.idPacijent;
        }
    }
}
