export class DrzavaOsiguranja{
    public nazivDrzave: string;
    constructor(response: any){
        if(response.nazivDrzave){
            this.nazivDrzave = response.nazivDrzave;
        }
        else if(response.drzavaOsiguranja){
            this.nazivDrzave = response.drzavaOsiguranja;
        }
    }
}