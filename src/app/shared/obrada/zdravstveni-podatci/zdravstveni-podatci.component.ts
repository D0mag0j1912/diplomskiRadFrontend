import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { merge, of, Subject} from 'rxjs';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { DrzavaOsiguranja } from 'src/app/shared/modeli/drzavaOsiguranja.model';
import { KategorijaOsiguranja } from 'src/app/shared/modeli/kategorijaOsiguranja.model';
import { Participacija } from 'src/app/shared/modeli/participacija.model';
import { PodrucniUred } from 'src/app/shared/modeli/podrucniUred.model';
import { ZdravstveniPodatci } from 'src/app/shared/modeli/zdravstveniPodatci.model';
import { Mjesto } from '../../modeli/mjesto.model';
import { Pacijent } from '../../modeli/pacijent.model';
import { RadniStatus } from '../../modeli/radniStatus.model';
import { StatusPacijent } from '../../modeli/statusPacijent.model';
import { ObradaService } from '../obrada.service';
import { ZdravstveniPodatciService } from './zdravstveni-podatci.service';
import * as Handler from './zdravstveni-podatci-handler';
import { SharedService } from '../../shared.service';
import { LoginService } from 'src/app/login/login.service';

@Component({
    selector: 'app-zdravstveni-podatci',
    templateUrl: './zdravstveni-podatci.component.html',
    styleUrls: ['./zdravstveni-podatci.component.css']
})
export class ZdravstveniPodatciComponent implements OnInit, OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Oznaka jesu li podatci aktivni
    isPodatciAktivni: boolean = false;
    //Oznaka je li ima odgovora servera
    response: boolean = false;
    //Spremam odgovor servera
    responsePoruka: string = null;
    //Kreiram svoju formu
    forma: FormGroup;
    //Spremam države osiguranja
    drzave: DrzavaOsiguranja[] = [];
    //Spremam nazive države zbog validacije
    naziviDrzava: string[] = [];
    //Spremam kategorije osiguranja
    katOsiguranja: KategorijaOsiguranja[] = [];
    //Spremam oznake osiguranika zbog validacije
    oznakeOsiguranika: string[] = [];
    //Spremam područne urede
    podrucniUredi: PodrucniUred[] = [];
    //Spremam nazive službi zbog validacije
    naziviSluzbi: string[] = [];
    //Spremam participacije
    participacije: Participacija[] = [];
    //Spremam članke participacije zbog validacije
    razloziParticipacije: string[] = [];
    //Spremam ZDRAVSTVENE podatke pacijenta
    zdrPodatci: ZdravstveniPodatci;
    //Spremam osobne podatke pacijenta
    pacijent: Pacijent;
    //Spremam podatke participacije
    objektParticipacija: Participacija;
    //Spremam naziv države osiguranja
    objektDrzavaOsiguranja: DrzavaOsiguranja;
    //Spremam oznaku kategorije osiguranja
    objektKategorijaOsiguranja: KategorijaOsiguranja;
    //Spremam naziv i šifru područnog ureda
    objektPodrucniUred: PodrucniUred;
    //Spremam podatke mjesta
    objektMjesto: Mjesto;
    //Spremam podatke radnog statusa
    objektRadniStatus: RadniStatus;
    //Spremam podatke statusa pacijenta
    objektStatusPacijent: StatusPacijent;
    //Spremam ID aktivnog pacijenta
    idPacijent: number;

    constructor(
      //Dohvaćam trenutni route
      private route: ActivatedRoute,
      //Dohvaćam servis zdravstvenih podataka
      private zdravstveniPodatciService: ZdravstveniPodatciService,
      //Dohvaćam servis obrade
      private obradaService: ObradaService,
      //Dohvaćam shared servis
      private sharedService: SharedService,
      //Dohvaćam login servis
      private loginService: LoginService
    ) { }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Pretplaćujem se na podatke koje je Resolver poslao
        this.route.data.pipe(
            tap(
              //Dohvaćam podatke
              (response: {podatci: any, zdravstveniPodatci: ZdravstveniPodatci | any}) => {
                console.log(response);
                let objektDrzava;
                //Prolazim kroz odgovor servera
                for(const drzava of response.podatci.drzave){
                    objektDrzava = new DrzavaOsiguranja(drzava);
                    this.drzave.push(objektDrzava);
                }
                //Inicijaliziram varijablu u koju spremam objekte tipa "KategorijaOsiguranja"
                let objektKatOsiguranja;
                //Prolazim poljem dijagnoza sa servera
                for(const kat of response.podatci.kategorijeOsiguranja){
                    objektKatOsiguranja = new KategorijaOsiguranja(kat);
                    this.katOsiguranja.push(objektKatOsiguranja);
                }
                //Kreiram praznu varijablu u kojoj spremam objekte tipa "PodrucniUred"
                let objektPodrucniUred;
                //Prolazim kroz JS objekte područnih ureda
                for(const ured of response.podatci.uredi){
                    //Za svaki odgovor sa servera, kreiraj novi objekt tipa "PodrucniUred"
                    objektPodrucniUred = new PodrucniUred(ured);
                    //Dodaj taj objekt u polje
                    this.podrucniUredi.push(objektPodrucniUred);
                }
                //Kreiram varijablu u koju ću spremati objekte tipa "Participacija"
                let objektParticipacija;
                //Prolazim kroz JS objekte sa servera
                for(const p of response.podatci.participacije){
                    //Za svaki odgovor sa servera, kreiraj novi objekt tipa "Participacija"
                    objektParticipacija = new Participacija(p);
                    //Dodaj taj objekt u polje
                    this.participacije.push(objektParticipacija);
                }
                //Ako je server uspješno vratio zdravstvene podatke
                if(response.zdravstveniPodatci["success"] !== "false"){
                    //Označavam da su podatci aktivni
                    this.isPodatciAktivni = true;
                    //Spremam sve ZDRAVSTVENE podatke u svoje polje
                    this.zdrPodatci = new ZdravstveniPodatci(response.zdravstveniPodatci[0]);
                    this.pacijent = new Pacijent(response.zdravstveniPodatci[0]);
                    this.objektParticipacija = new Participacija(response.zdravstveniPodatci[0]);
                    this.objektDrzavaOsiguranja = new DrzavaOsiguranja(response.zdravstveniPodatci[0]);
                    this.objektKategorijaOsiguranja = new KategorijaOsiguranja(response.zdravstveniPodatci[0]);
                    this.objektPodrucniUred = new PodrucniUred(response.zdravstveniPodatci[0]);
                    this.objektMjesto = new Mjesto(response.zdravstveniPodatci[0]);
                    this.objektRadniStatus = new RadniStatus(response.zdravstveniPodatci[0]);
                    this.objektStatusPacijent = new StatusPacijent(response.zdravstveniPodatci[0]);
                    //Spremam ID pacijenta
                    this.idPacijent = this.pacijent.id;
                }
                //Sve nazive država osiguranja stavljam u posebno polje zbog validacije
                for(let drzava of this.drzave){
                  this.naziviDrzava.push(drzava["nazivDrzave"]);
                }
                //Sve oznake osiguranika stavljam u posebno polje zbog validacije
                for(let oznaka of this.katOsiguranja){
                  this.oznakeOsiguranika.push(oznaka["oznakaOsiguranika"]);
                }
                //Sve nazive službi stavljam u posebno polje zbog validacije
                for(let sluzba of this.podrucniUredi){
                  this.naziviSluzbi.push(sluzba["nazivSluzbe"]);
                }
                //Sve razloge oslobađanja od participacije stavljam u posebno polje zbog validacije
                for(let razlog of this.participacije){
                  this.razloziParticipacije.push(razlog["razlogParticipacija"]);
                }

                //Kreiram svoju formu
                this.forma = new FormGroup({
                  'nositeljOsiguranja': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.nositeljOsiguranja : null, this.isPodatciAktivni ? [Validators.required] : []),
                  'drzavaOsiguranja': new FormControl(this.isPodatciAktivni ? this.objektDrzavaOsiguranja.nazivDrzave : null, this.isPodatciAktivni ? [Validators.required, Handler.isValidDrzavaOsiguranja(this.naziviDrzava)] : []),
                  'kategorijaOsiguranja': new FormControl(this.isPodatciAktivni ? this.objektKategorijaOsiguranja.oznakaOsiguranika : null, this.isPodatciAktivni ? [Validators.required, Handler.isValidKategorijaOsiguranja(this.oznakeOsiguranika)] : []),
                  'podrucniUred': new FormControl(this.isPodatciAktivni ? this.objektPodrucniUred.nazivSluzbe : null, this.isPodatciAktivni ? [Validators.required, Handler.isValidPodrucniUred(this.naziviSluzbi)] : []),
                  'sifUred': new FormControl(this.isPodatciAktivni ? this.objektPodrucniUred.sifUred : null),
                  'mbo': new FormControl(this.isPodatciAktivni ? this.pacijent.mbo : null, this.isPodatciAktivni ? [Validators.required, Validators.pattern("^\\d{9}$")] : []),
                  'trajnoOsnovno': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.trajnoOsnovno : null),
                  'datumiOsnovno': new FormGroup({
                    'osnovnoOd': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.osnovnoOd : null),
                    'osnovnoDo': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.osnovnoDo : null)
                  }, {validators: this.isPodatciAktivni ? Handler.isValidDatumiOsnovno() : null}),
                  'brIskDopunsko': new FormControl(this.isPodatciAktivni ? this.pacijent.brIskDopunsko : null, this.isPodatciAktivni ? [Validators.pattern("^\\d{8}$")] : []),
                  'datumiDopunsko': new FormGroup({
                    'dopunskoOd': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.dopunskoOd : null),
                    'dopunskoDo': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.dopunskoDo : null)
                  }, {validators: this.isPodatciAktivni ? Handler.isValidDatumiDopunsko() : null}),
                  'oslobodenParticipacije': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.oslobodenParticipacije : null),
                  'participacija': new FormGroup({
                    'clanakParticipacija': new FormControl(this.isPodatciAktivni ? this.objektParticipacija.razlogParticipacija : null),
                    'trajnoParticipacija': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.trajnoParticipacija : null),
                    'participacijaDo': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.participacijaDo : null)
                  }, {validators: this.isPodatciAktivni ? [Handler.bothForbiddenParticipacija()] : null}),
                }, {validators: this.isPodatciAktivni ? [Handler.atLeastOneRequiredOsnovno(), Handler.mustOslobodenParticipacija(), Handler.bothForbiddenOsnovno()] : null});
                //Inicijalno onemogućavam unos u polje šifre područnog ureda
                this.forma.controls["sifUred"].disable({emitEvent: false});
              }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe();

        //Ako je pacijent aktivan
        if(this.isPodatciAktivni){

            const combined = merge(
                this.forma.get('podrucniUred').valueChanges.pipe(
                    tap(
                      //Dohvaćam izabranu vrijednost iz dropdowna
                      (value: string) => {
                          //Ako su podatci aktivni
                          if(this.isPodatciAktivni){
                            //Ako korisnik mijenja nazive službi područnih ureda
                            if(this.naziviSluzbi.indexOf(value) !== -1){
                                //Ako je form control ispravan
                                if(this.forma.get('podrucniUred').valid){
                                  //Pozivam metodu
                                  Handler.nazivSluzbeToSif(value, this.forma, this.podrucniUredi);
                                }
                                //Ako nije ispravan
                                else{
                                  //Treba biti prazno
                                  this.forma.get('sifUred').patchValue(null,{emitEvent: false});
                                }
                            }
                          }
                      }
                    ),
                    takeUntil(this.pretplateSubject)
                ),
                this.forma.get('brIskDopunsko').valueChanges.pipe(
                    //Uzimam vrijednost
                    tap(() => {
                            //Ako su podatci aktivni
                            if(this.isPodatciAktivni){
                              //Ako je upisana vrijednost u polje broja iskaznice dopunskog osiguranja
                              if(this.forma.get('brIskDopunsko').value && this.forma.get('brIskDopunsko').valid){
                                  //Omogućavam unos datuma dopunskog osiguranja
                                  this.forma.get('datumiDopunsko.dopunskoOd').enable({emitEvent: false});
                                  this.forma.get('datumiDopunsko.dopunskoDo').enable({emitEvent: false});
                                  //Postavljam validatore na datume dopunskog osiguranja
                                  this.forma.get('datumiDopunsko.dopunskoOd').setValidators([Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]);
                                  this.forma.get('datumiDopunsko.dopunskoDo').setValidators([Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]);
                              }
                              //Ako nije upisana vrijednost u polje broja iskaznice dopunskog osiguranja
                              else{
                                  this.forma.get('datumiDopunsko.dopunskoOd').clearValidators();
                                  this.forma.get('datumiDopunsko.dopunskoDo').clearValidators();
                                  //Onemogućavam unos datuma dopunskog osiguranja
                                  this.forma.get('datumiDopunsko.dopunskoOd').disable({emitEvent: false});
                                  this.forma.get('datumiDopunsko.dopunskoDo').disable({emitEvent: false});
                                  //Resetiram polja datuma
                                  this.forma.get('datumiDopunsko.dopunskoOd').reset();
                                  this.forma.get('datumiDopunsko.dopunskoDo').reset();
                              }
                              this.forma.get('datumiDopunsko.dopunskoOd').updateValueAndValidity({emitEvent: false});
                              this.forma.get('datumiDopunsko.dopunskoDo').updateValueAndValidity({emitEvent: false});
                              this.forma.get('datumiDopunsko').updateValueAndValidity({emitEvent: false});
                            }
                        }
                    ),
                    takeUntil(this.pretplateSubject)
                ),
                this.obradaService.obsZavrsenPregled.pipe(
                    tap(
                      (podatci) => {
                        //Ako su podatci aktivni
                        if(this.isPodatciAktivni){
                          //Ako je pregled završen
                          if(podatci){
                              //Označavam da pacijent više nije aktivan
                              this.isPodatciAktivni = false;
                              //Resetiram formu zdravstvenih podataka pacijenta
                              this.forma.reset();
                              //Uklanjam validatore sa forme
                              this.forma.clearValidators();
                              this.forma.updateValueAndValidity({emitEvent: false});
                              //Za svaki form control u formi
                              for(let field in this.forma.controls){
                                  //Ukloni mu validator i ažuriraj stanje forme
                                  this.forma.get(field).clearValidators();
                                  this.forma.get(field).updateValueAndValidity({emitEvent: false});
                              }
                              //Uklanjam validatore da ostalih formcontrolova
                              this.forma.get('datumiOsnovno.osnovnoOd').clearValidators();
                              this.forma.get('datumiOsnovno.osnovnoDo').clearValidators();
                              this.forma.get('datumiDopunsko.dopunskoOd').clearValidators();
                              this.forma.get('datumiDopunsko.dopunskoDo').clearValidators();
                              this.forma.get('participacija.clanakParticipacija').clearValidators();
                              this.forma.get('participacija.trajnoParticipacija').clearValidators();
                              this.forma.get('participacija.participacijaDo').clearValidators();
                              this.forma.get('datumiOsnovno.osnovnoOd').updateValueAndValidity({emitEvent: false});
                              this.forma.get('datumiOsnovno.osnovnoDo').updateValueAndValidity({emitEvent: false});
                              this.forma.get('datumiDopunsko.dopunskoOd').updateValueAndValidity({emitEvent: false});
                              this.forma.get('datumiDopunsko.dopunskoDo').updateValueAndValidity({emitEvent: false});
                              this.forma.get('participacija.clanakParticipacija').updateValueAndValidity({emitEvent: false});
                              this.forma.get('participacija.trajnoParticipacija').updateValueAndValidity({emitEvent: false});
                              this.forma.get('participacija.participacijaDo').updateValueAndValidity({emitEvent: false});
                          }
                        }
                      }
                    ),
                    takeUntil(this.pretplateSubject)
                )
            ).subscribe();
        }

      }

  //Ova metoda se poziva kada se stisne button "Potvrdi zdravstvene podatke"
  onSubmit(){

      //Ako forma nije valjanja
      if(!this.forma){
          return;
      }

      //Ako je pacijent aktivan
      if(this.isPodatciAktivni){
          this.zdravstveniPodatciService.potvrdiZdravstvenePodatke(this.idPacijent,this.mbo.value,this.nositeljOsiguranja.value,
              this.drzavaOsiguranja.value,this.kategorijaOsiguranja.value,
              this.trajnoOsnovno.value ? "trajnoOsnovno": null,this.osnovnoOd.value,this.osnovnoDo.value,
              this.brIskDopunsko.value,this.dopunskoOd.value,this.dopunskoDo.value,
              this.oslobodenParticipacije.value ? "oslobodenParticipacije": null,this.clanakParticipacija.value,
              this.trajnoParticipacija.value ? "trajnoParticipacija" : null,this.participacijaDo.value,this.sifUred.value).pipe(
              tap(
                //Dohvaćam odgovor servera
                (odgovor) => {
                    //Označavam da ima odgovora servera
                    this.response = true;
                    //Spremam odgovor servera
                    this.responsePoruka = odgovor["message"];
                }
              ),
              mergeMap(odgovor => {
                  //Ako je server vratio uspješnu poruku
                  if(odgovor["success"] === "true"){
                      //Ako pacijent IMA dopunsko osiguranje
                      if(this.brIskDopunsko.value){
                          return this.loginService.user.pipe(
                              tap(user => {
                                  this.sharedService.postaviNovuCijenu(0, user.tip);
                              }),
                              takeUntil(this.pretplateSubject)
                          );
                      }
                      else{
                          return of(null).pipe(
                              takeUntil(this.pretplateSubject)
                          );
                      }
                  }
                  else{
                    return of(null).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                  }
              }),
              takeUntil(this.pretplateSubject)
          ).subscribe();
      }
      //Ako podatci nisu aktivni
      else{
          //Označavam da ima odgovora servera
          this.response = true;
          this.responsePoruka = "Nema aktivnog pacijenta u obradi!";
      }
  }

  //Metoda se poziva kada je trajno osiguranje promijeni svoju vrijednost
  onChecked(event){
    //Ako je pacijent aktivan
    if(this.isPodatciAktivni){
        //Ako je trajno osiguranje checked
        if(event.target.checked){
          //Dižem validatore za datum početka osnovnog osiguranja
          this.osnovnoOd.clearValidators();
          //Dižem validatore za datum završetka osnovnog osiguranja
          this.osnovnoDo.clearValidators();
          //Resetiram polja datuma početka i datuma završetka osnovnog osiguranja
          this.forma.get('datumiOsnovno.osnovnoOd').reset();
          this.forma.get('datumiOsnovno.osnovnoDo').reset();
          //Onemogućavam unos datuma osnovnog osiguranja
          this.forma.get('datumiOsnovno.osnovnoOd').disable({emitEvent: false});
          this.forma.get('datumiOsnovno.osnovnoDo').disable({emitEvent: false});
        }
        //Ako trajno osiguranje nije checked
        else{
          //Omogućavam unos datuma osnovnog osiguranja
          this.forma.get('datumiOsnovno.osnovnoOd').enable({emitEvent: false});
          this.forma.get('datumiOsnovno.osnovnoDo').enable({emitEvent: false});
          //Postavljam validatore na datum početka osnovnog osiguranja
          this.osnovnoOd.setValidators([Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]);
          //Postavljam validatore na datum završetka osnovnog osiguranja
          this.osnovnoDo.setValidators([Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]);
        }
        this.osnovnoOd.updateValueAndValidity({emitEvent: false});
        this.osnovnoDo.updateValueAndValidity({emitEvent: false});
    }
  }

  //Metoda se poziva kada je "Oslobođen participacije" checked
  onCheckedParticipacija(event){
    //Ako je pacijent aktivan
    if(this.isPodatciAktivni){
        //Ako je "Oslobođen participacije" checked
        if(event.target.checked){
          //Postavljam glavnoj formi validaciju za participaciju
          this.forma.setValidators(Handler.atLeastOneRequiredParticipacija());
          //Omogućavam unos članka participacije i postavljam mu validatore
          this.forma.get('participacija.clanakParticipacija').enable({emitEvent: false});
          //Postavljam članku validatore
          this.forma.get('participacija.clanakParticipacija').setValidators([Validators.required, Handler.isValidParticipacija(this.razloziParticipacije)]);
      }
      //Ako "Oslobođen participacije" nije checked":
      else{
          //Resetiram polja participacija
          this.forma.get('participacija.clanakParticipacija').reset();
          this.forma.get('participacija.trajnoParticipacija').reset();
          this.forma.get('participacija.participacijaDo').reset();
          //Onemogućavam unos svim poljima koja se tiču participacije
          this.forma.get('participacija.clanakParticipacija').disable({emitEvent: false});
          this.forma.get('participacija.trajnoParticipacija').disable({emitEvent: false});
          this.forma.get('participacija.participacijaDo').disable({emitEvent: false});
          //Dižem im validatore
          this.forma.get('participacija.clanakParticipacija').clearValidators();
          this.forma.get('participacija.trajnoParticipacija').clearValidators();
          this.forma.get('participacija.participacijaDo').clearValidators();
          this.forma.clearValidators();
      }

      this.forma.get('participacija.clanakParticipacija').updateValueAndValidity({emitEvent: false});
      this.forma.get('participacija.trajnoParticipacija').updateValueAndValidity({emitEvent: false});
      this.forma.get('participacija.participacijaDo').updateValueAndValidity({emitEvent: false});
      this.forma.updateValueAndValidity({emitEvent: false});
    }
  }
  //Metoda se poziva kada korisnik izabere jedan od ponuđenih članaka
  onSelected(event){
    //Ako je pacijent aktivan
    if(this.isPodatciAktivni){
        //Ako je korisnik izabrao neku vrijednost iz dropdowna
        if(event.target.value){
          //Omogući unos trajne participacije i datuma participacije
          this.forma.get('participacija.trajnoParticipacija').enable({emitEvent: false});
          this.forma.get('participacija.participacijaDo').enable({emitEvent: false});
        }
    }
  }

  //Metoda koja se poziva kada je "trajnoParticipacija" checked
  onCheckedTrajnaParticipacija(event){
    //Ako je pacijent aktivan
    if(this.isPodatciAktivni){
        //Ako je trajna participacija checked
        if(event.target.checked){
          //Resetiram polje datuma participacije
          this.forma.get('participacija.participacijaDo').reset();
          //Onemogući unos datuma participacije
          this.forma.get('participacija.participacijaDo').disable({emitEvent: false});
          //Dižem validatore za datum participacije
          this.forma.get('participacija.participacijaDo').clearValidators();
        }
        //Ako trajna participacija nije checked
        else{
          //Ako je "oslobodenParticipacije" checked
          if(this.oslobodenParticipacije.value){
              //Omogući unos datuma participacije
              this.forma.get('participacija.participacijaDo').enable({emitEvent: false});
              //Postavljam validatore na datum participacije
              this.forma.get('participacija.participacijaDo').setValidators([Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]);
          }
        }
        //Primjeni ove promjene
        this.forma.get('participacija.participacijaDo').updateValueAndValidity({emitEvent:false});
    }
  }

  //Ova metoda se poziva kada korisnik ugasi prozor poruke
  onClose(){
    //Zatvori prozor poruke
    this.response = false;
  }

  //Ova metoda se poziva kada se komponenta uništi
  ngOnDestroy(){
    this.pretplateSubject.next(true);
    this.pretplateSubject.complete();
    //Praznim Subject da mi se ulazi u Subscription i dobiva informaciju da je pregled završen iako nije
    this.obradaService.zavrsenPregled.next(false);
  }

  //Definiram gettere za pojedine form controlove
  get nositeljOsiguranja(): FormControl{
    return this.forma.get('nositeljOsiguranja') as FormControl;
  }
  get drzavaOsiguranja(): FormControl{
    return this.forma.get('drzavaOsiguranja') as FormControl;
  }
  get kategorijaOsiguranja(): FormControl{
    return this.forma.get('kategorijaOsiguranja') as FormControl;
  }
  get podrucniUred(): FormControl{
    return this.forma.get('podrucniUred') as FormControl;
  }
  get sifUred(): FormControl{
    return this.forma.get('sifUred') as FormControl;
  }
  get mbo(): FormControl{
    return this.forma.get('mbo') as FormControl;
  }
  get trajnoOsnovno(): FormControl{
    return this.forma.get('trajnoOsnovno') as FormControl;
  }
  get datumiOsnovno(): FormGroup{
    return this.forma.get('datumiOsnovno') as FormGroup;
  }
  get osnovnoOd(): FormControl{
    return this.forma.get('datumiOsnovno.osnovnoOd') as FormControl;
  }
  get osnovnoDo(): FormControl{
    return this.forma.get('datumiOsnovno.osnovnoDo') as FormControl;
  }
  get brIskDopunsko(): FormControl{
    return this.forma.get('brIskDopunsko') as FormControl;
  }
  get datumiDopunsko(): FormGroup{
    return this.forma.get('datumiDopunsko') as FormGroup;
  }
  get dopunskoOd(): FormControl{
    return this.forma.get('datumiDopunsko.dopunskoOd') as FormControl;
  }
  get dopunskoDo(): FormControl{
    return this.forma.get('datumiDopunsko.dopunskoDo') as FormControl;
  }
  get oslobodenParticipacije(): FormControl{
    return this.forma.get('oslobodenParticipacije') as FormControl;
  }
  get participacija(): FormGroup{
    return this.forma.get('participacija') as FormGroup;
  }
  get clanakParticipacija(): FormControl{
    return this.forma.get('participacija.clanakParticipacija') as FormControl;
  }
  get trajnoParticipacija(): FormControl{
    return this.forma.get('participacija.trajnoParticipacija') as FormControl;
  }
  get participacijaDo(): FormControl{
    return this.forma.get('participacija.participacijaDo') as FormControl;
  }
}
