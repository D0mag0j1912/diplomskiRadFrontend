export class Participacija{
    public idParticipacija: number;
    public razlogParticipacija: string;
    constructor(response: any){
        if(response.idParticipacija){
            this.idParticipacija = response.idParticipacija;
        }
        if(response.razlogParticipacija){
            this.razlogParticipacija = response.razlogParticipacija;
        }
        else if(response.clanakParticipacija){
            this.razlogParticipacija = response.clanakParticipacija;
        }
    }
}