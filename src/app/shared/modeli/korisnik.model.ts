export class Korisnik{
    constructor(
        public tip?: string,
        public email?: string,
        private _tokenExpirationDate?: Date,
        public lozinka?: string,
        private _token?: string,
        public ime?: string,
        public prezime?: string,
        public adresa?: string,
        public specijalizacija?: string,
        public ponovnoLozinka?: string,
        public datKreir?: string  
    )
    {}

    get token(){
        //Ako rok trajanja tokena ne postoji ILI je istekao rok trajanja (Ako je današnji datum veći od datuma tokena)
        if(!this._tokenExpirationDate || new Date() > this._tokenExpirationDate){
            return null;
        }
        //Ako token ima rok trajanja I nije mu istekao rok trajanja I token je prisutan
        return this._token;
    }
}