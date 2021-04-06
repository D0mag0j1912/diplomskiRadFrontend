import { Time } from "@angular/common";
import { Recept } from "./recept.model";

export class PovijestBolesti {
    public idPovijestBolesti: number;
    public razlogDolaska: string;
    public anamneza: string;
    public statusPacijent: string;
    public nalaz: string;
    public primarnaDijagnoza: string;
    public mkbSifraPrimarna: string;
    public tipSlucaj: string;
    public terapija: string;
    public preporukaLijecnik: string;
    public napomena: string;
    public datum: Date;
    public vrijeme: Time;
    public sekundarneDijagnoze: string;
    public tip: string;
    public mkbSifraSekundarna?: string;
    public nazivPrimarna?: string;
    public _recept?: Recept;
    public _godina?: string;

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
    }
    set sekundarne(sekundarneDijagnoze: string){
        this.sekundarneDijagnoze = sekundarneDijagnoze;
    }

    set recept(response: any){
        this._recept = new Recept(response);
    }

    set godina(godina: string){
        this._godina = godina;
    }
}