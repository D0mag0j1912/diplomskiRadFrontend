import { Time } from "@angular/common";

export class OtvoreniSlucaj {
    public datumPregled: Date;
    public vrijemePregled: Time;
    public tipSlucaj: string;
    public nazivPrimarna?: string;
    public mkbSifraPrimarna?: string;
    public mkbSifraSekundarna?: string;
    public nazivSekundarna?: string;
    public prosliPregled?: number;

    constructor(response: any){
        if(response.mkbSifraPrimarna){
            this.mkbSifraPrimarna = response.mkbSifraPrimarna;
        }
        if(response.Datum){
            this.datumPregled = response.Datum;
        }
        if(response.vrijemePregled){
            this.vrijemePregled = response.vrijemePregled;
        }
        if(response.NazivPrimarna){
            this.nazivPrimarna = response.NazivPrimarna;
        }
        if(response.tipSlucaj){
            this.tipSlucaj = response.tipSlucaj;
        }
        if(response.mkbSifraSekundarna){
            this.mkbSifraSekundarna = response.mkbSifraSekundarna;
        }
        if(response.NazivSekundarna){
            this.nazivSekundarna = response.NazivSekundarna;
        }
        if(response.prosliPregled){
            this.prosliPregled = +response.prosliPregled;
        }
    }
}
