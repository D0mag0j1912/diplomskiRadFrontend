export class KategorijaOsiguranja{
    public oznakaOsiguranika: string;
    public opisOsiguranika: string;
    constructor(response: any){
        if(response.oznakaOsiguranika){
            this.oznakaOsiguranika = response.oznakaOsiguranika;
        }
        else if(response.kategorijaOsiguranja){
            this.oznakaOsiguranika = response.kategorijaOsiguranja;
        }
        if(response.opisOsiguranika){
            this.opisOsiguranika = response.opisOsiguranika;
        }
    }
}