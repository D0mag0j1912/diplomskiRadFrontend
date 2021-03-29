import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { NalazList } from 'src/app/shared/modeli/nalazList.model';
import { NalaziDetailService } from './nalazi-detail/nalazi-detail.service';

@Component({
  selector: 'app-nalazi-list',
  templateUrl: './nalazi-list.component.html',
  styleUrls: ['./nalazi-list.component.css']
})
export class NalaziListComponent implements OnInit, OnDestroy{

    //Spremam pretplatu
    pretplata = new Subject<boolean>();
    //Primam nalaze od roditelja
    @Input() nalazi: NalazList[];

    constructor(
        //Dohvaćam servis detalja nalaza
        private nalaziDetailService: NalaziDetailService,
        //Dohvaćam router
        private router: Router,
        //Dohvaćam trenutni route
        private route: ActivatedRoute
    ) { }

    //Ova metoda se pokreće kada se komponenta inicijalizira
    ngOnInit(){
        //Pretplaćujem se na Subject koji dava informaciju kada liječnik želi zatvoriti ovaj prozor
        this.nalaziDetailService.closeObs.pipe(
            tap(isClose => {
                console.log(isClose);
                if(isClose){
                    //Izlazim iz prozora detalja nalaza
                    this.router.navigate(['./'],{relativeTo: this.route});
                }
            }),
            takeUntil(this.pretplata)
        ).subscribe();
    }

    //Metoda koja se poziva kada liječnik klikne na item liste
    onClickItemList(){
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplata.next(true);
        this.pretplata.complete();
    }

}
