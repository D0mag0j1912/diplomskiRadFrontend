export class ZdravstvenaUstanova {
    public naziv: string;
    public adresa?: string;
    public telefon?: string;
    public id?: string;
    public idUputnica?: number;
    public lijecnik?: string;
    constructor(response: any){
        if(response.Lijecnik){
            this.lijecnik = response.Lijecnik;
        }
        if(response.adresaZdrUst){
            this.adresa = response.adresaZdrUst;
        }
        if(response.brojTelZdrUst){
            this.telefon = response.brojTelZdrUst;
        }
        if(response.idZdrUst){
            this.id = response.idZdrUst;
        }
        if(response.nazivZdrUst){
            this.naziv = response.nazivZdrUst;
        }
        if(response.idUputnica){
            this.idUputnica = +response.idUputnica;
        }
    }
}
