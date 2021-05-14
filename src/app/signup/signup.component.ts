import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { ZdravstveniRadnik } from '../shared/modeli/zdravstveniRadnik.model';
import { SignupService } from './signup.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Inicijalizacija boolean varijable za postojanje responsa
    response: boolean = false;
    //Varijabla koja pohranjuje vrijednost odgovora backenda
    responsePoruka: string = null;
    //Kreiram formu
    forma: FormGroup;
    //Spremam sve specijalizacije
    specijalizacije: ZdravstveniRadnik[] = [];

    //Kreiram instancu servisa
    constructor(
        //Dohvaćam signup servis
        private signupService: SignupService,
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam router
        private router: Router
    ) {}

    //Kada se komponenta loada, poziva se ova metoda
    ngOnInit() {
        //Pretplaćivam se na specijalizacije
        this.route.data.pipe(
            map(podatci => podatci.specijalizacije),
            tap(podatci => {
                let obj;
                for(const spec of podatci){
                    obj = new ZdravstveniRadnik(spec);
                    this.specijalizacije.push(obj);
                }
                this.forma = new FormGroup({
                    'tip': new FormControl('lijecnik',[Validators.required]),
                    'ime': new FormControl(null,[Validators.required]),
                    'prezime': new FormControl(null,[Validators.required]),
                    'adresa': new FormControl(null,[Validators.required]),
                    'specijalizacija': new FormControl(null,[Validators.required]),
                    'email': new FormControl(null, [Validators.required, Validators.email]),
                    'lozinka': new FormControl(null, [Validators.required]),
                    'ponovnoLozinka': new FormControl(null, [Validators.required])
                });
            }),
            takeUntil(this.pretplateSubject)
        ).subscribe();
    }

    //Kada ova komponenta čuje event od Alert komponente, vraća response varijablu na false i gasi se prozor
    onClose(){
        this.response = false;
        //Preusmjeravam se na login stranicu
        this.router.navigate(['/login']);
    }

    //Kada se klikne button "Registriraj se":
    onSubmit(){
        //Još jedna provjera da vidim je li forma valjana
        if(!this.forma.valid){
            return;
        }
        //Pozivam metodu signup() iz servisa
        this.signupService.signup(
            this.tip.value,
            this.ime.value,
            this.prezime.value,
            this.adresa.value,
            this.specijalizacija.value,
            this.email.value,
            this.lozinka.value,
            this.ponovnoLozinka.value
        ).pipe(
            tap((response) => {
                //Odgovor backenda => true
                this.response = true;
                //Vrijednost odgovora backenda se sprema u varijablu "responsePoruka"
                this.responsePoruka = response['message'];
                //Ako je server vratio uspješnu poruku
                if(response.success === "true"){
                    //Resetiram formu
                    this.forma.reset();
                }
            })
        ).subscribe();
    }

    //Metoda koja je poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

    get tip(): FormControl{
        return this.forma.get('tip') as FormControl;
    }
    get ime(): FormControl{
      return this.forma.get('ime') as FormControl;
    }
    get prezime(): FormControl{
      return this.forma.get('prezime') as FormControl;
    }
    get adresa(): FormControl{
      return this.forma.get('adresa') as FormControl;
    }
    get specijalizacija(): FormControl{
      return this.forma.get('specijalizacija') as FormControl;
    }
    get email(): FormControl{
      return this.forma.get('email') as FormControl;
    }
    get lozinka(): FormControl{
      return this.forma.get('lozinka') as FormControl;
    }
    get ponovnoLozinka(): FormControl{
      return this.forma.get('ponovnoLozinka') as FormControl;
    }
}
