import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { LijecnikService } from '../lijecnik.service';

@Component({
  selector: 'app-azuriranje-lozinka',
  templateUrl: './azuriranje-lozinka.component.html',
  styleUrls: ['./azuriranje-lozinka.component.css']
})
export class AzuriranjeLozinkaComponent implements OnInit, OnDestroy {

  //Varijabla u kojoj pohranjujem pretplatu
  subs: Subscription;
  //Oznaka je li postoji odgovor backenda
  response: boolean = false;
  //Varijabla u kojoj spremam odgovor backenda
  responsePoruka: string = null;
  //Oznaka je li se spinner vrti
  isLoading: boolean = false;
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
    this.route.params.subscribe(
      (params: Params) => {
        this.idLijecnik = +params['id'];
      }
    );

  }
  //Metoda koja se pokeće kada se klikne button "Ažuriraj"
  onSubmit(form: NgForm){
    if(!form.valid){
      return;
    }

    //Pokrećem spinner
    this.isLoading = true;

    //Pretplaćujem se na Observable koju vraća metoda editPassword() iz servisa
    this.subs = this.lijecnikService.editPassword(this.idLijecnik,form.value.trenutnaLozinka, form.value.novaLozinka, form.value.potvrdaNovaLozinka).subscribe(
      (response) => {
        //Zaustavljam spinner
        this.isLoading = false;
        //Označavam da postoji odgovor servera
        this.response = true;
        //Spremam odgovor servera
        this.responsePoruka = response["message"];
      }
    );
    form.reset();

  }
  //Metoda koja se pokreće kada se zatvori prozor odgovora backenda
  onClose(){
    //Zatvori prozor
    this.response = false;
  }

  ngOnDestroy(){
    //Ako postoji aktivna pretplata
    if(this.subs){
      //Izađi iz pretplate
      this.subs.unsubscribe();
    }
  }

}
