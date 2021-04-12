import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { ImportService } from 'src/app/shared/import.service';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
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
    //Spremam aktivnog pacijenta
    aktivniPacijent: string = null;
    //Oznaka je li otvoren prozor povijesti bolesti
    isPovijestBolesti: boolean = false;
    //Spremam ID aktivnog pacijenta u slučaju da nema upisanu povijest bolesti kad je došao ovamo
    idPacijent: number;
    //Spremam sve dohvaćene uputnice
    uputnice: Uputnica[] = [];
    //Spremam poruku da nema dohvaćenih uputnica
    nemaUputnica: string = null;

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
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
                //Ako NEMA dohvaćenih uputnica
                if(!podatci.uputnice){
                    //Kreiram poruku
                    this.nemaUputnica = 'Nema evidentiranih uputnica';
                }
                //Ako IMA dohvaćenih uputnica
                else{
                    //Definiram objekt u kojega ću spremati uputnice
                    let objektUputnica;
                    //Prolazim kroz sve uputnice koje su dohvaćene sa servera
                    for(const uputnica of podatci.uputnice){
                        objektUputnica = new Uputnica(uputnica);
                        this.uputnice.push(objektUputnica);
                    }
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
            takeUntil(this.pretplata)
        ).subscribe();
    }

    //Metoda koja se poziva kada je izdana nova uputnica (poslana od childa)
    onIzdanaUputnica(){
        //Pretplaćivam se na dohvat uputnica
        this.uputnicaService.getUputnice().pipe(
            tap(uputnice => {
                //Ako ima dohvaćenih uputnica
                if(uputnice){
                    //Resetiram poruku da nema uputnica
                    this.nemaUputnica = null;
                    //Restartam polje uputnica
                    this.uputnice = [];
                    //Definiram objekt u kojega ću spremati uputnice
                    let objektUputnica;
                    //Prolazim kroz sve uputnice koje su dohvaćene sa servera
                    for(const uputnica of uputnice){
                        objektUputnica = new Uputnica(uputnica);
                        this.uputnice.push(objektUputnica);
                    }
                }
                //Ako nema dohvaćenih uputnica
                else{
                    this.nemaUputnica = 'Nema evidentiranih uputnica';
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
        return this.obradaService.getPatientProcessing('lijecnik').pipe(
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
                            console.log(dijagnoze);
                            //Ako pacijent ima zapisanu povijest bolesti u ovoj sesiji obrade
                            if(dijagnoze){
                                return of(null).pipe(
                                    tap(() => {
                                        //Otvaram prozor izdavanja uputnice
                                        this.isIzdavanjeUputnice = true;
                                    }),
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
                                        //Otvaram prozor povijesti bolesti
                                        this.isPovijestBolesti = true;
                                        //Emitiram informaciju Subjectom komponenti povijesti bolesti da dolazim iz uputnice
                                        this.sharedService.receptIliUputnica.next("uputnica");
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
                        tap(() => {
                            //Otvaram prozor izdavanja uputnice
                            this.isIzdavanjeUputnice = true;
                        }),
                        takeUntil(this.pretplata)
                    );
                }
            }),
            takeUntil(this.pretplata)
      ).subscribe();
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
