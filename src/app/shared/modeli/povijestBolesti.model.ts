import { Time } from "@angular/common";

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
        if(response.vrijeme){
            this.vrijeme = response.vrijeme;
        }
        if(response.tip){
            this.tip = response.tip;
        }
    }
    set sekundarne(sekundarneDijagnoze: string){
        this.sekundarneDijagnoze = sekundarneDijagnoze;
    }
}