import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { PovijestBolesti } from 'src/app/shared/modeli/povijestBolesti.model';
import { Pregled } from 'src/app/shared/modeli/pregled.model';
import { Recept } from 'src/app/shared/modeli/recept.model';
import { Uputnica } from 'src/app/shared/modeli/uputnica.model';
import { ObradaService } from '../../obrada.service';
import { PreglediService } from '../pregledi.service';
import { PreglediDetailService } from './pregledi-detail.service';

@Component({
  selector: 'app-pregledi-detail',
  templateUrl: './pregledi-detail.component.html',
  styleUrls: ['./pregledi-detail.component.css']
})
export class PreglediDetailComponent implements OnInit, OnDestroy{

    //Oznaka je li server vratio sekundarne dijagnoze
    isSekundarna: boolean = false;
    //Oznaka je li prozor izdanih recepata vidljiv ili nije
    isIzdaniRecepti: boolean = false;
    //Oznaka je li prozor izdanih uputnica vidljiv ili nije
    isIzdaneUputnice: boolean = false;
    //Spremam pretplate
    pretplate = new Subject<boolean>();
    //Deklariram formu
    forma: FormGroup;
    //Spremam odgovor servera (pregled) u svoj objekt
    pregled: Pregled;
    //Spremam odgovor servera (recept) u svoj objekt te ga prosljeđivam child komponenti
    poslaniRecept: Recept;
    //Spremam odgovor servera (uputnicu) u svoj objekt te ga prosljeđivam child komponenti
    poslanaUputnica: Uputnica;
    //Spremam odgovor servera (povijest bolesti) u svoj objekt
    povijestBolesti: PovijestBolesti;
    //Oznaka je li odgovor servera pregled (opći podatci) ili povijest bolesti
    isPovijestBolesti: boolean = false;
    //Dohvaćam ID pacijenta koji je aktivan
    idPacijent: number;

