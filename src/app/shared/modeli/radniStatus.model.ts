export class RadniStatus{
    public idRadniStatus: number;
    public nazivRadniStatus: string;
    constructor(response: any){
        if(response.idRadniStatus){
            this.idRadniStatus = response.idRadniStatus;
        }
        if(response.nazivRadniStatus){
            this.nazivRadniStatus = response.nazivRadniStatus;
        }
    }
}