import { Time } from "@angular/common";
import { Pacijent } from "./pacijent.model";
import { Recept } from "./recept.model";
import { Uputnica } from "./uputnica.model";

export class PovijestBolesti {
    public idPovijestBolesti: number;
    public razlogDolaska: string;
    public anamneza: string;
    public tipSlucaj: string;
    public datum: Date;
    public vrijeme: Time;
    public tip?: string;
    public sekundarneDijagnoze?: string;
    public terapija?: string;
    public preporukaLijecnik?: string;
    public napomena?: string;
    public mkbSifraPrimarna?: string;
    public primarnaDijagnoza?: string;
    public statusPacijent?: string;
    public nalaz?: string;
    public mkbSifraSekundarna?: string;
    public nazivPrimarna?: string;
    public _recept?: Recept;
    public _uputnica?: Uputnica;
    public _pacijent?: Pacijent;
    public mboAktivniPacijent?: string;
    public _godina?: string;
    public prosliPregled?: number;

    constructor(response: any){
        if(response.idPovijestBolesti){
            this.idPovijestBolesti = +response.idPovijestBolesti;
        }
        if(response.razlogDolaska){
            this.razlogDolaska = response.razlogDolaska;
        }
        if(response.anamneza){
            this.anamneza = response.anamneza;
        }
        if(response.statusPacijent){
            this.statusPacijent = response.statusPacijent;
        }
        if(response.nalaz){
            this.nalaz = response.nalaz;
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
        if(response.terapija){
            this.terapija = response.terapija;
        }
        if(response.preporukaLijecnik){
            this.preporukaLijecnik = response.preporukaLijecnik;
        }
        if(response.napomena){
            this.napomena = response.napomena;
        }
        if(response.datum){
            this.datum = response.datum;
        }
        else if(response.Datum){
            this.datum = response.Datum;
        }
        if(response.Godina){
            this._godina = response.Godina;
        }
        if(response.vrijeme){
            this.vrijeme = response.vrijeme;
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
        if(response.prosliPregled){
            this.prosliPregled = +response.prosliPregled;
        }
        if(response.mboAktivniPacijent){
            this.mboAktivniPacijent = response.mboAktivniPacijent;
        }
    }
    set sekundarne(sekundarneDijagnoze: string){
        this.sekundarneDijagnoze = sekundarneDijagnoze;
    }

    set recept(response: any){
        this._recept = new Recept(response);
    }

    set uputnica(response: any){
        this._uputnica = new Uputnica(response);
    }

    set pacijent(response: any){
        this._pacijent = new Pacijent(response);
    }

    set godina(godina: string){
        this._godina = godina;
    }
}
