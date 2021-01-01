import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { MedSestraService } from '../med-sestra.service';

@Component({
  selector: 'app-med-sestra-azuriranje-lozinka',
  templateUrl: './med-sestra-azuriranje-lozinka.component.html',
  styleUrls: ['./med-sestra-azuriranje-lozinka.component.css']
})
export class MedSestraAzuriranjeLozinkaComponent implements OnInit {

  //Varijabla u koju spremam pretplatu
  subs: Subscription;
  //Oznaka je li spinner aktivan
  isLoading: boolean = false;
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
    this.route.params.subscribe(
      (params: Params) => {
        this.idMedSestra = params['id'];  
      }
    );
  }

  //Metoda se pokreće kada se klikne button "Ažuriraj"
  onSubmit(form: NgForm){
    if(!form.valid){
      return;
    }

    //Pokrećem spinner
    this.isLoading = true;

    //Pretplaćujem se na Observable koju vraća metoda editPassword() iz servisa
    this.subs = this.medSestraService.editPassword(this.idMedSestra,form.value.trenutnaLozinka, form.value.novaLozinka, form.value.potvrdaNovaLozinka).subscribe(
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


  //Metoda koja inicijalizira zatvaranje prozora
  onClose(){
    //Zatvori prozor odgovora servera
    this.response = false;
  }
}
