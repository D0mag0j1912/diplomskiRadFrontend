import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { MedSestraService } from '../med-sestra.service';

@Component({
  selector: 'app-med-sestra-azuriranje-lozinka',
  templateUrl: './med-sestra-azuriranje-lozinka.component.html',
  styleUrls: ['./med-sestra-azuriranje-lozinka.component.css']
})
export class MedSestraAzuriranjeLozinkaComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li imamo odgovor od servera
    response: boolean = false;
    //Spremam odgovor servera
    responsePoruka: string = null;
    //Varijabla u koju spremam ID medicinske sestre
    idMedSestra: number;

    constructor(
      //Dohvaćam servis medicinske sestre
      private medSestraService: MedSestraService,
      //Dohvaćam trenutni URL
      private route: ActivatedRoute
    ) { }

    //Metoda se pokreće kada se komponenta inicijalizira
    ngOnInit() {

        //Dohvaćam ID medicinske sestre iz URL-a 
        this.route.params.pipe(
            tap(
                (params: Params) => {
                  this.idMedSestra = params['id'];  
                }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }

    //Metoda se pokreće kada se klikne button "Ažuriraj"
    onSubmit(form: NgForm){
      if(!form.valid){
        return;
      }

      //Pretplaćujem se na Observable koju vraća metoda editPassword() iz servisa
      this.medSestraService.editPassword(this.idMedSestra,form.value.trenutnaLozinka, form.value.novaLozinka, form.value.potvrdaNovaLozinka).pipe(
          tap(
            (response) => {
              //Označavam da postoji odgovor servera
              this.response = true;
              //Spremam odgovor servera
              this.responsePoruka = response["message"];
              form.reset();
            }
          ),
          takeUntil(this.pretplateSubject)
      ).subscribe();
    }


    //Metoda koja inicijalizira zatvaranje prozora
    onClose(){
      //Zatvori prozor odgovora servera
      this.response = false;
    }

    //Metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}
