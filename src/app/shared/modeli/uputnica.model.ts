export class Uputnica {
    public sifDjel: number;
    public nazivDjel: string;
    public idPacijent: number;
    public imePacijent: string;
    public prezPacijent: string;
    public mboPacijent: string;
    public mkbSifraPrimarna: string;
    public nazivPrimarna: string;
    public vrstaPregled: string;
    public molimTraziSe: string;
    public napomena: string;
    public datum: Date;
    public sifraSpecijalist?: number;
    public tipSpecijalist?: string;
    public idZdrUst?: number;
    public nazivZdrUst?: string;
    public adresaZdrUst?: string;
    public pbrZdrUst?: number;
    public zdravstvenaUstanova?: string;
    public zdravstvenaDjelatnost?: string;
    public specijalist?: string;

    constructor(response: any){
        if(response.sifDjel){
            this.sifDjel = +response.sifDjel;
        }
        if(response.nazivDjel){
            this.nazivDjel = response.nazivDjel;
        }
        if(response.idPacijent){
            this.idPacijent = +response.idPacijent;
        }
        if(response.imePacijent){
            this.imePacijent = response.imePacijent;
        }
        if(response.prezPacijent){
            this.prezPacijent = response.prezPacijent;
        }
        if(response.mboPacijent){
            this.mboPacijent = response.mboPacijent;
        }
        if(response.mkbSifraPrimarna){
            this.mkbSifraPrimarna = response.mkbSifraPrimarna;
        }
        if(response.nazivPrimarna){
            this.nazivPrimarna = response.nazivPrimarna;
        }
        if(response.vrstaPregled){
            this.vrstaPregled = response.vrstaPregled;
        }
        if(response.molimTraziSe){
            this.molimTraziSe = response.molimTraziSe;
        }
        if(response.napomena){
            this.napomena = response.napomena;
        }
        if(response.Datum){
            this.datum = response.Datum;
        }
        if(response.sifraSpecijalist){
            this.sifraSpecijalist = +response.sifraSpecijalist;
        }
        if(response.tipSpecijalist){
            this.tipSpecijalist = response.tipSpecijalist;
        }
        if(response.idZdrUst){
            this.idZdrUst = +response.idZdrUst;
        }
        if(response.nazivZdrUst){
            this.nazivZdrUst = response.nazivZdrUst;
        }
        if(response.adresaZdrUst){
            this.adresaZdrUst = response.adresaZdrUst;
        }
        if(response.pbrZdrUst){
            this.pbrZdrUst = +response.pbrZdrUst;
        }
        if(response.zdravstvenaUstanova){
            this.zdravstvenaUstanova = response.zdravstvenaUstanova;
        }
        if(response.zdravstvenaDjelatnost){
            this.zdravstvenaDjelatnost = response.zdravstvenaDjelatnost;
        }
        if(response.specijalistUputnica){
            this.specijalist = response.specijalistUputnica;
        }
    }
}
