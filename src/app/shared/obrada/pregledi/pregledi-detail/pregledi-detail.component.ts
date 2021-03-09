import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-pregledi-detail',
  templateUrl: './pregledi-detail.component.html',
  styleUrls: ['./pregledi-detail.component.css']
})
export class PreglediDetailComponent implements OnInit, OnDestroy{
    //Spremam pretplate
    pretplate = new Subject<boolean>();
    //Deklariram formu
    forma: FormGroup;

    constructor(
        //Dohvaćam route
        private route: ActivatedRoute
    ) { }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit(){

        //Pretplaćivam se na podatke Resolvera
        this.route.data.pipe(
            tap(pregledi => {
                console.log(pregledi);
            }),
            takeUntil(this.pretplate)
        ).subscribe();
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplate.next(true);
        this.pretplate.complete();
    }

}
