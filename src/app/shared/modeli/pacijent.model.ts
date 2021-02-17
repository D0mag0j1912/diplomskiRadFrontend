export class Pacijent{
    public id?: number;
    public ime?: string;
    public prezime?: string;
    public datRod?: string;
    public mbo?: string;
    public adresa?: string;
    public pbr?: number;
    public mobitel?: string;
    public bracnoStanje?: string;
    public radniStatus?: string;
    public status?: string;
    public oib?: string;
    public datKreir?: Date;
    public email?: string;
    public spol?: string;
    public brIskDopunsko?: string;
    constructor(response: any){
        if(response.Datum){
            this.datRod = response.Datum;
        }
        else if(response.DatumRodenja){
            this.datRod = response.DatumRodenja;
        }
        else if(response.datRodPacijent){
            this.datRod = response.datRodPacijent;
        }
        if(response.idPacijent){
            this.id = response.idPacijent;
        }
        if(response.imePacijent){
            this.ime = response.imePacijent;
        }
        if(response.prezPacijent){
            this.prezime = response.prezPacijent;
        }
        if(response.imePrezimePacijent){
            const polje = response.imePrezimePacijent.split(' ');
            this.ime = polje[0];
            this.prezime = polje[1];
        }
        if(response.mboPacijent){
            this.mbo = response.mboPacijent;
        }
        if(response.adresaPacijent){
            this.adresa = response.adresaPacijent;
        }
        if(response.bracnoStanjePacijent){
            this.bracnoStanje = response.bracnoStanjePacijent;
        }
        if(response.datKreirPacijent){
            this.datKreir = response.datKreirPacijent;
        }
        if(response.emailPacijent){
            this.email = response.emailPacijent;
        }
        if(response.mobitelPacijent){
            this.mobitel = response.mobitelPacijent;
        }
        if(response.oibPacijent){
            this.oib = response.oibPacijent;
        }
        if(response.radniStatusPacijent){
            this.radniStatus = response.radniStatusPacijent;
        }
        if(response.spolPacijent){
            this.spol = response.spolPacijent;
        }
        if(response.statusPacijent){
            this.status = response.statusPacijent;
        }
        if(response.brojIskazniceDopunsko){
            this.brIskDopunsko = response.brojIskazniceDopunsko;
        }
    }
}