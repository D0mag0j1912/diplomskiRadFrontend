import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LijecnikService } from '../lijecnik.service';

@Component({
  selector: 'app-pocetna',
  templateUrl: './pocetna.component.html',
  styleUrls: ['./pocetna.component.css']
})
export class PocetnaComponent implements OnInit, OnDestroy {
  
    //Varijabla za pohranu pretplate
    subs: Subscription;
    subsPrikaziSve: Subscription;
    //Oznaka da ima odgovora servera
    response: boolean = false;
    //Spremam odgovor servera
    responsePoruka: string = null;
    //Oznaka je li spinner aktivan
    isLoading: boolean = false;
    //Indikator je li korisnik izabrao opciju "Ime/prezime"
    isImePrezime: boolean = false;
    //Indikator je li korisnik izabrao opciju "MBO"
    isMBO: boolean = false;

    //Oznaka je li se prikaziva ispis pacijenata
    isIspis: boolean = false;

    @ViewChild('forma') forma: NgForm;
    @ViewChild('ime') ime: ElementRef;
    @ViewChild('prezime') prezime: ElementRef;
    @ViewChild('mbo') mbo : ElementRef;

    constructor(
      //Dohvaćam router zbog preusmjeravanja
      private router: Router,
      //Dohvaćam trenutni URL
      private route: ActivatedRoute,
      //Dohvaćam liječnički servis
      private lijecnikService: LijecnikService
    ) { }

    //Metoda koja se poziva inicijaliziranjem komponente
    ngOnInit() {

    }

    //Metoda koja se poziva klikom na button "Pretraži"
    onSubmit(form: NgForm){
      //Ako forma nije validna
      if(!form.valid){
        return;
      } 
      //Aktiviram spinner
      this.isLoading = true;
      
      //Pretplaćujem se na Observable koji je vratila metoda getPatients() da mogu dohvatiti odgovor servera
      this.subs = this.lijecnikService.getPatient(form.value.ime,form.value.prezime,form.value.mbo).subscribe(
        (response) => {
          //Prekidam spinner
          this.isLoading = false;
          //Ako je server poslao uspješnu poruku
          if(response["success"] != "false"){
            //Odgovor servera spremi u Subject 
            this.lijecnikService.pacijenti.next(response);
            //Omogući prikaz tablice ispod komponente pretrage
            this.isIspis = true;
          }
          //Ako je server poslao neuspješnu poruku
          else{
            //Označavam da ima odgovora servera
            this.response = true;
            //Spremam odgovor servera 
            this.responsePoruka = response["message"];
          }
        }
      ); 
        
    }

    //Metoda koja se poziva kada liječnik klikne na button "Prikaži sve"
    onPrikaziSve(){
      //Aktiviram spinner
      this.isLoading = true;

      //Pretplaćujem se na Observable u kojem se nalaze svi registrirani pacijenti
      this.subsPrikaziSve = this.lijecnikService.getAllPatients().subscribe(
        (response) => {
            //Gasim spinner
            this.isLoading = false;

            //Ako je odgovor servera negativan tj. nema pacijenata u sustavu
            if(response["success"] == "false"){
              //Označavam da ima odgovora servera
              this.response = true;
              //Spremam poruku servera
              this.responsePoruka = response["message"];
            }
            //Ako ima pronađenih pacijenata
            else{
              //U Subject stavljam novu vrijednost pacijenata 
              this.lijecnikService.pacijenti.next(response);
              //Omogućavam prikaz tablice pacijenata ispod pretrage
              this.isIspis = true;
            }
        }
      );
    }

    //Metoda za zatvaranje prozora odgovora
    onClose(){
      //Zatvori prozor
      this.response = false;
    }

    //Metoda se pokreće kada korisnik promijeni vrijednost u dropdownu
    onChange(value: string){

      //Ako je korisnik izabrao opciju "mbo"
      if(value == 'mbo'){
        this.isMBO = true;
        this.isImePrezime = false;
        //Resetiraj polja imena i prezimena
        this.forma.controls['ime'].reset();
        this.forma.controls['prezime'].reset();
      }
      //Ako je korisnik izabrao opciju "MBO"
      else if(value == 'ime/prezime'){
        this.isImePrezime = true;
        this.isMBO = false;
        //Resetiraj polje MBO
        this.forma.controls['mbo'].reset();
      }
      
    }  

    //Ova metoda se pokreće kada korisnik stisne gumb "Dodaj pacijenta"
    onDodajPacijenta(){
      //Preusmjeri korisnika na stranicu dodavanja pacijenta
      this.router.navigate(['../dodajPacijenta'], {relativeTo: this.route});
      //Gasim prikaz tablice 
      this.isIspis = false;
    }

    ngOnDestroy(){
      //Ako postoji pretplata
      if(this.subs){
        //Izađi iz pretplate
        this.subs.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsPrikaziSve){
        //Izađi iz pretplate
        this.subsPrikaziSve.unsubscribe();
      }
      //Gasim prikaz tablice
      this.isIspis = false;
    }

    //Metoda koja gasi prikaz tablice
    onCloseTablica(){
      //Gasi prikaz tablice
      this.isIspis = false;
    }
}
