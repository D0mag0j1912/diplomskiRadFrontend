import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { LijecnikService } from '../lijecnik.service';

@Component({
  selector: 'app-azuriranje-lozinka',
  templateUrl: './azuriranje-lozinka.component.html',
  styleUrls: ['./azuriranje-lozinka.component.css']
})
export class AzuriranjeLozinkaComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li postoji odgovor backenda
    response: boolean = false;
    //Varijabla u kojoj spremam odgovor backenda
    responsePoruka: string = null;
    //Spremam ID liječnika
    idLijecnik: number;

    constructor(
      //Dohvaćam liječnički servis
      private lijecnikService: LijecnikService,
      //Dohvaćam podatke iz URL-a
      private route: ActivatedRoute
    ) { }

    //Metoda koja se pokreće kada se komponenta inicijalizira
    ngOnInit() {

      //Dohvaćam ID liječnika iz URL-a
      this.route.params.pipe(
          takeUntil(this.pretplateSubject),
          tap(
            (params: Params) => {
              this.idLijecnik = +params['id'];
            }
          )
      ).subscribe();

    }
    //Metoda koja se pokeće kada se klikne button "Ažuriraj"
    onSubmit(form: NgForm){

        if(!form.valid){
          return;
        }
        //Pretplaćujem se na Observable koju vraća metoda editPassword() iz servisa
        this.lijecnikService.editPassword(this.idLijecnik,form.value.trenutnaLozinka, form.value.novaLozinka, form.value.potvrdaNovaLozinka).pipe(
            takeUntil(this.pretplateSubject),
            tap(
              (response) => {
                //Označavam da postoji odgovor servera
                this.response = true;
                //Spremam odgovor servera
                this.responsePoruka = response["message"];
                form.reset();
              }
            )
        ).subscribe();

    }
    //Metoda koja se pokreće kada se zatvori prozor odgovora backenda
    onClose(){
      //Zatvori prozor
      this.response = false;
    }

    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

}
