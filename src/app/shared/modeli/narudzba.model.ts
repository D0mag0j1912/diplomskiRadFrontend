import { Time } from "@angular/common";

export class Narudzba{
    constructor(
        public idNarucivanje: number,
        public idPacijent: number,
        public datumNarucivanje: Date,
        public vrijemeNarucivanje: Time,
        public napomenaNarucivanje: string    
    ){}
}