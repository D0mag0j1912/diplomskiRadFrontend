import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-posjete-list',
  templateUrl: './posjete-list.component.html',
  styleUrls: ['./posjete-list.component.css']
})
export class PosjeteListComponent implements OnInit {

  constructor() { }

  //Ova metoda se pokreće kada se komponenta inicijalizira
  ngOnInit(){
  }

  //Ova metoda se pokreće kada korisnik klikne sliku "Pretraži posjet"
  onSubmit(form: NgForm){
    console.log(form.value.pretraziPosjet);
  }

}
