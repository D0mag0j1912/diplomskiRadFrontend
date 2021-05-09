import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SharedService } from 'src/app/shared/shared.service';
import { UzorciService } from 'src/app/shared/uzorci/uzorci.service';
import { NalazList } from '../nalazList.model';
import {Uzorak} from '../../../shared/uzorci/uzorci.model';
import { ImportService } from 'src/app/shared/import.service';
import {ReferentnaVrijednost} from '../../../shared/uzorci/referentna-vrijednost.model';

@Component({
  selector: 'app-nalazi-list',
  templateUrl: './nalazi-list.component.html',
  styleUrls: ['./nalazi-list.component.css']
})
export class NalaziListComponent implements OnInit, OnDestroy{

    //Spremam pretplatu
    pretplata = new Subject<boolean>();
    //Primam nalaze od roditelja
    @Input() nalazi: NalazList[];
    //Broj spaceova ispod svega
    pom: number[] = [0,1,2,3];
    //Oznaka je li otvoren prozor uzoraka
    isUzorci: boolean = false;
    //Spremam sve uzorke koje je sestra unijela za uputnicu koja je povezana sa nalazom
    poslaniUzorci: Uzorak;
    //Oznaka je li prikazan prozor alerta
    response: boolean = false;
    //Spremam poruku da uzorci još nisu dodani
    porukaAlert: string = null;
    //Spremam sve ref. vrijednosti
    referentneVrijednosti: ReferentnaVrijednost[] = [];

    constructor(
        //Dohvaćam shared servis
        private sharedService: SharedService,
        //Dohvaćam servis uzoraka
        private uzorciService: UzorciService,
        //Dohvaćam import servis
        private importService: ImportService
    ) { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit(){
        console.log(this.nalazi);
    }

    //Metoda koja se aktivira kada liječnik klikne na "Pogledaj uzorke"
    onPogledajUzorke(idNalaz: number, $event){
        $event.stopPropagation();
        //Pretplaćujem se na dohvat uzoraka za ovaj nalaz
        const combined = forkJoin([
            this.uzorciService.getUzorciNalazi(idNalaz),
            this.importService.getReferentneVrijednosti()
        ]).pipe(
            tap(podatci => {
                //Ako IMA uzoraka
                if(podatci[0].length > 0){
                    //Formiram uzorak koji šaljem childu "UzorciComponent"
                    this.poslaniUzorci = new Uzorak(podatci[0][0]);
                    //Otvaram prozor uzoraka
                    this.isUzorci = true;
                    //Emitiram vrijednost prema "UzorciComponent" da se zna da joj je roditelj "NalaziListComponent"
                    this.sharedService.sekundarniIliNalazi.next("nalazi");
                }
                //Ako NEMA uzoraka
                else{
                    //Otvaram prozor alerta
                    this.response = true;
                    //Spremam poruku
                    this.porukaAlert = 'Uzorci još nisu poslani!';
                }
                this.referentneVrijednosti = [];
                let obj;
                for(const vrijednost of podatci[1]){
                    obj = new ReferentnaVrijednost(vrijednost);
                    this.referentneVrijednosti.push(obj);
                }
            })
        ).subscribe();
    }

    //Metoda koja zatvara uzorke
    onCloseUzorci(){
        //Zatvori uzorke
        this.isUzorci = false;
    }

    //Metoda koja zatvara alert
    onCloseAlert(){
        //Zatvori alert
        this.response = false;
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplata.next(true);
        this.pretplata.complete();
    }

}
