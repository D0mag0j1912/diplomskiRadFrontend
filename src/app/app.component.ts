import { Component, OnInit } from '@angular/core';
import { LoginService } from './login/login.service';
import { ObradaService } from './shared/obrada/obrada.service';
import { PreglediService } from './shared/obrada/pregledi/pregledi.service';
import { SharedService } from './shared/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  constructor(
      //Dohvaćam login servis
      private loginService: LoginService,
      //Dohvaćam servis obrade
      private obradaService: ObradaService,
      //Dohvaćam servis prethodnih pregleda
      private preglediService: PreglediService,
      //Dohvaćam shared servis
      private sharedService: SharedService
  ){}

  //Kada se komponenta loada, poziva se ova metoda
  ngOnInit(){
      //Pozivam metodu refreshLogin() da provjerim stanje prijave korisnika
      this.loginService.refreshLogin();
      //Pozivam metodu koja čuva ID obrade koji se šalje u komponentu "PrikaziPovijestBolesti"
      this.obradaService.refreshPodatciObrada();
      //Pozivam metodu koja čuva informaciju je li novi pregled dodan (ta informacija treba "SekundarniHeaderComponent" kada se klikne "Pregledi")
      this.preglediService.refreshOnDodanPregled();
      //Pozivam metodu koja će sačuvati ID-ove pacijenata kojima je dodana povijest bolesti kada pacijent NIJE aktivan
      this.sharedService.refreshPacijentiIDs();
      //Pozivam metodu koja će sačuvati vrijednost cijene pregleda
      this.sharedService.cuvajCijenuPregleda();
  }

}
