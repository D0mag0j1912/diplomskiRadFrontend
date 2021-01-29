import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Korisnik } from 'src/app/shared/modeli/korisnik.model';
import { MedSestraService } from '../med-sestra.service';

@Component({
  selector: 'app-med-sestra-azuriranje-podatci',
  templateUrl: './med-sestra-azuriranje-podatci.component.html',
  styleUrls: ['./med-sestra-azuriranje-podatci.component.css']
})
export class MedSestraAzuriranjePodatciComponent implements OnInit, OnDestroy{
  
    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Kreiram varijablu u kojoj označavam postoji li odgovor servera
    response: boolean = false;
    //Kreiram varijablu u kojoj spremam odgovor servera
    responsePoruka: string = null;
    //Kreiram objekt tipa Korisnik u kojemu će se nalaziti svi osobni podatci medicinske sestre
    osobniPodatci: Korisnik;
    //Varijabla u koju spremam ID medicinske sestre
    idMedSestra: number;

    constructor(
      //Dohvaćam podatke koje je Resolver poslao routu
      private route: ActivatedRoute,
      //Dohvaćam servis medicinske sestre
      private medSestraService: MedSestraService
    ) { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){

      //Dohvaćam podatke iz Resolvera
      this.route.data.pipe(
          takeUntil(this.pretplateSubject)
      ).subscribe(
          (data: {podatci: Korisnik}) => {
              this.osobniPodatci = data.podatci;
              //Dohvaćam ID medicinske sestre
              this.idMedSestra = this.osobniPodatci[0].idMedSestra;
      });
      
    }

    //Kada se klikne button "Ažuriraj"
    onSubmit(form: NgForm){

      //Ako forma nije validna
      if(!form.valid){
        return;
      }

      //Pretplaćujem se na Observable koji je vratio podatke za ažuriranje osobnih podataka
      this.medSestraService.editPersonalData(this.idMedSestra,form.value.email,form.value.ime,form.value.prezime,form.value.adresa,form.value.specijalizacija).pipe(
          takeUntil(this.pretplateSubject),
          tap(
            (response) => {
              //Ako postoji odgovor
              if(response){
                //Označavam da ima odgovora servera
                this.response = true;
                //Spremam odgovor servera
                this.responsePoruka = response["message"];
              }    
            }
          )  
      ).subscribe();
    }

    //Kada se klikne "Close" na prozoru odgovora
    onClose(){
      //Zatvori prozor
      this.response = false;
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

}
