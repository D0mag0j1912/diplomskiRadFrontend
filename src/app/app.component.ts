import { Component, OnInit } from '@angular/core';
import { LoginService } from './login/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  constructor(
    private loginService: LoginService
  ){}

  //Kada se komponenta loada, poziva se ova metoda
  ngOnInit(){
    //Pozivam metodu refreshLogin() da provjerim stanje prijave korisnika
    this.loginService.refreshLogin();

    //Praznim local storage i Subject inicijaliziram na null da nema prijavljenih korisnika
    //localStorage.removeItem('userData');
    //this.loginService.user.next(null);
  }
  
}
