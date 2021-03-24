export class Korisnik{
    public idKorisnik?: number;
    public idLijecnik?: number;
    public idMedSestra?: number;
    public tip?: string;
    public email?: string;
    private _tokenExpirationDate?: Date;
    public lozinka?: string;
    private _token?: string;
    public ime?: string;
    public prezime?: string;
    public adresa?: string;
    public specijalizacija?: string;
    public ponovnoLozinka?: string;
    public datKreir?: string;
    constructor(response: any){
        if(response.idKorisnik){
            this.idKorisnik = +response.idKorisnik;
        }
        if(response.tip){
            this.tip = response.tip;
        }
        if(response.email){
            this.email = response.email;
        }
        if(response._tokenExpirationDate){
            this._tokenExpirationDate = response._tokenExpirationDate;
        }
        if(response.lozinka){
            this.lozinka = response.lozinka;
        }
        else if(response.pass){
            this.lozinka = response.pass;
        }
        if(response._token){
            this._token = response._token;
        }
        //Ako je tip korisnika "lijecnik":
        if(response.tip === "lijecnik"){
            if(response.idLijecnik){
                this.idLijecnik = +response.idLijecnik;
            }
            if(response.imeLijecnik){
                this.ime = response.imeLijecnik;
            }
            if(response.prezLijecnik){
                this.prezime = response.prezLijecnik;
            }
            if(response.adrLijecnik){
                this.adresa = response.adrLijecnik;
            }
            if(response.tipSpecijalist){
                this.specijalizacija = response.tipSpecijalist;
            }
            if(response.datKreirLijecnik){
                this.datKreir = response.datKreirLijecnik;
            }
        }
        //Ako je tip korisnika "sestra":
        else if(response.tip === "sestra"){
            if(response.idMedSestra){
                this.idMedSestra = +response.idMedSestra;
            }
            if(response.imeMedSestra){
                this.ime = response.imeMedSestra;
            }
            if(response.prezMedSestra){
                this.prezime = response.prezMedSestra;
            }
            if(response.adrMedSestra){
                this.adresa = response.adrMedSestra;
            }
            if(response.tipSpecijalist){
                this.specijalizacija = response.tipSpecijalist;
            }
            if(response.datKreirMedSestra){
                this.datKreir = response.datKreirMedSestra;
            }
        }
        if(response.ponovnoLozinka){
            this.ponovnoLozinka = response.ponovnoLozinka;
        }

    }

    get token(){
        //Ako rok trajanja tokena ne postoji ILI je istekao rok trajanja (Ako je današnji datum veći od datuma tokena)
        if(!this._tokenExpirationDate || new Date() > this._tokenExpirationDate){
            return null;
        }
        //Ako token ima rok trajanja I nije mu istekao rok trajanja I token je prisutan
        return this._token;
    }
}