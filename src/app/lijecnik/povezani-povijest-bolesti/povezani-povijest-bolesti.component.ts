import { Component, OnInit,Output,EventEmitter, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import { concatMap, switchMap, takeUntil } from 'rxjs/operators';
import { HeaderService } from 'src/app/shared/header/header.service';
import { Obrada } from 'src/app/shared/modeli/obrada.model';
import { ObradaService } from 'src/app/shared/obrada/obrada.service';
import { PovezaniPovijestBolestiService } from './povezani-povijest-bolesti.service';

@Component({
  selector: 'app-povezani-povijest-bolesti',
  templateUrl: './povezani-povijest-bolesti.component.html',
  styleUrls: ['./povezani-povijest-bolesti.component.css']
})
export class PovezaniPovijestBolestiComponent implements OnInit,OnDestroy {

    //Kreiram Subject
    pretplateSubject = new Subject<boolean>();
    //Oznaka je li pronađen rezultat za pretragu povijest bolesti
    isPovijestBolestiPretraga: boolean = false;
    //Spremam poruku servera za pretragu povijesti bolesti
    porukaPovijestBolestiPretraga: string = null;
    //Kreiram event emitter koji će obavjestiti drugu komponentu da je korisnik kliknuo "Izađi"
    @Output() close = new EventEmitter<any>();
    //Kreiram event emitter koji će poslati podatke retka drugoj komponenti
    @Output() podatciRetka = new EventEmitter<{datum: Date,razlogDolaska: string, mkbSifraPrimarna: string}>();
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
        private povezaniPovijestBolestiService: PovezaniPovijestBolestiService,
        //Dohvaćam header servis
        private headerService: HeaderService
    ) { }

    //Metoda koja se poziva kada se komponenta inicijalizira
    ngOnInit(){
        this.headerService.tipKorisnikaObs.pipe(
            switchMap(podatci => {
                return this.obradaService.getPatientProcessing(podatci).pipe(
                    takeUntil(this.pretplateSubject)
                );
            }),
            takeUntil(this.pretplateSubject)
          ).pipe(
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
                    ]).pipe(
                        takeUntil(this.pretplateSubject)
                    );
                }
                //Ako Observable nije vratio aktivnog pacijenta
                else{
                    //U svoju varijablu spremam poruku backenda da pacijent nije aktivan
                    this.porukaAktivan = response["message"];
                    //Kreiram Observable od te poruke tako da ga switchMapom vratim ako nema aktivnog pacijenta
                    return of(this.porukaAktivan); 
                }
            }),
            takeUntil(this.pretplateSubject)
        //Dohvaćam ILI podatke povijesti bolesti ILI poruku da pacijent nije aktivan
        ).pipe(
            switchMap(
                //Dohvaćam odgovor servera
                (odgovor) => {
                    //Ako je pacijent AKTIVAN te IMA evidentiranih povijesti bolesti
                    if(odgovor !== "Nema aktivnih pacijenata!" && odgovor[0]["success"] !== "false"){
                        //Omogući pretraživanje po raznim parametrima
                        const pretraga = this.forma.get('parametar').valueChanges.pipe(
                            //Koristim concatMap da se vrijednosti sekvencijalno šalju na backend
                            concatMap(value => {
                                return this.povezaniPovijestBolestiService.getPovijestBolestiPretraga(this.idPacijent,value).pipe(
                                    takeUntil(this.pretplateSubject)
                                );
                            }),
                            takeUntil(this.pretplateSubject)
                        ).pipe(
                            switchMap(
                                //Dohvaćam odgovor
                                (odgovor) => {
                                    console.log(odgovor);
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
                                        //Za svaku povijest bolesti, dodaj cijeli form group u form array  
                                        for(let povijest of this.povijestiBolesti){
                                            console.log(povijest);
                                            this.addControls(povijest);
                                        }
                                        let polje = [];    
                                        //Za svaku iteraciju povijesti bolesti
                                        for(let i = 0;i< this.getControls().length;i++){
                                            //Ako šifra sekundarne dijagnoze nije prazna
                                            if(this.getControls()[i].value.mkbSifraSekundarna !== null){
                                                //U svoje pomoćno polje spremam Observable u kojemu se nalaze podatci šifre i naziva sekundarne dijagnoze 
                                                polje.push(this.povezaniPovijestBolestiService.getNazivSekundarna(this.getControls()[i].value.mkbSifraSekundarna));
                                            }
                                            //Ako je šifra sekundarne dijagnoze prazna
                                            else{
                                                (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(i)).get('sekundarneDijagnoze')).push(
                                                    //U form control sekundarne dijagnoze ubaci null
                                                    new FormControl(this.getControls()[i].value.mkbSifraSekundarna)
                                                ); 
                                            }
                                        }
                                        //VRAĆAM POLJE OBSERVABLE-A u kojima se nalaze šifre i nazivi sekundarnih dijagnoza
                                        return forkJoin(polje);
                                    }
                                    //Ako je server vratio poruku da nema rezultata za navedenu pretragu
                                    else{
                                        //Spremam poruku servera 
                                        this.porukaPovijestBolestiPretraga = odgovor["message"];
                                        //VRAĆAM "false"
                                        return of(odgovor["success"]);
                                    }
                                }
                            ),
                            takeUntil(this.pretplateSubject)
                        //Pretplaćujem se na odgovor servera (ILI šifre i nazive sek. dijagnoza ILI da NEMA REZULTATA ZA PRETRAGU)
                        ).subscribe(
                            (odgovor: any) => {
                                console.log(odgovor);
                                //Ako odgovor servera nije "false", tj. ako ima rezultata za ključnu riječ <znak>
                                if(odgovor !== "false"){
                                    //Za svaku iteraciju povijesti bolesti
                                    for(let i = 0;i< this.getControls().length;i++){
                                        //Ako šifra sekundarne dijagnoze nije prazna
                                        if(this.getControls()[i].value.mkbSifraSekundarna !== null){
                                            //Za svaku povijesti bolesti, ja pusham prazni form control u polje sekundarnih dijagnoza
                                            (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(i)).get('sekundarneDijagnoze')).push(
                                                new FormControl()
                                            );
                                            //Za svaku iteraciju povijesti bolesti, string se resetira
                                            let str = new String("");
                                            //Prolazim kroz sve nazive sekundarnih dijagnoza i njihove šifre
                                            for(let dijagnoza of odgovor){
                                                dijagnoza.forEach((element) => {
                                                    console.log(this.getControls()[i].value.mkbSifraPrimarna === element.mkbSifraPrimarna);
                                                    //Ako je šifra primarne dijagnoze iz form array-a JEDNAKA onoj iz fork joina
                                                    if(this.getControls()[i].value.mkbSifraPrimarna === element.mkbSifraPrimarna){
                                                        //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                                        str = str.concat(element.mkbSifra + " | " + element.imeDijagnoza + "\n");
                                                    } 
                                                });
                                            }
                                            //Taj spojeni string dodavam u form control polja sekundarnih dijagnoza
                                            (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(i)).get('sekundarneDijagnoze')).patchValue([str]); 
                                        }
                                    }
                                }
                            }
                        );
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
                        let polje = [];
                        //Za svaku iteraciju povijesti bolesti
                        for(let i = 0;i< this.getControls().length;i++){
                            //Ako šifra sekundarne dijagnoze nije prazna
                            if(this.getControls()[i].value.mkbSifraSekundarna !== null){
                                //U svoje pomoćno polje spremam Observable u kojemu se nalaze podatci šifre i naziva sekundarne dijagnoze 
                                polje.push(this.povezaniPovijestBolestiService.getNazivSekundarna(this.getControls()[i].value.mkbSifraSekundarna));
                            }
                            //Ako je šifra sekundarne dijagnoze prazna
                            else{
                                (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(i)).get('sekundarneDijagnoze')).push(
                                    //U form control sekundarne dijagnoze ubaci null
                                    new FormControl(this.getControls()[i].value.mkbSifraSekundarna)
                                ); 
                            }
                        }
                        return forkJoin(polje);
                    }
                    //Ako je pacijent AKTIVAN te NEMA evidentiranih povijesti bolesti
                    else if(odgovor !== "Nema aktivnih pacijenata!" && odgovor[0]["success"] === "false"){
                        //Dohvaćam glavni div
                        const alertBox = document.getElementById("alert-box");
                        alertBox.style.height = "9vw";
                        //Spremam poruku servera da pacijent nema evidentiranih povijesti bolesti
                        this.porukaPovijestBolesti = odgovor[0]["message"];
                        return of(this.porukaPovijestBolesti);
                    }
                    //Ako pacijent nije aktivan
                    else if(odgovor === "Nema aktivnih pacijenata!"){
                        //Dohvaćam glavni div
                        const alertBox = document.getElementById("alert-box");
                        alertBox.style.height = "10vw";
                        //Označavam da pacijent nije aktivan u obradi
                        this.isAktivan = false;
                        return of(odgovor);
                    }
                }
            ),
            takeUntil(this.pretplateSubject)
        //Pretplaćujem se na odgovore servera (na šifre i nazive sek. dijagnoza ILI da pacijent NEMA evidentiranih povijesti bolesti, 
        //ILI da pacijent NIJE AKTIVAN)
        ).subscribe(
            //Dohvaćam odgovor
            (odgovor: any) => {
                console.log(odgovor);
                //Ako je pacijent AKTIVAN te IMA evidentirane povijesti bolesti
                if(odgovor[0]["success"] !== "false" && odgovor !== "Nema aktivnih pacijenata!"){
                    //Za svaku iteraciju povijesti bolesti
                    for(let i = 0;i< this.getControls().length;i++){
                        //Ako šifra sekundarne dijagnoze nije prazna
                        if(this.getControls()[i].value.mkbSifraSekundarna !== null){
                            console.log(this.getControls()[i].value.mkbSifraSekundarna);
                            //Za svaku povijesti bolesti, ja pusham prazni form control u polje sekundarnih dijagnoza
                            (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(i)).get('sekundarneDijagnoze')).push(
                                new FormControl()
                            );
                            //Za svaku iteraciju povijesti bolesti, string se resetira
                            let str = new String("");
                            //Prolazim kroz sve nazive sekundarnih dijagnoza i njihove šifre
                            for(let dijagnoza of odgovor){
                                dijagnoza.forEach((element) => {
                                    //Ako je šifra primarne dijagnoze iz form array-a JEDNAKA onoj iz fork joina
                                    if(this.getControls()[i].value.mkbSifraPrimarna === element.mkbSifraPrimarna){
                                        //Spajam šifru sekundarne dijagnoze i naziv sekundarne dijagnoze u jedan string te se svaka dijagnoza nalazi u svom redu
                                        str = str.concat(element.mkbSifra + " | " + element.imeDijagnoza + "\n");
                                    }
                                });
                            }
                            //Taj spojeni string dodavam u form control polja sekundarnih dijagnoza
                            (<FormArray>(<FormGroup>(<FormArray>this.glavnaForma.get('povijestBolesti')).at(i)).get('sekundarneDijagnoze')).patchValue([str]);
                        }
                    }
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
              'mkbSifraSekundarna': new FormControl(povijestBolesti.mkbSifraSekundarna),
              'sekundarneDijagnoze': new FormArray([])
            }) 
        );
    }

    //Metoda koja emitira event prema komponenti "PovijestBolestiComponent" te joj prosljeđuje podatke iz retka stisnutog buttona
    poveziPovijestBolesti(datum: Date,razlogDolaska: string,mkbSifraPrimarna: string){
        console.log(datum);
        console.log(razlogDolaska);
        console.log(mkbSifraPrimarna);
        //Emitiram event 
        this.podatciRetka.emit({
            datum,
            razlogDolaska,
            mkbSifraPrimarna
        });
    }

    //Metoda koja se poziva korisnik klikne button "Izađi"
    onClose(){
      this.close.emit();
    }

    //Ova metoda se poziva kada se komponenta uništi
    ngOnDestroy(){
        this.pretplateSubject.next(true);
        this.pretplateSubject.complete();
    }
}
