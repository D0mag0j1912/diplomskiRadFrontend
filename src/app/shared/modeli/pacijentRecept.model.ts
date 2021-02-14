export class PacijentRecept{
    idPacijent: number;
    imePrezimePacijent?: string;
    //Metoda koja preuzima podatke sa backenda i sprema u moje varijable 
    constructor(response: any){
        if(response.Pacijent){
            this.imePrezimePacijent = response.Pacijent;
        }
        if(response.idPacijent){
            this.idPacijent = response.idPacijent;
        }
    }
}