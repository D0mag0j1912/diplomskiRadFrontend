import { Time } from "@angular/common";

/* export interface Recept{
    idRecept?: number;
    mkbSifraPrimarna: string;
    mkbSifraSekundarna?: string[];
    proizvod: string;
    oblikJacinaPakiranjeLijek?:string;
    kolicina?: string;
    doziranje?: string;
    dostatnost: string;
    hitnost?: string;
    ponovljivost?: string;
    brojPonavljanja?: string;
    sifraSpecijalist?: number;
    idPacijent?: number;
    imePrezimePacijent?: string;
    datumRecept: Date;
    vrijemeRecept?: Time;
} */
export class Recept{
    private mkbSifraPrimarna: string;
    private proizvod: string;
    private dostatnost: string;
    private datumRecept: Date;
    private mkbSifraSekundarna?: string[];
    private idRecept?: number;
    private oblikJacinaPakiranjeLijek?:string;
    private kolicina?: string;
    private doziranje?: string;
    private hitnost?: string;
    private ponovljivost?: string;
    private brojPonavljanja?: string;
    private sifraSpecijalist?: number;
    private idPacijent?: number;
    private imePrezimePacijent?: string;
    private vrijemeRecept?: Time;
    constructor(response: any){
        this.datumRecept = response.Datum;
        this.imePrezimePacijent = response.Pacijent;
        this.dostatnost = response.dostatnost;
        this.mkbSifraPrimarna = response.mkbSifraPrimarna;
        this.proizvod = response.proizvod;
    }
}
