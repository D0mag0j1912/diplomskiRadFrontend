import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LijecnikService } from '../lijecnik.service';

@Component({
  selector: 'app-lijecnik-dodaj-pacijenta',
  templateUrl: './lijecnik-dodaj-pacijenta.component.html',
  styleUrls: ['./lijecnik-dodaj-pacijenta.component.css']
})
export class LijecnikDodajPacijentaComponent implements OnInit, OnDestroy {
  //Spremam pretplatu
  subs: Subscription;
  //Oznaka je li spinner aktivan
  isLoading: boolean = false;
  //Oznaka je li ima odgovora servera
  response:boolean = false;
  //Spremam odgovor servera
  responsePoruka: string = null;
  constructor(
    //Dohvaćam router
    private router: Router,
    //Dohvaćam trenutni URL
    private route: ActivatedRoute,
    //Dohvaćam liječnički servis
    private lijecnikService: LijecnikService
  ) { }

  //Ova metoda se pokreće kada se komponenta inicijalizira
  ngOnInit() {
  }

  //Kada se klikne button "Dodaj pacijenta"
  onSubmit(form: NgForm){

    //Ako forma nije u redu:
    if(!form.valid){
      return;
    }
    //Pokrećem spinner
    this.isLoading = true;

    //Pretplaćujem se na Observable koji je backend vratio za dodavanje novog pacijenta
    this.subs = this.lijecnikService.addPatient(form.value.ime, form.value.prezime, form.value.email, form.value.spol, form.value.starost).subscribe(
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

  //Kada korisnik klikne "Close" na prozoru odgovora servera
  onClose(){
    //Zatvori prozor
    this.response = false;
  }

  //Kada korisnik klikne button "Natrag"
  onBack(){
    this.router.navigate(['../pocetna'], {relativeTo: this.route});
  }

  //Ova metoda se pokreće kada se komponenta uništi
  ngOnDestroy(){
    //Ako postoji pretplata
    if(this.subs){
      //Izađi iz pretplate
      this.subs.unsubscribe();
    }
  }
}
