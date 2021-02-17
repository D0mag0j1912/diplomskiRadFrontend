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
        if(response.nazivMjesto){
            this.nazivMjesto = response.nazivMjesto;
        }
    }
}