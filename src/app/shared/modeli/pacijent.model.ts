export class Pacijent{
    constructor(
        public id: number,
        public ime: string,
        public prezime: string,
        public spol: string,
        public starost: number,
        public datRod: string,
        public adresa: string,
        public pbr: number,
        public mobitel: string,
        public bracnoStanje: string,
        public radniStatus: string,
        public status: string,
        public oib: string,
        public datKreir: Date,
        public mbo: number,
        public email: string
    ){}
}