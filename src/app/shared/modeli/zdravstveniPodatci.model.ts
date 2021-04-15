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
    public brojIskazniceDopunsko?: string;
    public drzavaOsiguranja?: string;
    public mboPacijent?: string;
    public opisOsiguranika?: string;

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
        if(response.brojIskazniceDopunsko){
            this.brojIskazniceDopunsko = response.brojIskazniceDopunsko;
        }
        if(response.drzavaOsiguranja){
            this.drzavaOsiguranja = response.drzavaOsiguranja;
        }
        if(response.mboPacijent){
            this.mboPacijent = response.mboPacijent;
        }
        if(response.opisOsiguranika){
            this.opisOsiguranika = response.opisOsiguranika;
        }
    }
}
