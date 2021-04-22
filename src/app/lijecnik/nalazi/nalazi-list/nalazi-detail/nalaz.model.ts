export class Nalaz {
    public imePrezimeSpecijalist: string;
    public idZdrUst: number;
    public nazivZdrUst: string;
    public adresaZdrUst: string;
    public pbrZdrUst: number;
    public zdravstvenaDjelatnost: string;
    public primarnaDijagnoza: string;
    public misljenjeSpecijalist: string;
    public datumNalaz: Date;
    public _sekundarneDijagnoze: string[] = [];

    constructor(response: any){
        if(response.specijalist){
            this.imePrezimeSpecijalist = response.specijalist;
        }
        if(response.idZdrUst){
            this.idZdrUst = +response.idZdrUst;
        }
        if(response.nazivZdrUst){
            this.nazivZdrUst = response.nazivZdrUst;
        }
        if(response.adresaZdrUst){
            this.adresaZdrUst = response.adresaZdrUst;
        }
        if(response.pbrZdrUst){
            this.pbrZdrUst = +response.pbrZdrUst;
        }
        if(response.zdravstvenaDjelatnost){
            this.zdravstvenaDjelatnost = response.zdravstvenaDjelatnost;
        }
        if(response.primarnaDijagnoza){
            this.primarnaDijagnoza = response.primarnaDijagnoza;
        }
        if(response.misljenjeSpecijalist){
            this.misljenjeSpecijalist = response.misljenjeSpecijalist;
        }
        if(response.datumNalaz){
            this.datumNalaz = response.datumNalaz;
        }
    }

    set sekundarneDijagnoze(dijagnoza: string){
        this._sekundarneDijagnoze.push(dijagnoza);
    }
}