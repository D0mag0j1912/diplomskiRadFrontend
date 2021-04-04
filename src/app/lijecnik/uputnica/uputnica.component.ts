import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { Dijagnoza } from 'src/app/shared/modeli/dijagnoza.model';
import { InicijalneDijagnoze } from 'src/app/shared/modeli/inicijalneDijagnoze.model';
import { ZdravstvenaDjelatnost } from 'src/app/shared/modeli/zdravstvenaDjelatnost.model';
import { ZdravstvenaUstanova } from 'src/app/shared/modeli/zdravstvenaUstanova.model';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
import { IzdajUputnicaService } from './izdaj-uputnica/izdajuputnica.service';

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
    //Spremam sve dijagnoze
    dijagnoze: Dijagnoza[] = [];
    //Spremam sve pacijente
    pacijenti: string[] = [];
    //Spremam inicijalne dijagnoze aktivnog pacijenta da ih pošaljem child komponenti
    inicijalneDijagnoze: InicijalneDijagnoze[] = [];
    //Spremam aktivnog pacijenta
    aktivniPacijent: string = null;

    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam login servis
        private loginService: LoginService,
        //Dohvaćam servis izdavanja uputnice 
        private izdajUputnicaService: IzdajUputnicaService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService
    ) { }

    //Metoda koja se pokreće kada se komponenta inicijalizira
    ngOnInit() {
        //Dohvaćam podatke Resolvera
        this.route.data.pipe(
            map(podatci => podatci.importi),
            tap(podatci => {
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
                                        tap(dijagnoze => {
                                            //Definiram praznu varijablu
                                            let obj;
                                            //Prolazim kroz sve inicijalne dijagnoze aktivnog pacijenta koje je poslao server
                                            for(const dijagnoza of dijagnoze){
                                                //Kreiram svoj objekt
                                                obj = new InicijalneDijagnoze(dijagnoza);
                                                //Spremam ga u svoje polje
                                                this.inicijalneDijagnoze.push(obj);
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

    //Metoda koja se pokreće kada se klikne button "Nova uputnica"
    onNovaUputnica(){
        //Otvori prozor izdavanja uputnice
        this.isIzdavanjeUputnice = true;
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
