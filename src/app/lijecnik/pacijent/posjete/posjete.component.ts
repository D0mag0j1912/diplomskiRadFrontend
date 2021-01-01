import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-posjete',
  templateUrl: './posjete.component.html',
  styleUrls: ['./posjete.component.css']
})
export class PosjeteComponent implements OnInit {
  //Označavam je li spinner aktivan
  isLoading: boolean = false;
  //Označavam koja je opcija default
  selected: string = "sveposjete";
  //Trenutni datum
  trenutniDatum = new Date();

  constructor(
    //Dohvaćam router
    private router: Router,
    //Dohvaćam trenutni route
    private route: ActivatedRoute
  ){}


  //Ova metoda se poziva kada se komponenta inicijalizira
  ngOnInit(){
    
  }

  //Ova metoda se poziva kada korisnik promijeni dropdown opciju
  onChange(izbor: string){

  }

  //Ova metoda se poziva kada korisnik klikne button "Pretraži" posjete po datumu
  onSubmit(form: NgForm){
    console.log(form.value.pocetniDatum);
    console.log(form.value.zavrsniDatum);
  }

  //Kada se klikne button "Dodaj posjet"
  onAddVisit(){
    //Preusmjeri korisnika na dodavanje posjeta
    this.router.navigate(['dodajPosjet'], {relativeTo: this.route});
  }
}
