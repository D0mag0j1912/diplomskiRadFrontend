export class ZdravstveniPodatci{
    public dopunskoOd: Date;
    public dopunskoDo: Date;
    public nositeljOsiguranja: string;
    public oslobodenParticipacije: string;
    public osnovnoOd: Date;
    public osnovnoDo: Date;
    public participacijaDo: Date;
    public trajnoOsnovno: string;
    public trajnoParticipacija: string;
    constructor(response: any){
        if(response.dopunskoOsiguranjeOd){
            this.dopunskoOd = response.dopunskoOsiguranjeOd;
        }
        if(response.dopunskoOsiguranjeDo){
            this.dopunskoDo = response.dopunskoOsiguranjeDo;
        }
        if(response.nositeljOsiguranja){
            this.nositeljOsiguranja = response.nositeljOsiguranja;
        }
        if(response.oslobodenParticipacije){
            this.oslobodenParticipacije = response.oslobodenParticipacije;
        }
        if(response.osnovnoOsiguranjeOd){
            this.osnovnoOd = response.osnovnoOsiguranjeOd;
        }
        if(response.osnovnoOsiguranjeDo){
            this.osnovnoDo = response.osnovnoOsiguranjeDo;
        }
        if(response.participacijaDo){
            this.participacijaDo = response.participacijaDo;
        }
        if(response.trajnoOsnovno){
            this.trajnoOsnovno = response.trajnoOsnovno;
        }
        if(response.trajnoParticipacija){
            this.trajnoParticipacija = response.trajnoParticipacija;
        }
    }
}