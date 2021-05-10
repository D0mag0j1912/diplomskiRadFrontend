import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, merge, of, Subject, Subscription } from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { Uputnica } from '../modeli/uputnica.model';
import { ZdravstvenaUstanova } from '../modeli/zdravstvenaUstanova.model';
import { ObradaService } from '../obrada/obrada.service';
import { PreglediDetailService } from '../obrada/pregledi/pregledi-detail/pregledi-detail.service';
import { PreglediService } from '../obrada/pregledi/pregledi.service';
import { SharedService } from '../shared.service';
import { Uzorak } from '../uzorci/uzorci.model';
import { UzorciService } from '../uzorci/uzorci.service';
import { SekundarniHeaderService } from './sekundarni-header.service';

@Component({
  selector: 'app-sekundarni-header',
  templateUrl: './sekundarni-header.component.html',
  styleUrls: ['./sekundarni-header.component.css']
})
export class SekundarniHeaderComponent implements OnInit, OnDestroy {

    //Oznaka je li otvoren prozor alerta ili nije
    isAlert: boolean = false;
    //Spremam alert poruku
    alertPoruka: string = null;
    //Oznaka je li otvoren prozor uzoraka ili nije
    isUzorci: boolean = false;
    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Spremam pretplatu
    subs: Subscription;
    //Oznaka je li korisnik prijavljen
    prijavljen: boolean = false;
    //Oznaka je li korisnik liječnik
    isLijecnik: boolean = false;
    //Oznaka je li korisnik medicinska sestra
    isMedSestra: boolean = false;
    //Označavam je li pacijent aktivan
    isAktivan: boolean = false;
    //Označavam je li pacijent ima pregleda
    imaLiPregleda: boolean = false;
    //Spremam ID pregleda na koji se preusmjeravam klikom na link "Pregledi" AKO pacijent ima evidentiranih pregleda
    idPregled: number;
    //Definiram formu
    forma: FormGroup;
    //Spremam zdr. ustanove koje trebam proslijediti child komponenti "UzorciComponent"
    zdrUstanove: ZdravstvenaUstanova[] = [];
    //Spremam naziv zdr. ustanove koja ima najveći ID uputnice da je pošaljem komponenti uzoraka
    poslaniNazivZdrUst: string = null;
    //Šaljem komponenti "UzorciComponent" ID uputnice koja ima max ID
    poslaniIDUputnica: number;
    //Spremam sve podatke uputnice koja ima najveći ID da ih pošaljem child komponenti "UzorciComponent"
    uputnica: Uputnica;
    //Spremam slučajno generirane uzorke te ih šaljem child komponenti "UzorciComponent"
    poslaniUzorci: Uzorak;

    constructor(
        //Dohvaćam login servis
        private loginService: LoginService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis sekundarnog headera
        private sekundarniHeaderService: SekundarniHeaderService,
        //Dohvaćam router
        private router: Router,
        //Dohvaćam servis pregleda
        private preglediService: PreglediService,
        //Dohvaćam servis detalja prethodnih pregleda
        private preglediDetailService: PreglediDetailService,
        //Dohvaćam shared servis
        private sharedService: SharedService,
        //Dohvaćam servis uzoraka
        private uzorciService: UzorciService
    ) { }

