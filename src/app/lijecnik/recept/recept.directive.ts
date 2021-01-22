import { Directive, ElementRef, HostListener, Output,EventEmitter, Input } from "@angular/core";
@Directive({
    selector: '[appOutsideClick]'
})
export class ReceptDirective{
    //Emitira event prema komponenti svaki puta kada je klik ostvaren izvan liste pretrage
    @Output() clickedOutside = new EventEmitter<any>();
    //Dohvaćam "isPretraga<Lijek/MagPripravak><Osnovna/Dopunska>lista" varijablu
    @Input('isPretraga') isPretraga: boolean;
    //Dohvaćam tip proizvoda (lijek/mag.pripravak)
    @Input('tip') tip: string;
    //Dohvaćam host element
    constructor(private el: ElementRef){}
    //Slušam klikove na cijelom dokumentu
    @HostListener("document:click",['$event.target']) clickHandler(target){
        //Ako je otvorena lista pretrage lijeka ili mag. pripravka
        if(this.isPretraga){
            //Ako je element hostan na lijekovima osnovne liste
            if(this.tip === 'lijekOL'){
                console.log("hostan sam na lijekovima osnovne liste");
                //Ako host element NE SADRŽI element na koji je liječnik kliknuo (ako mu nisu djeca)
                if(!this.el.nativeElement.contains(target)){
                    //Emitiram event prema roditeljskoj komponenti
                    this.clickedOutside.emit("lijekOL");
                }
            }
            //Ako je element hostan na lijekovima dopunske liste
            else if(this.tip === 'lijekDL'){
                console.log("Hostan sam na lijekovima dopunske liste!");
                //Ako host element NE SADRŽI element na koji je liječnik kliknuo (ako mu nisu djeca)
                if(!this.el.nativeElement.contains(target)){
                    //Emitiram event prema roditeljskoj komponenti
                    this.clickedOutside.emit("lijekDL");
                }
            }
            //Ako je element hostan na magistralnim pripravcima osnovne liste
            else if(this.tip === 'magPripravakOL'){
                console.log("Hostan sam na magistralnim pripravcima osnovne liste!");
                //Ako host element NE SADRŽI element na koji je liječnik kliknuo (ako mu nisu djeca)
                if(!this.el.nativeElement.contains(target)){
                    //Emitiram event prema roditeljskoj komponenti
                    this.clickedOutside.emit("magPripravakOL");
                }
            }
            //Ako je element hostan na magistralnim pripravcima dopunske liste
            else if(this.tip === 'magPripravakDL'){
                console.log("Hostan sam na magistralnim pripravcima dopunske liste!");
                //Ako host element NE SADRŽI element na koji je liječnik kliknuo (ako mu nisu djeca)
                if(!this.el.nativeElement.contains(target)){
                    //Emitiram event prema roditeljskoj komponenti
                    this.clickedOutside.emit("magPripravakDL");
                }
            }
        }
    }
}