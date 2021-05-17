import { Time } from "@angular/common";
import { Pacijent } from "./pacijent.model";

export class Pregled {
    public nacinPlacanja: string;
    public tipSlucaj: string;
    public datum: Date;
    public vrijeme: Time;
    public idPregled?: number;
    public tip?: string;
    public mkbSifraPrimarna?: string;
    public primarnaDijagnoza?: string;
    public nazivDrzave?: string;
    public oznakaOsiguranika?: string;
    public mkbSifraSekundarna?: string;
    public nazivPrimarna?: string;
    public _pacijent?: Pacijent;
    public mboAktivniPacijent?: string;

    constructor(response: any){
        if(response.idPregled){
            this.idPregled = +response.idPregled;
        }
        if(response.nacinPlacanja){
            this.nacinPlacanja = response.nacinPlacanja;
        }
        if(response.oznakaOsiguranika){
            this.oznakaOsiguranika = response.oznakaOsiguranika;
        }
        if(response.nazivDrzave){
            this.nazivDrzave = response.nazivDrzave;
        }
        if(response.primarnaDijagnoza){
            this.primarnaDijagnoza = response.primarnaDijagnoza;
        }
        if(response.mkbSifraPrimarna){
            this.mkbSifraPrimarna = response.mkbSifraPrimarna;
        }
        if(response.tipSlucaj){
            this.tipSlucaj = response.tipSlucaj;
        }
        if(response.datumPregled){
            this.datum = response.datumPregled;
        }
        else if(response.Datum){
            this.datum = response.Datum;
        }
        if(response.vrijemePregled){
            this.vrijeme = response.vrijemePregled;
        }
        if(response.tip){
            this.tip = response.tip;
        }
        if(response.mkbSifraSekundarna){
            this.mkbSifraSekundarna = response.mkbSifraSekundarna;
        }
        if(response.NazivPrimarna){
            this.nazivPrimarna = response.NazivPrimarna;
        }
        if(response.mboAktivniPacijent){
            this.mboAktivniPacijent = response.mboAktivniPacijent;
        }
    }

    set pacijent(response: any){
        this._pacijent = new Pacijent(response);
    }

}
