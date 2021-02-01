import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject} from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Korisnik } from '../shared/modeli/korisnik.model';

@Component({
  selector: 'app-lijecnik',
  templateUrl: './lijecnik.component.html',
  styleUrls: ['./lijecnik.component.css']
})
export class LijecnikComponent implements OnInit, OnDestroy {
    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Polje u koje spremam osobne podatke liječnika
    osobniPodatci: Korisnik;
    constructor(
      //Dohvaćam route na kojemu se nalaze osobni podatci liječnika koje je Resolver poslao
      private route: ActivatedRoute
    ){}

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit(){
        this.route.data.pipe(
            takeUntil(this.pretplateSubject),
            tap(
              (data: {podatci: Korisnik}) => {
                  this.osobniPodatci = data.podatci;
            })
        ).subscribe();
    } 

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

}
