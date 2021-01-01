import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';
import { LijecnikService } from '../lijecnik.service';

@Component({
  selector: 'app-lijecnik-azuriraj-pacijenta',
  templateUrl: './lijecnik-azuriraj-pacijenta.component.html',
  styleUrls: ['./lijecnik-azuriraj-pacijenta.component.css']
})
export class LijecnikAzurirajPacijentaComponent implements OnInit, OnDestroy {
  //Oznaka je li spinner aktivan
  isLoading: boolean = false;
  //Oznaka je li postoji odgovor servera
  response: boolean = false;
  //Spremam odgovor servera
  responsePoruka: string = null;
  //Spremam pretplatu
  subs: Subscription;
  subsAzuriranje: Subscription;
  //Kreiram objekt pacijenta da mogu u njega dohvatiti podatke sa servera
  pacijent: Pacijent;
  //Oznaka je li pacijent muškarac ili žena
  gender: string;
  //Spremam ID pacijenta
  idPacijent: number;

  constructor(
    //Dohvaćam podatke iz trenutnog URL-a
    private route: ActivatedRoute,
    //Dohvaćam liječnički servis
    private lijecnikService: LijecnikService,
    //Dohvaćam router
    private router: Router
  ) {}

  //Ova metoda se poziva kada se komponenta inicijalizira
  ngOnInit() {
    //Pretplaćujem se na podatke što je Resolver poslao 
    this.subs = this.route.data.subscribe(
      (data: {podatci: Pacijent}) => {
        //U objekt pacijenta spremam podatke sa servera
        this.pacijent = data.podatci;
        //Spremam ID pacijenta
        this.idPacijent = this.pacijent[0].idPacijent;
        //Ako je spol pacijent "male"
        if(this.pacijent[0].spolPacijent == 'male'){
            this.gender = 'male'; 
        }
        //Ako je spol pacijenta "female"
        else{
            this.gender = 'female';
        }
      }
    );
  } 

  //Ova metoda se poziva kada se klikne button "Ažuriraj"
  onSubmit(form: NgForm){

    if(!form.valid){
      return;
    }
    //Pokrećem spinner
    this.isLoading = true;
    //Pretplaćujem se na Observable koji je servis vratio 
    this.subsAzuriranje = this.lijecnikService.editPatient(this.idPacijent,form.value.ime,form.value.prezime,form.value.email,form.value.spol, form.value.starost).subscribe(
        (response) => {
            //Gasim spinner
            this.isLoading = false;
            //Označavam da ima odgovora servera
            this.response = true;
            //Spremam odgovor servera
            this.responsePoruka = response["message"];
        }
    );
  }

  //Ova metoda se poziva kada korisnik klikne button "Close"
  onClose(){
    //Zatvori prozor odgovora servera
    this.response = false;
  }

  //Ova metoda se poziva kada se komponenta uništi
  ngOnDestroy(){
    //Ako postoji pretplata
    if(this.subs){
      //Izađi iz pretplate
      this.subs.unsubscribe();
    }
    //Ako postoji pretplata
    if(this.subsAzuriranje){
      //Izađi iz pretplate
      this.subsAzuriranje.unsubscribe();
    }
  }

  //Kada korisnik klikne button "Natrag":
  onBack(){
    //Vrati korisnika natrag na početnu stranicu pretrage
    this.router.navigate(['../../pocetna'], {relativeTo: this.route});
  }
}
