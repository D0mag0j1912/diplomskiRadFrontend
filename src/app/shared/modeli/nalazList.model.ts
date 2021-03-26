export class NalazList {
    public idNalaz: number;
    public datumNalaz: Date;
    public idZdrUst: number;
    public nazivZdrUst: string;
    public mkbSifraPrimarna: string;
    public nazivPrimarna: string;

    constructor(response: any){
        if(response.idNalaz){
            this.idNalaz = +response.idNalaz;
        }
        if(response.datumNalaz){
            this.datumNalaz = response.datumNalaz;
        }
        if(response.idZdrUst){
            this.idZdrUst = +response.idZdrUst;
        }
        if(response.nazivZdrUst){
            this.nazivZdrUst = response.nazivZdrUst;
        }
        if(response.mkbSifraPrimarna){
            this.mkbSifraPrimarna = response.mkbSifraPrimarna;
        }
        if(response.imeDijagnoza){
            this.nazivPrimarna = response.imeDijagnoza;
        }
    }
}