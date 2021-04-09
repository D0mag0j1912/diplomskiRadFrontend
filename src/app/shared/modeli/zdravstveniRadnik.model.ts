export class ZdravstveniRadnik{
    public sifraSpecijalist: number;
    public tipSpecijalist: string;

    constructor(response: any){
        if(response.sifraSpecijalist){
            this.sifraSpecijalist = +response.sifraSpecijalist;
        }
        if(response.tipSpecijalist){
            this.tipSpecijalist = response.tipSpecijalist;
        }
    }
}
