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
        //Spremam datum recepta
        if(response.Datum){
            this.datumRecept = response.Datum;
        }
        else if(response.datumRecept){
            this.datumRecept = response.datumRecept;
        }
        //Spremam ime i prezime pacijenta
        if(response.Pacijent){
            this.imePrezimePacijent = response.Pacijent;
        }
        else if(response.imePrezimePacijent){
            this.imePrezimePacijent = response.imePrezimePacijent;
        }
        //Spremam dostatnost
        if(response.dostatnost){
            this.dostatnost = response.dostatnost;
        }
        //Spremam šifru primarne dijagnoze
        if(response.mkbSifraPrimarna){
            this.mkbSifraPrimarna = response.mkbSifraPrimarna;
        }
        //Spremam naziv proizvoda
        if(response.proizvod){
            this.proizvod = response.proizvod;
        }
        //Spremam ID pacijenta čiji je recept 
        if(response.idPacijent){
            this.idPacijent = response.idPacijent;
        }
        //Spremam vrijeme kada je nastao recept
        if(response.vrijemeRecept){
            this.vrijemeRecept = response.vrijemeRecept;
        }
    }
}
