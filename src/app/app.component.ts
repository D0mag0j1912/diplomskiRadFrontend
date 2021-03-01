import { Component, OnInit } from '@angular/core';
import { PovijestBolestiService } from './lijecnik/povijest-bolesti/povijest-bolesti.service';
import { ListaReceptiService } from './lijecnik/recept/lista-recepti/lista-recepti.service';
import { PacijentiService } from './lijecnik/recept/pacijenti/pacijenti.service';
import { LoginService } from './login/login.service';
import { ObradaService } from './shared/obrada/obrada.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  constructor(
      //Dohvaćam login servis
      private loginService: LoginService,
      //Dohvaćam servis povijesti bolesti
      private povijestBolestiService: PovijestBolestiService,
      //Dohvaćam servis pacijenata
      private listaReceptiService: ListaReceptiService,
      //Dohvaćam servis obrade
      private obradaService: ObradaService,
      //Dohvaćam servis pacijenata (recepti)
      private pacijentiService: PacijentiService
  ){}

  //Kada se komponenta loada, poziva se ova metoda
  ngOnInit(){
      //Pozivam metodu refreshLogin() da provjerim stanje prijave korisnika
      this.loginService.refreshLogin();
      //Pozivam metodu koja čuva podatke je li pacijentu unesen povijest bolesti
      this.povijestBolestiService.refreshIsObraden();
      this.listaReceptiService.refreshPrijenosnikUListuRecepata();
      this.obradaService.refreshPodatciObrada();
      this.pacijentiService.refreshPrijenosnikUTablicuPacijenata();
  }
  
}
