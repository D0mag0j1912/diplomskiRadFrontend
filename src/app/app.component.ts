import { Component, OnInit } from '@angular/core';
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
      //Dohvaćam servis obrade
      private obradaService: ObradaService
  ){}

  //Kada se komponenta loada, poziva se ova metoda
  ngOnInit(){
      //Pozivam metodu refreshLogin() da provjerim stanje prijave korisnika
      this.loginService.refreshLogin();
      //Pozivam metodu koja čuva ID obrade koji se šalje u komponentu "PrikaziPovijestBolesti"
      this.obradaService.refreshPodatciObrada();
  }
  
}
