export class Uzorak {
    public eritrociti: number;
    public hemoglobin: number;
    public hematokrit: number;
    public mcv: number;
    public mch: number;
    public mchc: number;
    public rdw: number;
    public leukociti: number;
    public trombociti: number;
    public mpv: number;
    public trombokrit: number;
    public pdw: number;
    public neutrofilniGranulociti: number;
    public monociti: number;
    public limfociti: number;
    public eozinofilniGranulociti: number;
    public bazofilniGranulociti: number;
    public retikulociti: number;
    public idUputnica?: number;

    constructor(response: any){
        if(response.idUputnica){
            this.idUputnica = +response.idUputnica;
        }
        if(response.eritrociti){
            this.eritrociti = +response.eritrociti;
        }
        if(response.hemoglobin){
            this.hemoglobin = +response.hemoglobin;
        }
        if(response.hematokrit){
            this.hematokrit = +response.hematokrit;
        }
        if(response.mcv){
            this.mcv = +response.mcv;
        }
        if(response.mch){
            this.mch = +response.mch;
        }
        if(response.mchc){
            this.mchc = +response.mchc;
        }
        if(response.rdw){
            this.rdw = +response.rdw;
        }
        if(response.leukociti){
            this.leukociti = +response.leukociti;
        }
        if(response.trombociti){
            this.trombociti = +response.trombociti;
        }
        if(response.mpv){
            this.mpv = +response.mpv;
        }
        if(response.trombokrit){
            this.trombokrit = +response.trombokrit;
        }
        if(response.pdw){
            this.pdw = +response.pdw;
        }
        if(response.neutrofilniGranulociti){
            this.neutrofilniGranulociti = +response.neutrofilniGranulociti;
        }
        if(response.monociti){
            this.monociti = +response.monociti;
        }
        if(response.limfociti){
            this.limfociti = +response.limfociti;
        }
        if(+response.eozinofilniGranulociti >= 0){
            this.eozinofilniGranulociti = +response.eozinofilniGranulociti;
        }
        if(+response.bazofilniGranulociti >= 0){
            this.bazofilniGranulociti = +response.bazofilniGranulociti;
        }
        if(response.retikulociti){
            this.retikulociti = +response.retikulociti;
        }
    }
}
