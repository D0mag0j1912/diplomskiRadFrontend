import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { MedSestraService } from 'src/app/med-sestra/med-sestra.service';
import { LijecnikService } from '../../lijecnik/lijecnik.service';

@Component({
  selector: 'app-azuriranje-lozinka',
  templateUrl: './azuriranje-lozinka.component.html',
  styleUrls: ['./azuriranje-lozinka.component.css']
})
export class AzuriranjeLozinkaComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li postoji odgovor backenda
    response: boolean = false;
    //Varijabla u kojoj spremam odgovor backenda
    responsePoruka: string = null;
    //Spremam ID liječnika
    idLijecnik: number;
    //Spremam ID medicinske sestre
    idMedSestra: number;
    //Definiram formu
    forma: FormGroup;

    constructor(
        //Dohvaćam liječnički servis
        private lijecnikService: LijecnikService,
        //Dohvaćam podatke iz URL-a
        private route: ActivatedRoute,
        //Dohvaćam servis medicinske sestre
        private medSestraService: MedSestraService,
        //Dohvaćam login servis
        private loginService: LoginService
    ) { }

    //Metoda koja se pokreće kada se komponenta inicijalizira
    ngOnInit() {

      //Kreiram formu
      this.forma = new FormGroup({
          'trenutnaLozinka': new FormControl(null, [Validators.required]),
          'novaLozinka': new FormControl(null, [Validators.required]),
          'ponovnoNovaLozinka': new FormControl(null, [Validators.required])
      });
      //Pretplaćivam se na tip korisnika
      this.loginService.user.pipe(
          take(1),
          switchMap(user => {
              return this.route.params.pipe(
                  tap((params: Params) => {
                      //Ako je tip korisnika "lijecnik"
                      if(user.tip === "lijecnik"){
                          this.idLijecnik = +params['id'];
                      }
                      //Ako je tip korisnika "sestra":
                      else{
                          this.idMedSestra = +params['id'];
                      }
                  })
              );
          })
      ).subscribe();

    }
    //Metoda koja se pokeće kada se klikne button "Ažuriraj"
    onSubmit(){
        //Ako forma nije valjana
        if(!this.forma.valid){
          return;
        }

        //Ako je definiran ID liječnika:
        if(this.idLijecnik){
            //Pretplaćujem se na Observable koji vraća odgovor servera
            this.lijecnikService.editPassword(this.idLijecnik,this.trenutnaLozinka.value,
                this.novaLozinka.value, this.ponovnoNovaLozinka.value).pipe(
                tap(
                    (response) => {
                        //Označavam da postoji odgovor servera
                        this.response = true;
                        //Spremam odgovor servera
                        this.responsePoruka = response["message"];
                        //Resetiraj formu
                        this.forma.reset();
                    }
                )
            ).subscribe();
        }
        //Ako je definiran ID med. sestre
        else if(this.idMedSestra){
            //Pretplaćujem se na Observable koji vraća odgovor servera
            this.medSestraService.editPassword(this.idMedSestra,this.trenutnaLozinka.value,
                this.novaLozinka.value, this.ponovnoNovaLozinka.value).pipe(
                tap(response => {
                    //Označavam da postoji odgovor servera
                    this.response = true;
                    //Spremam odgovor servera
                    this.responsePoruka = response["message"];
                    //Resetiraj formu
                    this.forma.reset();
                })
            ).subscribe();
        }
    }
    //Metoda koja se pokreće kada se zatvori prozor odgovora backenda
    onClose(){
      //Zatvori prozor
      this.response = false;
    }

    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

    get trenutnaLozinka(): FormControl{
        return this.forma.get('trenutnaLozinka') as FormControl;
    }
    get novaLozinka(): FormControl{
        return this.forma.get('novaLozinka') as FormControl;
    }
    get ponovnoNovaLozinka(): FormControl{
        return this.forma.get('ponovnoNovaLozinka') as FormControl;
    }
}
