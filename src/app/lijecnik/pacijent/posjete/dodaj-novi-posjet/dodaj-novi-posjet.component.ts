import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
import { Posjet } from 'src/app/shared/modeli/posjet.model';
import { PosjeteService } from '../posjete.service';

@Component({
  selector: 'app-dodaj-novi-posjet',
  templateUrl: './dodaj-novi-posjet.component.html',
  styleUrls: ['./dodaj-novi-posjet.component.css']
})
export class DodajNoviPosjetComponent implements OnInit, OnDestroy {

    //Označavam je li spinner aktivan
    isLoading: boolean = false;
    //Označavam je li ima odgovora servera
    response: boolean = false;
    //Spremam odgovor servera
    responsePoruka: string = null;

    //Spremam pretplatu
    subs: Subscription;
    //Dohvaćam trenutni datum
    datum = new Date();
    //Kreiram polje dijagnoza
    dijagnoze: Dijagnoza[];
    //Kreiram objekt tipa "Posjet"
    posjet: Posjet;
    //Inicijaliziram svoju formu
    forma: FormGroup;

    constructor(
      //Dohvaćam servis posjeta
      private posjetService: PosjeteService,
      //Dohvaćam route
      private route: ActivatedRoute
    ) { }

    //Ova metoda se aktivira kada se komponenta inicijalizira
    ngOnInit() {

      //Dohvaćam podatke (dijagnoze) koje je Resolver poslao
      this.route.data.subscribe(
        (data: {podatci: Dijagnoza[]})=> {
          //Spremam dijagnoze iz baze u svoje polje
          this.dijagnoze = data.podatci;
        }
      );

      //Buildam svoju formu
      this.forma = new FormGroup({
        'datum': new FormControl(this.datum, Validators.required),
        'razlog': new FormControl(null),
        'anamneza': new FormControl(null),
        'status': new FormControl(null),
        'dijagnoza': new FormArray([
          new FormControl(this.dijagnoze[0].imeDijagnoza,Validators.required)]),
        'preporuka': new FormControl(null)
      });
    }

    //Ova metoda se aktivira kada korisnik klikne button "Dodaj"
    onSubmit(){
      
      //Kreiram novi objekt tipa "Posjet"
      this.posjet = new Posjet(
                    this.forma.controls['datum'].value,
                    this.forma.controls['dijagnoza'].value,
                    this.forma.controls['razlog'].value,
                    this.forma.controls['anamneza'].value,
                    this.forma.controls['status'].value,
                    this.forma.controls['preporuka'].value); 
      //Pretplaćujem se na Observable u kojemu se nalazi odgovor servera na dodavanje novog posjeta
      this.subs = this.posjetService.addVisit(this.posjet).subscribe(
        (response) => {
          console.log(response);
        }
      ); 
      
    }

    //Kada korisnik klikne "Close" na prozoru odgovora servera
    onClose(){
      //Zatvori prozor
      this.response = false;
    }

    //Dohvaća pojedine form controlove unutar polja 
    getControls(){
      return (this.forma.get('dijagnoza') as FormArray).controls;
    }

    //Kada se klikne button "Dodaj dijagnozu"
    onAddDiagnosis(){
      (<FormArray>this.forma.get('dijagnoza')).push(
        new FormControl(this.dijagnoze[0].imeDijagnoza, Validators.required) 
      );
    }

    //Kada se klikne button "X"
    onDeleteDiagnosis(index: number){
      (<FormArray>this.forma.get('dijagnoza')).removeAt(index);
    }

    ngOnDestroy(){
      //Ako postoji pretplata
      if(this.subs){
        //Izađi iz pretplate
        this.subs.unsubscribe();
      }
    }
}