    constructor(
        //Dohvaćam route
        private route: ActivatedRoute,
        //Dohvaćam servis pregleda
        private preglediService: PreglediService,
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam router
        private router: Router,
        //Dohvaćam servis detalja prethodnih pregleda
        private preglediDetailService: PreglediDetailService
    ) { }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit(){

        //Pretplaćivam se na podatke Resolvera
        this.route.data.pipe(
            tap(pregledi => {
                //Prolazim kroz odgovor servera
                for(const pregled of pregledi.cijeliPregled){
                    //Ako se u odgovoru pregleda nalazi tip korisnika "sestra":
                    if(pregled.tip === "sestra"){
                        //Spremam ID pacijenta
                        this.idPacijent = +pregledi.obrada.obrada[0].idPacijent;
                        //Označavam da su opći podatci u pitanju
                        this.isPovijestBolesti = false;
                        //Kreiram objekt tipa "Pregled"
                        this.pregled = new Pregled(pregled);
                    }
                    //Ako se u odgovoru pregleda nalazi tip korisnika "lijecnik"
                    else if(pregled.tip === "lijecnik"){
                        //Spremam ID pacijenta
                        this.idPacijent = +pregledi.obrada.obrada[0].idPacijent;
                        //Označavam da je povijest bolesti u pitanju
                        this.isPovijestBolesti = true;
                        //Kreiram objekt tipa "PovijestBolesti"
                        this.povijestBolesti = new PovijestBolesti(pregled);
                        //Kreiram objekt tipa "Recept"
                        this.poslaniRecept = new Recept(pregled);
                        //Kreiram objekt tipa "Uputnica"
                        this.poslanaUputnica = new Uputnica(pregled);
                    }
                }
                //Kreiram formu
                this.forma = new FormGroup({
                    'nacinPlacanja': new FormControl(this.isPovijestBolesti ? null : this.pregled.nacinPlacanja),
                    'kategorijaOsiguranja': new FormControl(this.isPovijestBolesti ? null : this.pregled.oznakaOsiguranika),
                    'drzavaOsiguranja': new FormControl(this.isPovijestBolesti ? null : this.pregled.nazivDrzave),
                    'primarnaDijagnoza': new FormControl(this.isPovijestBolesti ? this.povijestBolesti.primarnaDijagnoza
                                                        : this.pregled.primarnaDijagnoza ? this.pregled.primarnaDijagnoza : null),
                    'sekundarneDijagnoze': new FormControl(),
                    'razlogDolaska': new FormControl(this.isPovijestBolesti ? this.povijestBolesti.razlogDolaska : null),
                    'anamneza': new FormControl(this.isPovijestBolesti ? this.povijestBolesti.anamneza : null),
                    'statusPacijent': new FormControl(this.isPovijestBolesti ? this.povijestBolesti.statusPacijent ? this.povijestBolesti.statusPacijent : null : null),
                    'nalaz': new FormControl(this.isPovijestBolesti ? this.povijestBolesti.nalaz ? this.povijestBolesti.nalaz : null : null),
                    'terapija': new FormControl(this.isPovijestBolesti ? this.povijestBolesti.terapija ? this.povijestBolesti.terapija : null : null),
                    'preporukaLijecnik': new FormControl(this.isPovijestBolesti ? this.povijestBolesti.preporukaLijecnik ? this.povijestBolesti.preporukaLijecnik : null : null),
                    'napomena': new FormControl(this.isPovijestBolesti ? this.povijestBolesti.napomena ? this.povijestBolesti.napomena : null : null)
                });
            }),
            //Podatke pregleda prosljeđujem metodi koja dohvaća sve sekundarne dijagnoze za taj pregled ili povijest bolesti
            mergeMap(() => {
                //Ako je logirana medicinska sestra:
                if(this.pregled){
                    //Ako je upisana primarna dijagnoza
                    if(this.pregled.mkbSifraPrimarna){
                        return this.preglediDetailService.dohvatiSekundarneDijagnoze(this.pregled.datum,this.pregled.vrijeme,
                            this.pregled.mkbSifraPrimarna,this.pregled.tipSlucaj,this.idPacijent,this.pregled.tip).pipe(
                            tap(odgovor => {
                                //Ako postoje sekundarne dijagnoze
                                if(odgovor[0].sekundarneDijagnoze !== null){
                                    //Označavam da ima sekundarnih dijagnoza
                                    this.isSekundarna = true;
                                    //Za svaku iteraciju povijesti bolesti, string se resetira
                                    let str = new String("");
                                    //Prolazim kroz svaku sek. dijagnozu
                                    for(const dijagnoza of odgovor){
                                        //Spajam ih u jedan string
                                        str = str.concat(dijagnoza.sekundarneDijagnoze + "\n");
                                    }
                                    //Stavljam taj složeni string u formu
                                    this.forma.get('sekundarneDijagnoze').patchValue(str,{emitEvent: false});
                                }
                                //Ako nema sekundarnih dijagnoza
                                else{
                                    this.isSekundarna = false;
                                }
                            })
                        );
                    }
                    //Ako nije upisana primarna dijagnoza
                    else{
                        //Označavam da nema sek. dijagnoza
                        this.isSekundarna = false;
                        return of(null);
                    }
                }
                //Ako je logiran liječnik:
                else if(this.povijestBolesti){
                    return this.preglediDetailService.dohvatiSekundarneDijagnoze(this.povijestBolesti.datum,this.povijestBolesti.vrijeme,
                        this.povijestBolesti.mkbSifraPrimarna,this.povijestBolesti.tipSlucaj,this.idPacijent,this.povijestBolesti.tip).pipe(
                        tap(odgovor => {
                            //Ako postoje sekundarne dijagnoze
                            if(odgovor[0].sekundarneDijagnoze !== null){
                                //Označavam da ima sekundarnih dijagnoza
                                this.isSekundarna = true;
                                //Za svaku iteraciju povijesti bolesti, string se resetira
                                let str = new String("");
                                //Prolazim kroz svaku sek. dijagnozu
                                for(const dijagnoza of odgovor){
                                    //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                    str = str.concat(dijagnoza.sekundarneDijagnoze + "\n");
                                }
                                //Stavljam taj složeni string u formu
                                this.forma.get('sekundarneDijagnoze').patchValue(str,{emitEvent: false});
                            }
                            //Ako server NIJE vratio sek. dijagnoze
                            else{
                                this.isSekundarna = false;
                            }
                        })
                    );
                }
            }),
            takeUntil(this.pretplate)
        ).subscribe();

        //Pretplaćujem se na Observable koji sadrži informaciju je li pregled završio
        this.obradaService.obsZavrsenPregled.pipe(
            tap(() => {
                //Preusmjeravam se na '/pregledi'
                this.router.navigate(['../'],{relativeTo: this.route});
            }),
            takeUntil(this.pretplate)
        ).subscribe();
    }

    //Metoda koja otvara prozor izdanih recepata
    onIzdaniRecepti(){
        //Otvori prozor izdanih recepata
        this.isIzdaniRecepti = true;
    }

    //Metoda koja otvara prozor izdanih uputnica
    onIzdaneUputnice(){
        //Otvori prozor izdanih uputnica
        this.isIzdaneUputnice = true;
    }

    //Metoda koja se poziva kada se klikne "Izađi" ili negdje izvan prozora
    onCloseIzdaniRecepti(){
        //Zatvori prozor
        this.isIzdaniRecepti = false;
    }

    //Metoda koja se poziva kada liječnik klikne "Izađi" ili negdje izvan prozora
    onCloseIzdaneUputnice(){
        //Zatvori prozor
        this.isIzdaneUputnice = false;
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplate.next(true);
        this.pretplate.complete();
        //Restartam Subject dodanog pregleda
        this.preglediService.pregledDodan.next({isDodan: false, tipKorisnik:null});
        //Ažuriram stanje Local Storagea
        localStorage.setItem("isDodanPregled",JSON.stringify({isDodan: false, tipKorisnik:null}));
    }

}
