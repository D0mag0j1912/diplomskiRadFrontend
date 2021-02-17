export class PodrucniUred{
    public sifUred: number;
    public nazivSluzbe: string;
    public regionalniUred: string;
    constructor(response: any){
        if(response.sifUred){
            this.sifUred = response.sifUred;
        }
        if(response.nazivSluzbe){
            this.nazivSluzbe = response.nazivSluzbe;
        }
        if(response.regionalniUred){
            this.regionalniUred = response.regionalniUred;
        }
    }
}