    ngOnInit() {

        //Kreiram formu
        this.forma = new FormGroup({
            'cijena': new FormControl(null)
        });

        const combined = merge(
            //Pretplaćujem se na Subject iz login servisa
            this.loginService.user.pipe(
                tap((user) => {
                    //Ako postoji user u Subjectu, to znači da je prijavljen, ako ne postoji, prijavljen = false
                    this.prijavljen = !user ? false : true;
                    //Ako je korisnik prijavljen
                    if(this.prijavljen){
                        //Ako je tip prijavljenog korisnika "lijecnik":
                        if(user["tip"] == "lijecnik"){
                            //Označavam da se liječnik prijavio
                            this.isLijecnik = true;
                        } else if(user["tip"] == "sestra"){
                            //Označavam da se medicinska sestra prijavila
                            this.isMedSestra = true;
                        }
                    }
                }),
                //Tip prijavljenog korisnika prosljeđujem metodi koja dohvaća podatke aktivnog pacijenta u obradi
                switchMap(user => {
                    //Ako je korisnik prijavljen:
                    if(user){
                        //Dohvaćam podatke aktivnog pacijenta u obradi
                        return this.obradaService.getPatientProcessing(user.tip).pipe(
                            switchMap(odgovor => {
                                //Ako je pacijent aktivan u obradi
                                if(odgovor.success !== "false"){
                                    //Označavam da je pacijent aktivan u obradi
                                    this.isAktivan = true;
                                    //Dohvaćam ID aktivnog pacijenta
                                    const idPacijent = +odgovor[0].idPacijent;
                                    return forkJoin([
                                        this.preglediDetailService.getNajnovijiIDPregled(user.tip,idPacijent),
                                        this.sekundarniHeaderService.getTrenutnaCijenaPregleda(odgovor[0].idObrada, user.tip),
                                        this.uzorciService.getUstanoveUzorci(+odgovor[0].idPacijent)
                                    ]).pipe(
                                        tap(podatci => {
                                            //Ako pacijent nema evidentiranih pregleda
                                            if(podatci[0] === null){
                                                //Označavam da pacijent NEMA evidentiranih pregleda
                                                this.imaLiPregleda = false;
                                            }
                                            else{
                                                //Označavam da pacijent IMA evidentiranih pregleda
                                                this.imaLiPregleda = true;
                                                //Spremam ID najnovijeg pregleda za aktivnog pacijenta
                                                this.idPregled = +podatci[0];
                                            }
                                            //Ako je baza vratila null za iznos pregleda
                                            if(podatci[1] === null){
                                                //Emitiram inicijalnu vrijednost iznosa pregleda Subjectom
                                                this.sharedService.emitirajNoviIznosPregleda(parseFloat('0.00'));
                                            }
                                            //Ako je baza vratila neki iznos pregleda
                                            else{
                                                //Emitiram inicijalnu vrijednost iznosa pregleda Subjectom
                                                this.sharedService.emitirajNoviIznosPregleda(parseFloat(podatci[1]));
                                            }
                                            //Ako je server vratio barem jednu zdr. ustanovu za komponentu uzoraka
                                            if(podatci[2] !== null){
                                                let obj;
                                                for(const ustanova of podatci[2]){
                                                    obj = new ZdravstvenaUstanova(ustanova);
                                                    this.zdrUstanove.push(obj);
                                                }
                                            }
                                        }),
                                        switchMap(podatci => {
                                            //Ako je server vratio barem jednu zdr. ustanovu za komponentu uzoraka
                                            if(podatci[2] !== null){
                                                //Inicijaliziram na početku max = 0
                                                let max: number = 0;
                                                //Prolazim kroz sve zdr. ustanove za koje još NISU POSLANI UZORCI
                                                for(const ustanova of this.zdrUstanove){
                                                    //Splitam elemente [naziv_zdr_ust_idUputnica]
                                                    const ustanovaSplit: string[] = ustanova.naziv.split(" ");
                                                    if(+ustanovaSplit[ustanovaSplit.length - 1] > max){
                                                        max = +ustanovaSplit[ustanovaSplit.length - 1];
                                                        this.poslaniNazivZdrUst = ustanova.naziv;
                                                    }
                                                }
                                                //Spremam max ID uputnice
                                                this.poslaniIDUputnica = max;
                                                //Pretplaćivam se na podatke uputnice u kojoj se za zdr. ustanova nalazi
                                                return this.uzorciService.getPodatciUputnica(this.poslaniIDUputnica).pipe(
                                                    tap(uputnica => {
                                                        //Prolazim kroz odg. servera
                                                        for(const u of uputnica){
                                                            this.uputnica = new Uputnica(u);
                                                        }
                                                    })
                                                );
                                            }
                                            else{
                                                return of(null);
                                            }
                                        })
                                    );
                                }
                                //Ako pacijent NIJE aktivan u obradi
                                else{
                                    //Označavam da pacijent nije aktivan u obradi
                                    this.isAktivan = false;
                                    return of(null);
                                }
                            })
                        );
                    }
                    //Ako korisnik nije prijavljen:
                    else{
                        return of(null);
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na Observable da vidim je li novi pregled dodan
            this.preglediService.pregledDodanObs.pipe(
                switchMap(pregledDodan => {
                    //Ako je dodan novi pregled u povijesti bolesti ili općim podatcima pregleda
                    if(pregledDodan.isDodan && pregledDodan.tipKorisnik){
                        //Dohvaćam podatke aktivnog pacijenta u obradi
                        return this.obradaService.getPatientProcessing(pregledDodan.tipKorisnik).pipe(
                            switchMap(odgovor => {
                                //Ako je pacijent aktivan u obradi
                                if(odgovor.success !== "false"){
                                    //Označavam da je pacijent aktivan u obradi
                                    this.isAktivan = true;
                                    //Dohvaćam ID aktivnog pacijenta
                                    const idPacijent = +odgovor[0].idPacijent;
                                    return this.preglediDetailService.getNajnovijiIDPregled(pregledDodan.tipKorisnik,idPacijent).pipe(
                                        tap(idPregled => {
                                            //Ako pacijent nema evidentiranih pregleda
                                            if(idPregled === null){
                                                //Označavam da pacijent NEMA evidentiranih pregleda
                                                this.imaLiPregleda = false;
                                            }
                                            else{
                                                //Označavam da pacijent IMA evidentiranih pregleda
                                                this.imaLiPregleda = true;
                                                //Spremam ID najnovijeg pregleda za aktivnog pacijenta
                                                this.idPregled = +idPregled;
                                            }
                                        })
                                    );
                                }
                                //Ako pacijent NIJE aktivan u obradi
                                else{
                                    //Označavam da pacijent nije aktivan u obradi
                                    this.isAktivan = false;
                                    return of(null);
                                }
                            })
                        );
                    }
                    else{
                        return of(null);
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na informaciju je li završio pregled
            this.obradaService.obsZavrsenPregled.pipe(
                tap((pregled) => {
                    //Ako je pregled završen
                    if(pregled){
                        //Označavam da pacijent više nije aktivan
                        this.isAktivan = false;
                    }
                }),
                takeUntil(this.pretplateSubject)
            ),
            //Pretplaćujem se na informaciju koliko pregled košta
            this.sharedService.cijeneObs.pipe(
                tap(trenutnaCijena => {
                    //Primam naplaćenu cijenu te je stavljam u polje forme
                    this.cijena.patchValue(trenutnaCijena.toFixed(2) + ' kn', {emitEvent: false});
                }),
                takeUntil(this.pretplateSubject)
            )
        ).subscribe();
    }

    //Metoda koja preusmjerava korisnika na stranicu pregleda
    preumjeriNaPregled(){
        //Ako je prijavljen liječnik
        if(this.isLijecnik){
            //Ako je pacijent aktivan
            if(this.isAktivan){
                //Ako pacijent IMA evidentiranih pregleda
                if(this.imaLiPregleda){
                    //Emitiram vrijednost Subjectom da je kliknut "Pregledi"
                    this.sekundarniHeaderService.kliknutHeader.next(true);
                    //Preusmjeravam se na detail stranicu sa ID-em za najnoviji pregled
                    this.router.navigate(['/lijecnik/obrada/pregledi',this.idPregled]);
                }
                //Ako pacijent NEMA evidentiranih pregleda
                else{
                    this.router.navigate(['/lijecnik/obrada/pregledi']);
                }
            }
            //Ako pacijent nije aktivan
            else{
                this.router.navigate(['/lijecnik/obrada/pregledi']);
            }
        }
        //Ako je prijavljena medicinska sestra
        else{
            //Ako je pacijent aktivan
            if(this.isAktivan){
                //Ako pacijent IMA evidentiranih pregleda
                if(this.imaLiPregleda){
                    //Emitiram vrijednost Subjectom da je kliknut "Pregledi"
                    this.sekundarniHeaderService.kliknutHeader.next(true);
                    //Preusmjeravam se na detail stranicu sa ID-em za najnoviji pregled
                    this.router.navigate(['/med-sestra/obrada/pregledi',this.idPregled]);
                }
                //Ako pacijent NEMA evidentiranih pregleda
                else{
                    this.router.navigate(['/med-sestra/obrada/pregledi']);
                }
            }
            //Ako pacijent nije aktivan
            else{
                this.router.navigate(['/med-sestra/obrada/pregledi']);
            }
        }
    }

    //Metoda koja se pokreće kada child komponenta "UzorciComponent" spremi uzorak
    //Ovo radim da provjerim je li ostalo još nekih ustanova kojima nisu poslani uzorci te ako jest da dohvatim zadnju i predam je childu opet
    onUzorakSpremljen(){
        //Pretplaćivam se na tip prijavljenog korisnika
        this.loginService.user.pipe(
            take(1),
            switchMap(user => {
                if(user){
                    return this.obradaService.getPatientProcessing(user.tip).pipe(
                        switchMap(podatci => {
                            //Ako je pacijent aktivan
                            if(podatci.success !== "false"){
                                //Pretplaćivam se na nazive zdr. ustanova KOJIMA JOŠ NISU poslani uzorci
                                return this.uzorciService.getUstanoveUzorci(+podatci[0].idPacijent).pipe(
                                    tap(ustanove => {
                                        //Restartam polje zdr. ustanova
                                        this.zdrUstanove = [];
                                        //Ako je server vratio barem jednu zdr. ustanovu za komponentu uzoraka
                                        if(ustanove !== null){
                                            //Definiram objekt
                                            let obj;
                                            //Prolazim kroz odgovor servera
                                            for(const ustanova of ustanove){
                                                obj = new ZdravstvenaUstanova(ustanova);
                                                this.zdrUstanove.push(obj);
                                            }
                                        }
                                    }),
                                    switchMap(ustanove => {
                                        //Ako je server vratio barem jednu zdr. ustanovu za komponentu uzoraka
                                        if(ustanove !== null){
                                            //Inicijaliziram na početku max = 0
                                            let max: number = 0;
                                            //Prolazim kroz sve zdr. ustanove za koje još nisu poslani uzorci
                                            for(const ustanova of this.zdrUstanove){
                                                //Splitam elemente [naziv_zdr_ust_idUputnica]
                                                const ustanovaSplit: string[]  = ustanova.naziv.split(" ");
                                                if(+ustanovaSplit[ustanovaSplit.length - 1] > max){
                                                    max = +ustanovaSplit[ustanovaSplit.length - 1];
                                                    this.poslaniNazivZdrUst = ustanova.naziv;
                                                }
                                            }
                                            //Spremam max ID uputnice
                                            this.poslaniIDUputnica = max;
                                            //Pretplaćivam se na podatke uputnice u kojoj se za zdr. ustanova nalazi
                                            return this.uzorciService.getPodatciUputnica(this.poslaniIDUputnica).pipe(
                                                tap(uputnica => {
                                                    //Prolazim kroz odg. servera
                                                    for(const u of uputnica){
                                                        this.uputnica = new Uputnica(u);
                                                    }
                                                })
                                            );
                                        }
                                        else{
                                            return of(null);
                                        }
                                    })
                                )
                            }
                        })
                    );
                }
                else{
                    return of(null);
                }
            })
        ).subscribe();
    }
    //Metoda koja se aktivira kada med. sestra klikne na "Pošalji uzorke"
    onPosaljiUzorke(){
        //Ako je liječnik izdao uputnicu za trenutno aktivnog pacijenta te sestra NIJE poslala uzorak za tu uputnicu (AKO IMA zdr. ustanova)
        if(this.zdrUstanove.length > 0){
            //Pretplaćujem se na Observable koji vraća slučajno generirane uzorke
            this.uzorciService.getUzorci().subscribe(
                (uzorci) => {
                    //Formiram uzorke te ih šaljem "UzorciComponent"
                    this.poslaniUzorci = new Uzorak(uzorci);
                    //Otvori prozor uzoraka
                    this.isUzorci = true;
                    //Emitiram vrijednost prema "UzorciComponent" da se zna da joj je roditelj "SekundarniHeaderComponent"
                    this.sharedService.sekundarniIliNalazi.next("sekundarni");
                }
            );
        }
        //Ako NEMA evidentiranih izdanih uputnica gdje NIJE poslan uzorak
        else{
            //Otvori alert
            this.isAlert = true;
            //Spremam poruku za njega
            this.alertPoruka = 'Nema evidentiranih uputnica!';
        }
    }
    //Metoda koja zatvara prozor uzoraka
    onCloseUzorci(){
        this.isUzorci = false;
    }

    //Metoda koja zatvara prozor alerta
    onCloseAlert(){
        //Zatvori alert
        this.isAlert = false;
    }

    //Metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }

    get cijena(): FormControl{
        return this.forma.get('cijena') as FormControl;
    }
}
