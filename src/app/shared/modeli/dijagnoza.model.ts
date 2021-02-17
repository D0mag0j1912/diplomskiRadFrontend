export class Dijagnoza{
    public mkbSifra: string;
    public imeDijagnoza: string;
    constructor(response: any){
        if(response.mkbSifra){
            this.mkbSifra = response.mkbSifra;
        }
        if(response.imeDijagnoza){
            this.imeDijagnoza = response.imeDijagnoza;
        }
    }
}