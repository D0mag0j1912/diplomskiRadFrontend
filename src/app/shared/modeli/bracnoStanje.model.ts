export class BracnoStanje{
    public idBracnoStanje: number;
    public nazivBracnoStanje: string;
    constructor(response: any){
        if(response.idBracnoStanje){
            this.idBracnoStanje = response.idBracnoStanje;
        }
        if(response.nazivBracnoStanje){
            this.nazivBracnoStanje = response.nazivBracnoStanje;
        }
    }
}