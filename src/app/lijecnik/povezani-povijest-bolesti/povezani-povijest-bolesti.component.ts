import { Component, OnInit,Output,EventEmitter, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { forkJoin, of, Subscription } from 'rxjs';
import { concatMap, switchMap } from 'rxjs/operators';
import { Obrada } from 'src/app/shared/modeli/obrada.model';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
import { PovezaniPovijestBolestiService } from './povezani-povijest-bolesti.service';

@Component({
  selector: 'app-povezani-povijest-bolesti',
  templateUrl: './povezani-povijest-bolesti.component.html',
  styleUrls: ['./povezani-povijest-bolesti.component.css']
})
export class PovezaniPovijestBolestiComponent implements OnInit,OnDestroy {

    //Kreiram pretplate
    subs: Subscription;
    subsNazivSekundarna: Subscription;
    subsPretraga: Subscription;
    subsPromjenaForma: Subscription;
    //Oznaka je li pronađen rezultat za pretragu povijest bolesti
    isPovijestBolestiPretraga: boolean = false;
    //Spremam poruku servera za pretragu povijesti bolesti
    porukaPovijestBolestiPretraga: string = null;
    //Kreiram event emmiter koji će obavjestiti drugu komponentu da je korisnik kliknuo "Izađi"
    @Output() close = new EventEmitter<any>();
    //Kreiram formu koja služi za pretragu povijesti bolesti
    forma: FormGroup;
    //Kreiram glavnu formu
    glavnaForma: FormGroup;
    //Oznaka je li pacijent trenutno aktivan u obradi
    isAktivan: boolean = false;
    //Spremam podatke trenutno aktivnog pacijenta
    pacijent: Obrada;
    //Spremam ID trenutno aktivnog pacijenta
    idPacijent: number;
    //Oznaka jesu li inicijalno pronađeni podatci povijesti bolesti za ovog pacijenta
    isPovijestBolesti: boolean = false;
    //Spremam poruku ako pacijent nije aktivan u obradi
    porukaAktivan: string = null;
    //Spremam poruku ako pacijent nema inicijalno rezultata za povijest bolesti
    porukaPovijestBolesti: string = null;
    //Spremam evidentirane povijesti bolesti za pacijenta
    povijestiBolesti: any;

    constructor(
        //Dohvaćam servis obrade
        private obradaService: ObradaService,
        //Dohvaćam servis povezane povijesti bolesti
        private povezaniPovijestBolestiService: PovezaniPovijestBolestiService
    ) { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){

        const combined = this.obradaService.getPatientProcessing().pipe(
            switchMap(response => {
                //Ako je Observable vratio aktivnog pacijenta
                if(response["success"] !== "false"){
                  //Označavam da je pacijent aktivan u obradi
                  this.isAktivan = true;
                  //Spremam mu podatke
                  this.pacijent = response;
                  //Spremam ID pacijenta
                  this.idPacijent = this.pacijent[0].idPacijent;
                  console.log(this.idPacijent);
                  //Kreiram formu
                  this.forma = new FormGroup({
                    'parametar': new FormControl(null)
                  });
                  //Kreiram glavnu formu
                  this.glavnaForma = new FormGroup({
                    'povijestBolesti': new FormArray([])
                  });
                  return forkJoin([
                    this.povezaniPovijestBolestiService.getPovijestBolesti(this.idPacijent)
                  ]);
                }
                //Ako Observable nije vratio aktivnog pacijenta
                else{
                  //U svoju varijablu spremam poruku backenda da pacijent nije aktivan
                  this.porukaAktivan = response["message"];
                  //Kreiram Observable od te poruke tako da ga switchMapom vratim ako nema aktivnog pacijenta
                  return of(this.porukaAktivan);    
                }
            })
        );
        //Pretplaćujem se na odgovor servera
        this.subs = combined.subscribe(
            //Dohvaćam odgovor servera
            (odgovor) => {
                //console.log(odgovor);
                //Ako je pacijent AKTIVAN
                if(odgovor !== "Nema aktivnih pacijenata!"){
                    //Omogući pretraživanje po raznim parametrima
                    this.subsPretraga = this.forma.get('parametar').valueChanges.pipe(
                        //Koristim concatMap da se vrijednosti sekvencijalno šalju na backend
                        concatMap(value => {
                            return this.povezaniPovijestBolestiService.getPovijestBolestiPretraga(this.idPacijent,value);
                        })
                    ).subscribe(
                        //Dohvaćam odgovor 
                        (odgovor) => {
                            //Ako je server vratio neke rezultate
                            if(odgovor["success"] !== "false"){
                                //Brišem svaki form group u form arrayu povijesti bolesti prije nadodavanja novih form groupova pretrage
                                
                                //Dok form array nije prazan
                                while(this.getControls().length !== 0){
                                    //Briši mu prvi element 
                                    (<FormArray>this.glavnaForma.get('povijestBolesti')).removeAt(0);
                                }
                                //Stavljam neuspješnu poruku pretrage na null da se ne prikazuje na ekranu
                                this.porukaPovijestBolestiPretraga = null;
                                //Označavam da korisnik pretražuje povijesti bolesti
                                this.isPovijestBolestiPretraga = true;
                                //Spremam nove rezultate u svoje polje povijesti bolesti
                                this.povijestiBolesti = odgovor;
                                //console.log(this.povijestiBolesti);
                                //Kreiram pomoćno polje u kojemu će biti jedinstvene vrijednosti
                                let pomPretraga = [];
                                //Za svaku vrijednost u polju povijesti bolesti
                                for(let povijestB of this.povijestiBolesti){
                                    //Ako se godina iz povijesti bolesti NE NALAZI u pomoćnom polju
                                    if(pomPretraga.indexOf(povijestB.Godina) === -1){
                                        //Dodaj tu godinu u pomoćno polje
                                        pomPretraga.push(povijestB.Godina);
                                    }
                                    //Ako se godina iz povijesti bolesti NALAZI u pomoćnom polju
                                    else{
                                        //Dodjeljuje joj se vrijednost null
                                        povijestB.Godina = null;
                                    }
                                }
                                //Za svaku povijest bolesti, dodaj cijeli form array u formu 
                                for(let povijest of this.povijestiBolesti){
                                    console.log(povijest);
                                    this.addControls(povijest);
                                }
                                //Za svaku iteraciju povijesti bolesti, u polje sekundarnih dijagnoza dodaj form control u kojemu će se nalaziti sekundarne dijagnoze te povijesti bolesti
                                for(let i = 0;i< this.getControls().length;i++){
                                    //Ako šifra sekundarne dijagnoze nije prazna
                                    if(this.povijestiBolesti[i].mkbSifraSekundarna !== null){
                                        //Pretplaćujem se na Observable u kojemu se nalaze NAZIVI SEKUNDARNIH DIJAGNOZA za određene šifre sekundarnih dijagnoza
                                        this.subsNazivSekundarna = this.povezaniPovijestBolestiService.getNazivSekundarna(this.povijestiBolesti[i].mkbSifraSekundarna).subscribe(
                                            //Dohvaćam naziv sekundarne dijagnoze
                                            (nazivSekundarna) => {
                                                console.log(nazivSekundarna);
                                                //Za svaku povijesti bolesti, ja pusham prazni form control u polje sekundarnih dijagnoza
                                                (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(i)).get('sekundarneDijagnoze')).push(
                                                    new FormControl()
                                                );
                                                //Za svaku iteraciju povijesti bolesti, string se resetira
                                                let str = new String("");
                                                //Prolazim kroz sve nazive sekundarnih dijagnoza i njihove šifre
                                                for(let dijagnoza of nazivSekundarna){
                                                    //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                                    str = str.concat(dijagnoza.mkbSifra + " | " + dijagnoza.imeDijagnoza + "\n");
                                                    //Taj spojeni string dodavam u form control polja sekundarnih dijagnoza
                                                    (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(i)).get('sekundarneDijagnoze')).patchValue([str]);
                                                } 
                                            }
                                        );
                                    }
                                    //Ako je šifra sekundarne dijagnoze prazna
                                    else{
                                        (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(i)).get('sekundarneDijagnoze')).push(
                                            //U form control sekundarne dijagnoze ubaci null
                                            new FormControl(this.povijestiBolesti[i].mkbSifraSekundarna)
                                        ); 
                                    }
                                }
                            }
                            //Ako je server vratio poruku da nema rezultata za navedenu pretragu
                            else{
                                //Spremam poruku servera 
                                this.porukaPovijestBolestiPretraga = odgovor["message"];
                                console.log(this.porukaPovijestBolestiPretraga);
                            }
                        }
                    );
                }
                //Ako je pacijent AKTIVAN te IMA evidentiranih povijesti bolesti
                if(odgovor !== "Nema aktivnih pacijenata!" && odgovor[0]["success"] !== "false"){
                    //Označavam da pacijent ima evidentiranih povijesti bolesti
                    this.isPovijestBolesti = true;
                    //Spremam odgovore servera (povijesti bolesti i godine)
                    this.povijestiBolesti = odgovor[0];
                    //Kreiram pomoćno polje u kojemu će biti jedinstvene vrijednosti
                    let pom = [];
                    //Za svaku vrijednost u polju povijesti bolesti
                    for(let povijestB of this.povijestiBolesti){
                        //Ako se godina iz povijesti bolesti NE NALAZI u pomoćnom polju
                        if(pom.indexOf(povijestB.Godina) === -1){
                            //Dodaj tu godinu u pomoćno polje
                            pom.push(povijestB.Godina);
                        }
                        //Ako se godina iz povijesti bolesti NALAZI u pomoćnom polju
                        else{
                            //Dodjeljuje joj se vrijednost null
                            povijestB.Godina = null;
                        }
                    }
                    //Za svaku povijest bolesti, dodaj cijeli form array u formu 
                    for(let povijest of this.povijestiBolesti){
                        this.addControls(povijest);
                    }

                    //Za svaku iteraciju povijesti bolesti, u polje sekundarnih dijagnoza dodaj form control u kojemu će se nalaziti sekundarne dijagnoze te povijesti bolesti
                    for(let i = 0;i< this.getControls().length;i++){
                        //Ako šifra sekundarne dijagnoze nije prazna
                        if(this.povijestiBolesti[i].mkbSifraSekundarna !== null){
                            //Pretplaćujem se na Observable u kojemu se nalaze NAZIVI SEKUNDARNIH DIJAGNOZA za određene šifre sekundarnih dijagnoza
                            this.subsNazivSekundarna = this.povezaniPovijestBolestiService.getNazivSekundarna(this.povijestiBolesti[i].mkbSifraSekundarna).subscribe(
                                //Dohvaćam naziv sekundarne dijagnoze
                                (nazivSekundarna) => {
                                    console.log(nazivSekundarna);
                                    //Za svaku povijesti bolesti, ja pusham prazni form control u polje sekundarnih dijagnoza
                                    (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(i)).get('sekundarneDijagnoze')).push(
                                        new FormControl()
                                    );
                                    //Za svaku iteraciju povijesti bolesti, string se resetira
                                    let str = new String("");
                                    //Prolazim kroz sve nazive sekundarnih dijagnoza i njihove šifre
                                    for(let dijagnoza of nazivSekundarna){
                                        //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                        str = str.concat(dijagnoza.mkbSifra + " | " + dijagnoza.imeDijagnoza + "\n");
                                        //Taj spojeni string dodavam u form control polja sekundarnih dijagnoza
                                        (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(i)).get('sekundarneDijagnoze')).patchValue([str]);
                                    } 
                                }
                            );
                        }
                        //Ako je šifra sekundarne dijagnoze prazna
                        else{
                            (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(i)).get('sekundarneDijagnoze')).push(
                                //U form control sekundarne dijagnoze ubaci null
                                new FormControl(this.povijestiBolesti[i].mkbSifraSekundarna)
                            ); 
                        }
                    }
                }
                //Ako je pacijent AKTIVAN te IMA evidentiranih povijesti bolesti
                else if(odgovor !== "Nema aktivnih pacijenata!" && odgovor[0]["success"] === "false"){
                  //Spremam poruku servera da pacijent nema evidentiranih povijesti bolesti
                  this.porukaPovijestBolesti = odgovor[0]["message"];
                }
                //Ako pacijent nije aktivan
                else if(odgovor === "Nema aktivnih pacijenata!"){
                    //Označavam da pacijent nije aktivan u obradi
                    this.isAktivan = false;
                }
            }
        );
    }

    //Dohvati form controlove formarraya sekundarnih dijagnoza na određenom indeksu
    getControlsSekundarna(index: number){
        return (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(index)).get('sekundarneDijagnoze')).controls;
    }

    //Metoda koja dohvaća form arrayove pojedinih povijesti bolesti
    getControls(){
        return (<FormArray>this.glavnaForma.get('povijestBolesti')).controls;
    }

    //Metoda za dodavanje form controlova u form array godina
    addControls(povijestBolesti: any){
        
        (<FormArray>this.glavnaForma.get('povijestBolesti')).push(
            new FormGroup({
              'godina': new FormControl(povijestBolesti.Godina),
              'datum': new FormControl(povijestBolesti.Datum),
              'razlogDolaska': new FormControl(povijestBolesti.razlogDolaska),
              'mkbSifraPrimarna': new FormControl(povijestBolesti.mkbSifraPrimarna),
              'nazivPrimarna': new FormControl(povijestBolesti.NazivPrimarna),
              'sekundarneDijagnoze': new FormArray([])
            }) 
        );
    }

    //Metoda koja se poziva korisnik klikne button "Izađi"
    onClose(){
      this.close.emit();
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        //Ako postoji pretplata
        if(this.subs){
          //Izađi iz pretplate
          this.subs.unsubscribe();
        }
        //Ako postoji pretplata
        if(this.subsNazivSekundarna){
            //Izađi iz pretplate
            this.subsNazivSekundarna.unsubscribe();
        }
        //Ako postoji pretplata
        if(this.subsPretraga){
            //Izađi iz pretplate
            this.subsPretraga.unsubscribe();
        }
        //Ako postoji pretplata
        if(this.subsPromjenaForma){
            //Izađi iz pretplate
            this.subsPromjenaForma.unsubscribe();
        }
    }
}
