export class ZdravstvenaDjelatnost {
    public sifDjelatnosti: number;
    public nazivDjelatnosti: string;

    constructor(response: any){
        if(response.sifDjel){
            this.sifDjelatnosti = +response.sifDjel;
        }
        if(response.nazivDjel){
            this.nazivDjelatnosti = response.nazivDjel;
        }
    }
}