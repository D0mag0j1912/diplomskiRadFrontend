import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Korisnik } from '../shared/modeli/korisnik.model';

@Component({
  selector: 'app-lijecnik',
  templateUrl: './lijecnik.component.html',
  styleUrls: ['./lijecnik.component.css']
})
export class LijecnikComponent implements OnInit, OnDestroy {
    //Spremam pretplatu za resolver
    subs: Subscription;
    //Polje u koje spremam osobne podatke liječnika
    osobniPodatci: Korisnik;
    constructor(
      //Dohvaćam route na kojemu se nalaze osobni podatci liječnika koje je Resolver poslao
      private route: ActivatedRoute
    ){}

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit(){
        this.subs = this.route.data.subscribe(
          (data: {podatci: Korisnik}) => {
            this.osobniPodatci = data.podatci;
          }
        );
    } 

    ngOnDestroy(){
      //Ako postoji pretplata
      if(this.subs){
        //Izađi iz pretplate
        this.subs.unsubscribe();
      }
    }

}
