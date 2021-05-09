export class ReferentnaVrijednost {
    public atribut: string;
    public min: number;
    public max: number;

    constructor(response: any){
        if(response.atribut){
            this.atribut = response.atribut;
        }
        if(+response.min >= 0){
            this.min = +response.min;
        }
        if(+response.max >= 0){
            this.max = +response.max;
        }
    }

}
