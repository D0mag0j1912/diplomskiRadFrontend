export class Mjesto{
    public pbrMjesto: number;
    public nazivMjesto: string;
    constructor(response: any){
        if(response.pbrMjesto){
            this.pbrMjesto = response.pbrMjesto;
        }
        else if(response.pbrMjestoPacijent){
            this.pbrMjesto = response.pbrMjestoPacijent;
        }
        else if(response.pbrZdrUst){
            this.pbrMjesto = response.pbrZdrUst;
        }
        if(response.nazivMjesto){
            this.nazivMjesto = response.nazivMjesto;
        }
    }
}