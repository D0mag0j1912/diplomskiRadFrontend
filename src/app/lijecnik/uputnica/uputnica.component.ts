import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { ImportService } from 'src/app/shared/import.service';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
import { InicijalneDijagnoze } from 'src/app/shared/modeli/inicijalneDijagnoze.model';
import { Uputnica } from 'src/app/shared/modeli/uputnica.model';
import { ZdravstvenaDjelatnost } from 'src/app/shared/modeli/zdravstvenaDjelatnost.model';
import { ZdravstvenaUstanova } from 'src/app/shared/modeli/zdravstvenaUstanova.model';
import { ZdravstveniRadnik } from 'src/app/shared/modeli/zdravstveniRadnik.model';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
import { SharedService } from 'src/app/shared/shared.service';
import { IzdajUputnicaService } from './izdaj-uputnica/izdajuputnica.service';
import { UputnicaService } from './uputnica.service';

@Component({
  selector: 'app-uputnica',
  templateUrl: './uputnica.component.html',
  styleUrls: ['./uputnica.component.css']
})
export class UputnicaComponent implements OnInit, OnDestroy{

    //Spremam pretplate
    pretplata = new Subject<boolean>();
    //Oznaka je li prozor izdavanja uputnice otvoren
    isIzdavanjeUputnice: boolean = false;
    //Spremam sve zdravstvene ustanove
    zdravstveneUstanove: ZdravstvenaUstanova[] = [];
    //Spremam sve zdravstvene djelatnosti
    zdravstveneDjelatnosti: ZdravstvenaDjelatnost[] = [];
    //Spremam sve zdravstvene radnike
    zdravstveniRadnici: ZdravstveniRadnik[] = [];
    //Spremam sve dijagnoze
    dijagnoze: Dijagnoza[] = [];
    //Spremam sve pacijente
    pacijenti: string[] = [];
    //Spremam inicijalne dijagnoze aktivnog pacijenta da ih pošaljem child komponenti
    inicijalneDijagnoze: InicijalneDijagnoze[] = [];
    //Spremam aktivnog pacijenta
    aktivniPacijent: string = null;
    //Oznaka je li otvoren prozor povijesti bolesti
    isPovijestBolesti: boolean = false;
    //Spremam ID aktivnog pacijenta u slučaju da nema upisanu povijest bolesti kad je došao ovamo
    idPacijent: number;
    //Spremam sve dohvaćene uputnice
    uputnice: Uputnica[] = [];

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam login servis
        private loginService: LoginService,
        //Dohvaćam servis izdavanja uputnice
        private izdajUputnicaService: IzdajUputnicaService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam import servis
        private importService: ImportService,
        //Dohvaćam shared servis
        private sharedService: SharedService,
        //Dohvaćam servis uputnice
        private uputnicaService: UputnicaService
    ) { }

    //Metoda koja se pokreće kada se komponenta inicijalizira
    ngOnInit() {
        //Dohvaćam podatke Resolvera
        this.route.data.pipe(
            map(podatci => podatci.importi),
            tap(podatci => {
                //Definiram objekt u kojega ću spremati uputnice
                let objektUputnica;
                //Prolazim kroz sve uputnice koje su dohvaćene sa servera
                for(const uputnica of podatci.uputnice){
                    objektUputnica = new Uputnica(uputnica);
                    this.uputnice.push(objektUputnica);
                }
                //Definiram objekt u kojega ću spremati dijagnoze
                let objektDijagnoza;
                //Prolazim kroz sve dijagnoze vraćene sa servera
                for(const dijagnoza of podatci.dijagnoze){
                    objektDijagnoza = new Dijagnoza(dijagnoza);
                    this.dijagnoze.push(objektDijagnoza);
                }
                //Prolazim kroz sve pacijente vraćene sa servera
                for(const pacijent of podatci.pacijenti){
                    this.pacijenti.push(pacijent.Pacijent);
                }
                //Definiram objekt u kojega spremam sve zdravstvene ustanove
                let objektZdrUst;
                for(const ustanova of podatci.zdravstveneUstanove){
                    objektZdrUst = new ZdravstvenaUstanova(ustanova);
                    this.zdravstveneUstanove.push(objektZdrUst);
                }
                //Definiram objekt u kojega spremam sve zdravstvene ustanove
                let objektZdrDjel;
                for(const djel of podatci.zdravstveneDjelatnosti){
                    objektZdrDjel = new ZdravstvenaDjelatnost(djel);
                    this.zdravstveneDjelatnosti.push(objektZdrDjel);
                }
                //Definiram objekt u kojega spremam sve zdravstvene radnike
                let objektZdrRadnik;
                for(const djel of podatci.zdravstveniRadnici){
                    objektZdrRadnik = new ZdravstveniRadnik(djel);
                    this.zdravstveniRadnici.push(objektZdrRadnik);
                }
            }),
            switchMap(() => {
                //Pretplaćivam se na informaciju je li pacijent aktivan
                return this.loginService.user.pipe(
                    take(1),
                    switchMap(user => {
                        return this.obradaService.getPatientProcessing(user.tip).pipe(
                            switchMap(podatci => {
                                //Ako JE PACIJENT AKTIVAN
                                if(podatci.success !== "false"){
                                    //Prolazim kroz sve pacijente koji se nalaze u dropdownu
                                    for(const pacijent of this.pacijenti){
                                        //Splitam im podatke razmakom
                                        let polje = pacijent.split(" ");
                                        //Ako je MBO aktivnog pacijenta jednak MBO-u pacijenta iz dropdowna
                                        if(polje[2] === podatci[0].mboPacijent){
                                            //Spremam tog pacijenta
                                            this.aktivniPacijent = pacijent;
                                        }
                                    }
                                    //Dohvaćam zadnje postavljene dijagnoze povijesti bolesti ove sesije obrade
                                    return this.izdajUputnicaService.getInicijalneDijagnoze(+JSON.parse(localStorage.getItem("idObrada")), podatci[0].mboPacijent).pipe(
                                        switchMap(dijagnoze => {
                                            //Ako pacijent ima zapisanu povijest bolesti u ovoj sesiji obrade
                                            if(dijagnoze){
                                                //Restartam polje inicijalnih dijagnoza
                                                this.inicijalneDijagnoze = [];
                                                //Definiram praznu varijablu
                                                let obj;
                                                //Prolazim kroz sve inicijalne dijagnoze aktivnog pacijenta koje je poslao server
                                                for(const dijagnoza of dijagnoze){
                                                    //Kreiram svoj objekt
                                                    obj = new InicijalneDijagnoze(dijagnoza);
                                                    //Spremam ga u svoje polje
                                                    this.inicijalneDijagnoze.push(obj);
                                                }
                                                return of(null).pipe(
                                                    takeUntil(this.pretplata)
                                                );
                                            }
                                            //Ako pacijent NEMA zapisanu povijest bolesti
                                            else{
                                                //Dohvaćam ID aktivnog pacijenta da ga mogu prenijeti u prozor povijesti bolesti
                                                return this.importService.getIDPacijent(podatci[0].mboPacijent).pipe(
                                                    tap(idPacijent => {
                                                        //Spremam ID aktivnog pacijenta
                                                        this.idPacijent = +idPacijent;
                                                    }),
                                                    takeUntil(this.pretplata)
                                                );
                                            }
                                        }),
                                        takeUntil(this.pretplata)
                                    );
                                }
                                //Ako pacijent NIJE aktivan
                                else{
                                    return of(null).pipe(
                                        takeUntil(this.pretplata)
                                    );
                                }
                            }),
                            takeUntil(this.pretplata)
                        );
                    })
                )
            }),
            takeUntil(this.pretplata)
        ).subscribe();
    }

    //Metoda koja se poziva kada je izdana nova uputnica (poslana od childa)
    onIzdanaUputnica(){
        //Pretplaćivam se na dohvat uputnica
        this.uputnicaService.getUputnice().pipe(
            tap(uputnice => {
                //Restartam polje uputnica
                this.uputnice = [];
                //Definiram objekt u kojega ću spremati uputnice
                let objektUputnica;
                //Prolazim kroz sve uputnice koje su dohvaćene sa servera
                for(const uputnica of uputnice){
                    objektUputnica = new Uputnica(uputnica);
                    this.uputnice.push(objektUputnica);
                }
            }),
            takeUntil(this.pretplata)
        ).subscribe();
    }

    //Metoda koja se poziva kada liječnik želi izaći iz prozora povijesti bolesti
    onClosePovijestBolesti($event: {idPacijent: number, potvrden: boolean}){
        //Ako je liječnik POTVRDIO povijest bolesti
        if($event.potvrden){
            //Zatvaram prozor povijesti bolesti
            this.isPovijestBolesti = false;
            //Otvaram prozor izdavanja uputnice
            this.isIzdavanjeUputnice = true;
        }
        //Ako liječnik NIJE POTVRDIO povijest bolesti
        else{
            //Zatvaram prozor povijesti bolesti
            this.isPovijestBolesti = false;
        }
    }

    //Metoda koja se pokreće kada se klikne button "Nova uputnica"
    onNovaUputnica(){
        //Ako je pacijent AKTIVAN U OBRADI
        if(JSON.parse(localStorage.getItem("idObrada"))){
            //Ako je već dohvaćen ID aktivnog pacijenta, otvaram prozor povijesti bolesti ILI izdavanje uputnice (zavisi jesam li već unio povijest bolesti preko "PrikaziPovijestBolestiComponent")
            if(this.idPacijent){
                //Sad se ovdje trebam pretplatiti na informaciju da sam možda već unio povijest bolesti te da ne otvaram taj prozor opet
                this.importService.getMBOPacijent(this.idPacijent).pipe(
                    switchMap(mboPacijent => {
                        return this.izdajUputnicaService.getInicijalneDijagnoze(+JSON.parse(localStorage.getItem("idObrada")),mboPacijent).pipe(
                            tap(dijagnoze => {
                                //Ako POSTOJE unesene dijagnoze
                                if(dijagnoze){
                                    //Otvaram prozor izdavanja uputnice
                                    this.isIzdavanjeUputnice = true;
                                }
                                //Ako NE POSTOJE unesene dijagnoze
                                else{
                                    //Otvaram prozor povijesti bolesti
                                    this.isPovijestBolesti = true;
                                    //Emitiram informaciju Subjectom komponenti povijesti bolesti da dolazim iz uputnice
                                    this.sharedService.receptIliUputnica.next("uputnica");
                                }
                            }),
                            takeUntil(this.pretplata)
                        );
                    })
                ).subscribe();
            }
            //Ako NIJE dohvaćen ID pacijenta, otvaram prozor izdavanja uputnice jer mu je već upisana povijest bolesti u ovoj sesiji obrade
            else{
                //Otvori prozor izdavanja uputnice
                this.isIzdavanjeUputnice = true;
            }
        }
        //Ako pacijent NIJE AKTIVAN u obradi
        else{
            this.isIzdavanjeUputnice = true;
        }
    }

    //Metoda koja se poziva kada liječnik želi izaći iz prozora izdavanja uputnice
    onCloseIzdajUputnica(){
        //Zatvori prozor izdavanja uputnice
        this.isIzdavanjeUputnice = false;
    }

    //Metoda koja se pokreće kada se komponenta uništi
    ngOnDestroy(){
        this.pretplata.next(true);
        this.pretplata.complete();
    }

}
