import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';
import { PacijentService } from './pacijent.service';

@Component({
  selector: 'app-pacijent',
  templateUrl: './pacijent.component.html',
  styleUrls: ['./pacijent.component.css']
})
export class PacijentComponent implements OnInit {

    //Spremam pretplatu na pacijentove podatke
    subs: Subscription;
    //Spremam ID trenutno aktivnog pacijenta
    idPacijent: number;
    //Kreiram objekt tipa pacijent
    pacijent: Pacijent;

    constructor(
      //Dohvaćam servis pacijenta
      private pacijentService: PacijentService,
      //Dohvaćam trenutni URL
      private route: ActivatedRoute
    ) { }

    //Metoda koja se aktivira kada se komponenta inicijalizira
    ngOnInit() {
      //Dohvaćam ID pacijenta iz URL-a
      this.route.params.subscribe(
        (params: Params) => {
          //Spremam ID trenutno aktivnog pacijenta
          this.idPacijent = params['id'];
        }
      );

      //Pretplaćujem se na podatke koje je Resolver poslao
      this.subs = this.route.data.subscribe(
        (data: {podatci: Pacijent}) => {
          //U svoje polje pacijenata stavljam odgovor Resolvera
          this.pacijent = data.podatci;
        }
      );
    }

}
