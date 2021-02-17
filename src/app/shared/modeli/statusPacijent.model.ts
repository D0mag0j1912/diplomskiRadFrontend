export class StatusPacijent{
    public idStatusPacijent: number;
    public nazivStatusPacijent: string;
    constructor(response: any){
        if(response.idStatusPacijent){
            this.idStatusPacijent = response.idStatusPacijent;
        }
        if(response.nazivStatusPacijent){
            this.nazivStatusPacijent = response.nazivStatusPacijent;
        }
        else if(response.statusPacijent){
            this.nazivStatusPacijent = response.statusPacijent;
        }
    }
}