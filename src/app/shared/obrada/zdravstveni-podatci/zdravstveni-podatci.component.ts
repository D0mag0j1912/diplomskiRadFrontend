import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { merge,Subject} from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
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
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { SharedService } from '../../shared.service';

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
    //Kreiram svoju formu
    forma: FormGroup;
    //Spremam države osiguranja
    drzave: DrzavaOsiguranja[] = [];
    //Spremam kategorije osiguranja
    katOsiguranja: KategorijaOsiguranja[] = [];
    //Spremam područne urede
    podrucniUredi: PodrucniUred[] = [];
    //Spremam participacije
    participacije: Participacija[] = [];
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
        //Dohvaćam servis dialoga
        private dialog: MatDialog,
        //Dohvaćam shared servis
        private sharedService: SharedService
    ) { }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Pretplaćujem se na podatke koje je Resolver poslao
        this.route.data.pipe(
            tap(
              //Dohvaćam podatke
              (response: {podatci: any, zdravstveniPodatci: ZdravstveniPodatci | any}) => {
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

                //Kreiram svoju formu
                this.forma = new FormGroup({
                    'nositeljOsiguranja': new FormControl(
                        this.isPodatciAktivni ? this.zdrPodatci.nositeljOsiguranja : null,
                        this.isPodatciAktivni ? [Validators.required] : []),
                    'drzavaOsiguranja': new FormControl(
                        this.isPodatciAktivni ? this.objektDrzavaOsiguranja.nazivDrzave : null,
                        this.isPodatciAktivni ? [Validators.required, Handler.isValidDrzavaOsiguranja(this.drzave)] : []),
                    'kategorijaOsiguranja': new FormControl(
                        this.isPodatciAktivni ? this.objektKategorijaOsiguranja.oznakaOsiguranika : null,
                        this.isPodatciAktivni ? [Validators.required, Handler.isValidKategorijaOsiguranja(this.katOsiguranja)] : []),
                    'podrucniUred': new FormControl(
                        this.isPodatciAktivni ? this.objektPodrucniUred.nazivSluzbe : null,
                        this.isPodatciAktivni ? [Validators.required, Handler.isValidPodrucniUred(this.podrucniUredi)] : []),
                    'sifUred': new FormControl(
                        this.isPodatciAktivni ? this.objektPodrucniUred.sifUred : null),
                    'mbo': new FormControl(
                        this.isPodatciAktivni ? this.pacijent.mbo : null,
                        this.isPodatciAktivni ? [Validators.required, Validators.pattern("^\\d{9}$")] : []),
                    'trajnoOsnovno': new FormControl(
                        this.isPodatciAktivni ? this.zdrPodatci.trajnoOsnovno : null),
                    'datumiOsnovno': new FormGroup({
                        'osnovnoOd': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.osnovnoOd : null),
                        'osnovnoDo': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.osnovnoDo : null)
                    }, {validators: this.isPodatciAktivni ? Handler.isValidDatumiOsnovno() : null}),
                    'brIskDopunsko': new FormControl(
                        this.isPodatciAktivni ? this.pacijent.brIskDopunsko : null,
                        this.isPodatciAktivni ? [Validators.pattern("^\\d{8}$")] : []),
                    'datumiDopunsko': new FormGroup({
                        'dopunskoOd': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.dopunskoOd : null),
                        'dopunskoDo': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.dopunskoDo : null)
                    }),
                    'oslobodenParticipacije': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.oslobodenParticipacije : null),
                    'participacija': new FormGroup({
                        'clanakParticipacija': new FormControl(this.isPodatciAktivni ? this.objektParticipacija.razlogParticipacija : null),
                        'trajnoParticipacija': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.trajnoParticipacija : null),
                        'participacijaDo': new FormControl(this.isPodatciAktivni ? this.zdrPodatci.participacijaDo : null)
                    }, {validators: this.isPodatciAktivni ? [Handler.bothForbiddenParticipacija()] : null}),
                }, {validators: this.isPodatciAktivni ?
                        [Handler.atLeastOneRequiredOsnovno(),
                        Handler.mustOslobodenParticipacija(),
                        Handler.bothForbiddenOsnovno(),
                        Handler.atLeastOneRequiredParticipacija()] : null});
                //Inicijalno onemogućavam unos u polje šifre područnog ureda
                this.forma.controls["sifUred"].disable({emitEvent: false});
              }
            ),
            takeUntil(this.pretplateSubject)
        ).subscribe();

        //Ako je pacijent aktivan
        if(this.isPodatciAktivni){

            const combined = merge(
                this.podrucniUred.valueChanges.pipe(
                    tap(
                      //Dohvaćam izabranu vrijednost iz dropdowna
                      (value: string) => {
                          //Ako su podatci aktivni
                          if(this.isPodatciAktivni){
                              //Ako je form control ispravan
                              if(this.podrucniUred.valid){
                                //Pozivam metodu
                                Handler.nazivSluzbeToSif(value, this.forma, this.podrucniUredi);
                              }
                              //Ako nije ispravan
                              else{
                                //Treba biti prazno
                                this.sifUred.patchValue(null,{emitEvent: false});
                              }
                          }
                      }
                    ),
                    takeUntil(this.pretplateSubject)
                ),
                this.brIskDopunsko.valueChanges.pipe(
                    //Uzimam vrijednost
                    tap(() => {
                        //Ako je pacijent aktivan
                        if(this.isPodatciAktivni){
                            //Ako je upisana vrijednost u polje broja iskaznice dopunskog osiguranja
                            if(this.brIskDopunsko.value && this.brIskDopunsko.valid){
                                //Omogućavam unos datuma dopunskog osiguranja
                                this.dopunskoOd.enable({emitEvent: false});
                                this.dopunskoDo.enable({emitEvent: false});
                                //Postavljam validatore na datume dopunskog osiguranja
                                this.dopunskoOd.setValidators([Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]);
                                this.dopunskoDo.setValidators([Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]);
                                this.datumiDopunsko.setValidators([Handler.isValidDatumiDopunsko()]);
                            }
                            //Ako nije upisana vrijednost u polje broja iskaznice dopunskog osiguranja
                            else{
                                this.dopunskoOd.clearValidators();
                                this.dopunskoDo.clearValidators();
                                this.datumiDopunsko.clearValidators();
                                //Onemogućavam unos datuma dopunskog osiguranja
                                this.dopunskoOd.disable({emitEvent: false});
                                this.dopunskoDo.disable({emitEvent: false});
                                //Resetiram polja datuma
                                this.dopunskoOd.reset();
                                this.dopunskoDo.reset();
                            }
                            this.dopunskoOd.updateValueAndValidity({emitEvent: false});
                            this.dopunskoDo.updateValueAndValidity({emitEvent: false});
                            this.datumiDopunsko.updateValueAndValidity({emitEvent: false});
                        }
                    }),
                    takeUntil(this.pretplateSubject)
                ),
                this.obradaService.obsZavrsenPregled.pipe(
                    tap(() => {
                        //Ako su podatci aktivni
                        if(this.isPodatciAktivni){
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
                            this.osnovnoOd.clearValidators();
                            this.osnovnoDo.clearValidators();
                            this.dopunskoOd.clearValidators();
                            this.dopunskoDo.clearValidators();
                            this.clanakParticipacija.clearValidators();
                            this.trajnoParticipacija.clearValidators();
                            this.participacijaDo.clearValidators();
                            this.osnovnoOd.updateValueAndValidity({emitEvent: false});
                            this.osnovnoDo.updateValueAndValidity({emitEvent: false});
                            this.dopunskoOd.updateValueAndValidity({emitEvent: false});
                            this.dopunskoDo.updateValueAndValidity({emitEvent: false});
                            this.clanakParticipacija.updateValueAndValidity({emitEvent: false});
                            this.trajnoParticipacija.updateValueAndValidity({emitEvent: false});
                            this.participacijaDo.updateValueAndValidity({emitEvent: false});
                        }
                    }),
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
            this.zdravstveniPodatciService.potvrdiZdravstvenePodatke(
                this.idPacijent,
                this.mbo.value,
                this.nositeljOsiguranja.value,
                this.drzavaOsiguranja.value,
                this.kategorijaOsiguranja.value,
                this.trajnoOsnovno.value ? "trajnoOsnovno": null,
                this.osnovnoOd.value,
                this.osnovnoDo.value,
                this.brIskDopunsko.value,
                this.dopunskoOd.value,
                this.dopunskoDo.value,
                this.oslobodenParticipacije.value ? "oslobodenParticipacije": null,
                this.clanakParticipacija.value,
                this.trajnoParticipacija.value ? "trajnoParticipacija" : null,
                this.participacijaDo.value,
                this.sifUred.value).pipe(
                tap(
                    //Dohvaćam odgovor servera
                    (odgovor) => {
                        //Otvaram dialog
                        this.dialog.open(DialogComponent, {data: {message: odgovor['message']}});
                        //Emitiram informaciju prema "ObradaComponent" da su potvrđeni zdr. podatci
                        this.sharedService.potvrdeniPodatci.next();
                    }
                )
            ).subscribe();
        }
        //Ako podatci nisu aktivni
        else{
            //Otvaram dialog
            this.dialog.open(DialogComponent, {data: {message: 'Nema aktivnog pacijenta u obradi!'}});
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
            this.osnovnoOd.reset();
            this.osnovnoDo.reset();
            //Onemogućavam unos datuma osnovnog osiguranja
            this.osnovnoOd.disable({emitEvent: false});
            this.osnovnoDo.disable({emitEvent: false});
            }
            //Ako trajno osiguranje nije checked
            else{
                //Omogućavam unos datuma osnovnog osiguranja
                this.osnovnoOd.enable({emitEvent: false});
                this.osnovnoDo.enable({emitEvent: false});
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
                //Omogućavam unos članka participacije i postavljam mu validatore
                this.clanakParticipacija.enable({emitEvent: false});
                //Postavljam članku validatore
                this.clanakParticipacija.setValidators([Validators.required, Handler.isValidParticipacija(this.participacije)]);
                //Postavljam validatore u cijelu formu
                this.forma.setValidators([Handler.atLeastOneRequiredOsnovno(),
                    Handler.mustOslobodenParticipacija(),
                    Handler.bothForbiddenOsnovno(),
                    Handler.atLeastOneRequiredParticipacija()]);
            }
            //Ako "Oslobođen participacije" nije checked":
            else{
                //Postavljam validatore u cijelu formu
                this.forma.setValidators([Handler.atLeastOneRequiredOsnovno(),
                    Handler.mustOslobodenParticipacija(),
                    Handler.bothForbiddenOsnovno()]);
                //Resetiram polja participacija
                this.clanakParticipacija.reset();
                this.trajnoParticipacija.reset();
                this.participacijaDo.reset();
                //Onemogućavam unos svim poljima koja se tiču participacije
                this.clanakParticipacija.disable({emitEvent: false});
                this.trajnoParticipacija.disable({emitEvent: false});
                this.participacijaDo.disable({emitEvent: false});
                //Dižem im validatore
                this.clanakParticipacija.clearValidators();
                this.trajnoParticipacija.clearValidators();
                this.participacijaDo.clearValidators();
            }

            this.clanakParticipacija.updateValueAndValidity({emitEvent: false});
            this.trajnoParticipacija.updateValueAndValidity({emitEvent: false});
            this.participacijaDo.updateValueAndValidity({emitEvent: false});
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
            this.trajnoParticipacija.enable({emitEvent: false});
            this.participacijaDo.enable({emitEvent: false});
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
            this.participacijaDo.reset();
            //Onemogući unos datuma participacije
            this.participacijaDo.disable({emitEvent: false});
            //Dižem validatore za datum participacije
            this.participacijaDo.clearValidators();
            }
            //Ako trajna participacija nije checked
            else{
            //Ako je "oslobodenParticipacije" checked
            if(this.oslobodenParticipacije.value){
                //Omogući unos datuma participacije
                this.participacijaDo.enable({emitEvent: false});
                //Postavljam validatore na datum participacije
                this.participacijaDo.setValidators([Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]);
            }
            }
            //Primjeni ove promjene
            this.participacijaDo.updateValueAndValidity({emitEvent:false});
        }
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
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
