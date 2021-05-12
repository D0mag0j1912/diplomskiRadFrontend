import { Time } from "@angular/common";

export class Recept{
    //Definiram propertye ove klase
    public mkbSifraPrimarna?: string;
    public proizvod?: string;
    public dostatnost?: string;
    public datumRecept?: Date;
    public nazivPrimarna?: string;
    public mkbSifraSekundarna?: string;
    public idRecept?: number;
    public oblikJacinaPakiranjeLijek?:string;
    public kolicina?: string;
    public doziranje?: string;
    public hitnost?: string;
    public ponovljivost?: string;
    public brojPonavljanja?: string;
    public sifraSpecijalist?: number;
    public cijeliSpecijalist?: string;
    public idPacijent?: number;
    public imePrezimePacijent?: string;
    public vrijemeRecept?: Time;
    public vrijediDo?: Date;
    public iznosRecept?: string;
    public oznaka?: string;

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
        //Spremam naziv primarne dijagnoze
        if(response.nazivPrimarna){
            this.nazivPrimarna = response.nazivPrimarna;
        }
        //Spremam naziv proizvoda
        if(response.proizvod){
            this.proizvod = response.proizvod;
        }
        //Spremam ID pacijenta čiji je recept
        if(response.idPacijent){
            this.idPacijent = +response.idPacijent;
        }
        //Spremam vrijeme kada je nastao recept
        if(response.vrijemeRecept){
            this.vrijemeRecept = response.vrijemeRecept;
        }
        //Spremam doziranje recepta
        if(response.doziranje){
            this.doziranje = response.doziranje;
        }
        //Spremam količinu recepta
        if(response.kolicina){
            this.kolicina = response.kolicina;
        }
        //Spremam šifre sek. dijagnoza
        if(response.mkbSifraSekundarna){
            this.mkbSifraSekundarna = response.mkbSifraSekundarna;
        }
        //Spremam ponovljivost recepta
        if(response.ponovljiv){
            this.ponovljivost = response.ponovljiv;
        }
        //Spremam OJP
        if(response.oblikJacinaPakiranjeLijek){
            this.oblikJacinaPakiranjeLijek = response.oblikJacinaPakiranjeLijek;
        }
        //Spremam broj ponavljanja
        if(response.brojPonavljanja){
            this.brojPonavljanja = response.brojPonavljanja;
        }
        //Spremam šifru specijalista
        if(response.sifraSpecijalist){
            this.sifraSpecijalist = +response.sifraSpecijalist;
        }
        if(response.specijalist){
            this.cijeliSpecijalist = response.specijalist;
        }
        //Spremam podatak je li recept hitan
        if(response.hitnost){
            this.hitnost = response.hitnost;
        }
        //Spremam ID recepta
        if(response.idRecept){
            this.idRecept = +response.idRecept;
        }
        //Spremam iznos recepta
        if(response.iznosRecept){
            this.iznosRecept = response.iznosRecept;
        }
        else if(!response.iznosRecept){
            this.iznosRecept = '0.00';
        }
        //Spremam oznaku recepta
        if(response.oznaka){
            this.oznaka = response.oznaka;
        }
    }
}
