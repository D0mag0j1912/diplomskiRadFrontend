export class ZdravstveniPodatci{
    constructor(
        public nositeljOsiguranja: string,
        public drzavaOsiguranja: string,
        public kategorijaOsiguranja: string,
        public podrucniUred: string,
        public mbo: string,
        public trajnoOsnovno: string,
        public osnovnoOd: Date,
        public osnovnoDo: Date,
        public brIskDopunsko: string,
        public dopunskoOd: Date,
        public dopunskoDo: Date,
        public oslobodenParticipacije: string,
        public clanakParticipacija: string,
        public trajnoParticipacija: string,
        public participacijaDo: Date
    ){}
}