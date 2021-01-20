import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { merge, Subscription } from 'rxjs';
import { concatMap, debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import * as Validacija from '../../recept-validations';
import { ReceptService } from '../../recept.service';

@Component({
  selector: 'app-izdaj-recept',
  templateUrl: './izdaj-recept.component.html',
  styleUrls: ['./izdaj-recept.component.css']
})
export class IzdajReceptComponent implements OnInit, OnDestroy {

    //Spremam pretplate
    subs: Subscription;
    subsPromjeneForma: Subscription;
    subsText: Subscription;
    //Oznaka je li liječnik odabrao lijek (Inicijalno na početku je lijek uvijek)
    isLijek: boolean = true;
    //Oznaka je li liječnik izabrao magistralni pripravak
    isMagPripravak: boolean = false;
    //Oznaka je li liječnik pretražuje lijekove sa osnovne liste
    isPretragaLijekOsnovnaLista: boolean = false;
    //Oznaka je li liječnik pretražuje lijekove sa dopunske liste
    isPretragaLijekDopunskaLista: boolean = false;
    //Oznaka je li liječnik pretražuje magistralne pripravke sa osnovne liste
    isPretragaMagPripravakOsnovnaLista: boolean = false;
    //Oznaka je li liječnik pretražuje magistralne pripravke sa dopunske liste
    isPretragaMagPripravakDopunskaLista: boolean = false;
    //Spremam poruku od servera da nema rezultata za navedenu pretragu
    porukaNemaRezultata: string = null;
    //Kreiram formu
    forma: FormGroup;
    //Spremam trenutno izabranu sekundarnu dijagnozu zbog validacije duplikata
    sekDijagnoza: string = null;
    //Spremam dijagnozu koja je ista kod primarne i kod sekundarne dijagnoze
    dijagnoza: string;
    //Spremam sve dijagnoze
    dijagnoze: any;
    //Spremam sve lijekove sa osnovne liste
    lijekoviOsnovnaLista: any;
    //Spremam sve lijekove sa dopunske liste
    lijekoviDopunskaLista: any;
    //Spremam sve magistralne pripravke sa osnovne liste
    magPripravciOsnovnaLista: any;
    //Spremam sve magistralne pripravke sa dopunske liste
    magPripravciDopunskaLista: any;
    //Spremam nazive dijagnoza
    naziviDijagnoze: string[] = [];
    //Spremam MKB šifre dijagnoza
    mkbSifre: string[] = [];
    //Spremam nazive lijekova iz osnovne liste te njihovu oblik, jačinu i pakiranje
    lijekoviOsnovnaListaOJP: string[] = [];
    //Spremam nazive lijekova iz DOPUNSKE LISTE te njihov oblik, jačinu i pakiranje
    lijekoviDopunskaListaOJP: string[] = [];
    //Spremam nazive magistralnih pripravaka sa osnovne liste
    magPripravciNaziviOsnovnaLista: string[] = [];
    //Spremam nazive magistralnih pripravaka sa dopunske liste
    magPripravciNaziviDopunskaLista: string[] = [];
    //Spremam rezultat pretrage lijekova sa OSNOVNE liste
    resultLijekOsnovnaLista: any;
    //Spremam rezultat pretrage lijekova sa DOPUNSKE liste
    resultLijekDopunskaLista: any;
    //Kreiram EventEmitter da mogu obavjestiti roditeljsku komponentu da ugasi ovaj prozor
    @Output() close = new EventEmitter<any>();
    //Dohvaćam polje u koje se unosi pretraga za OSNOVNU listu lijekova
    @ViewChild('inputLijekOsnovnaLista') inputLijekOsnovnaLista: ElementRef;
    //Dohvaćam polje u koje se unosi pretraga za DOPUNSKU listu lijekova
    @ViewChild('inputLijekDopunskaLista') inputLijekDopunskaLista: ElementRef;
    constructor(
        //Dohvaćam trenutni route
        private route: ActivatedRoute,
        //Dohvaćam servis recepta
        private receptService: ReceptService
    ) {}
    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnInit() {

        //Pretplaćujem se na podatke Resolvera
        this.subs = this.route.data.subscribe(
            (podatci) => {
                //Spremam sve dijagnoze u svoje polje
                this.dijagnoze = podatci.importi.dijagnoze;
                //Spremam sve lijekove sa osnovne liste u svoje polje
                this.lijekoviOsnovnaLista = podatci.importi.lijekoviOsnovnaLista;
                //Spremam sve lijekove sa dopunske liste u svoje polje
                this.lijekoviDopunskaLista = podatci.importi.lijekoviDopunskaLista;
                //Spremam sve magistralne pripravke sa osnovne liste u svoje polje
                this.magPripravciOsnovnaLista = podatci.importi.magistralniPripravciOsnovnaLista;
                //Spremam sve magistralne pripravke sa dopunske liste u svoje polje
                this.magPripravciDopunskaLista = podatci.importi.magistralniPripravciDopunskaLista;

                //Prolazim kroz polje svih dijagnoza
                for(const dijagnoza of this.dijagnoze){
                    //U polje naziva dijagnoza dodavam svaki naziv dijagnoze iz importanog polja
                    this.naziviDijagnoze.push(dijagnoza.imeDijagnoza);
                    //U polje MKB šifra dijagnoza dodavam svaki MKB dijagnoze iz importanog polja
                    this.mkbSifre.push(dijagnoza.mkbSifra);
                }
                //Prolazim kroz polje svih lijekova sa osnovne liste
                for(const lijek of this.lijekoviOsnovnaLista){
                    //U polje dodavam naziv - oblik, jačina i pakiranje lijeka
                    this.lijekoviOsnovnaListaOJP.push(lijek.zasticenoImeLijek + " " + lijek.oblikJacinaPakiranjeLijek);
                }
                //Prolazim kroz polje svih lijekova sa dopunske liste
                for(const lijek of this.lijekoviDopunskaLista){
                    //U polje dodavam naziv - oblik, jačina i pakiranje lijeka
                    this.lijekoviDopunskaListaOJP.push(lijek.zasticenoImeLijek + " " + lijek.oblikJacinaPakiranjeLijek);
                }
                //Prolazim kroz polje svih magistralnih pripravaka sa osnovne liste
                for(const pripravak of this.magPripravciOsnovnaLista){
                    //U svoje polje spremam njihove nazive
                    this.magPripravciNaziviOsnovnaLista.push(pripravak.nazivMagPripravak);
                }
                //Prolazim kroz polje svih magistranih pripravaka sa dopunske liste
                for(const pripravak of this.magPripravciDopunskaLista){
                    //U svoje polje spremam njihove nazive
                    this.magPripravciNaziviDopunskaLista.push(pripravak.nazivMagPripravak);
                }

                //Kreiram formu unosa novog recepta
                this.forma = new FormGroup({
                    'primarnaDijagnoza': new FormControl(null),
                    'mkbPrimarnaDijagnoza': new FormControl(null),
                    'sekundarnaDijagnoza': new FormArray([
                        new FormControl(null)
                    ],{validators: this.isValidSekundarnaDijagnoza.bind(this)}),
                    'tip': new FormControl("lijek"),
                    'osnovnaListaLijek': new FormGroup({
                        'osnovnaListaLijekDropdown': new FormControl(),
                        'osnovnaListaLijekText': new FormControl()
                    }),
                    'dopunskaListaLijek': new FormGroup({
                        'dopunskaListaLijekDropdown': new FormControl(),
                        'dopunskaListaLijekText': new FormControl()
                    }),
                    'osnovnaListaMagPripravak': new FormGroup({
                        'osnovnaListaMagPripravakDropdown': new FormControl(),
                        'osnovnaListaMagPripravakText' : new FormControl()
                    }),
                    'dopunskaListaMagPripravak': new FormGroup({
                        'dopunskaListaMagPripravakDropdown': new FormControl(),
                        'dopunskaListaMagPripravakText': new FormControl()
                    }),
                    'kolicina': new FormGroup({
                        'kolicinaDropdown': new FormControl(),
                        'kolicinaRimski': new FormControl(),
                        'kolicinaLatinski': new FormControl()
                    }),
                    'doziranje': new FormGroup({
                        'doziranjeFrekvencija': new FormControl(),
                        'doziranjePeriod': new FormControl(),
                        'doziranjeText': new FormControl()
                    }),
                    'sifraSpecijalist': new FormControl(),
                    'ostaliPodatci': new FormGroup({
                        'hitnost': new FormControl(),
                        'ponovljivost': new FormControl(),
                        'brojPonavljanja': new FormControl(),
                        'rijecimaBrojPonavljanja': new FormControl()
                    })
                },{validators: this.isValidDijagnoze.bind(this)});
                //Onemogućavam inicijalno unos sekundarne dijagnoze
                this.forma.get('sekundarnaDijagnoza').disable();
            }
        );

        //Pretplaćujem se na promjene u pojedinim dijelovima forme
        this.subsPromjeneForma = merge(
            this.forma.get('primarnaDijagnoza').valueChanges,
            this.forma.get('mkbPrimarnaDijagnoza').valueChanges,
            this.forma.get('osnovnaListaLijek.osnovnaListaLijekDropdown').valueChanges,
            this.forma.get('dopunskaListaLijek.dopunskaListaLijekDropdown').valueChanges,
            this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown').valueChanges,
            this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown').valueChanges
        ).subscribe(
            //Dohvaćam unesene vrijednosti
            (value) => {
                //Ako se unesena vrijednost NALAZI u nazivima dijagnoza, onda znam da je liječnik unio vrijednost primarne dijagnoze
                if(this.naziviDijagnoze.indexOf(value) !== -1){
                    //Ako je taj unos ispravan
                    if(this.forma.get('primarnaDijagnoza').valid){
                        //Pozivam metodu da popuni polje MKB šifre te dijagnoze
                        Validacija.nazivToMKB(value,this.dijagnoze,this.forma);
                        //Omogućavam unos sekundarnih dijagnoza
                        this.forma.get('sekundarnaDijagnoza').enable();
                    }
                }
                //Ako se unesena vrijednost NALAZI u MKB šiframa dijagnoza, onda znam da je liječnik unio vrijednost MKB šifre dijagnoze
                if(this.mkbSifre.indexOf(value) !== -1){
                    //Ako je taj unos ispravan
                    if(this.forma.get('mkbPrimarnaDijagnoza').valid){
                        //Pozivam metodu da popuni polje naziva primarne dijagnoze
                        Validacija.MKBtoNaziv(value,this.dijagnoze,this.forma);
                        //Omogućavam unos sekundarne dijagnoze
                        this.forma.get('sekundarnaDijagnoza').enable();
                    }
                }
                //Ako se unesena vrijednost NE NALAZI u MKB šiframa
                if(this.mkbSifre.indexOf(value) === -1){
                    //Te unos u polju MKB-a se NE NALAZI u MKB šiframa I unos se NE NALAZI u nazivima primarne dijagnoze
                    if(this.mkbSifre.indexOf(this.forma.get('mkbPrimarnaDijagnoza').value) === -1 && this.naziviDijagnoze.indexOf(value) === -1){
                        //Postavi naziv primarne dijagnoze na null
                        this.forma.get('primarnaDijagnoza').patchValue(null,{emitEvent: false});
                        //Dok ne ostane jedna sekundarna dijagnoza u arrayu
                        while(this.getControlsSekundarna().length !== 1){
                            //Briši mu prvi element 
                            (<FormArray>this.forma.get('sekundarnaDijagnoza')).removeAt(0);
                        }
                        //Kada je ostala jedna vrijednost sek. dijagnoze, resetiraj joj vrijednost i onemogući unos
                        this.forma.get('sekundarnaDijagnoza').reset();
                        this.forma.get('sekundarnaDijagnoza').disable();
                    }
                }
                //Ako se unesena vrijednost NALAZI u polju OSNOVNE LISTE LIJEKOVA
                if(this.lijekoviOsnovnaListaOJP.indexOf(value) !== -1){
                    //Te ako su popunjeni ILI dropdown ILI text polje osnovne liste lijekova
                    if(this.lijekoviOsnovnaListaOJP.indexOf(this.forma.get('osnovnaListaLijek.osnovnaListaLijekDropdown').value) !== -1 
                        || this.lijekoviOsnovnaListaOJP.indexOf(this.forma.get('osnovnaListaLijek.osnovnaListaLijekText').value) !== -1){
                        //Resetiraj polja osnovne liste lijekova
                        this.forma.get('dopunskaListaLijek.dopunskaListaLijekDropdown').reset();   
                        this.forma.get('dopunskaListaLijek.dopunskaListaLijekText').reset();
                    }
                }
                //Ako se unesena vrijednost NALAZI u polju DOPUNSKE LISTE LIJEKOVA
                if(this.lijekoviDopunskaListaOJP.indexOf(value) !== -1){
                    //Te su popunjeni ILI dropdown ili text polje dopunske liste lijekova
                    if(this.lijekoviDopunskaListaOJP.indexOf(this.forma.get('dopunskaListaLijek.dopunskaListaLijekDropdown').value) !== -1 
                        || this.lijekoviDopunskaListaOJP.indexOf(this.forma.get('dopunskaListaLijek.dopunskaListaLijekText').value) !== -1){
                        //Resetiraj polja osnovne liste lijekova
                        this.forma.get('osnovnaListaLijek.osnovnaListaLijekDropdown').reset();   
                        this.forma.get('osnovnaListaLijek.osnovnaListaLijekText').reset();
                    }
                }
                //Ako se unesena vrijednost NALAZI u polju MAGISTRALNIH PRIPRAVAKA OSNOVNE LISTE
                if(this.magPripravciNaziviOsnovnaLista.indexOf(value) !== -1){
                    //Ako se unesena vrijednost BAŠ ODNOSI na dropdown ILI text polje magistralnih pripravaka osnovne liste
                    if(this.magPripravciNaziviOsnovnaLista.indexOf(this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown').value) !== -1 
                        || this.magPripravciNaziviOsnovnaLista.indexOf(this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').value) !== -1){
                            //Resetiraj polja dopunske liste magistralnih pripravaka
                            this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown').reset();
                            this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').reset();
                    }
                }
                //Ako se unesena vrijednost NALAZI u polju MAGISTRALNIH PRIPRAVAKA DOPUNSKE LISTE
                if(this.magPripravciNaziviDopunskaLista.indexOf(value) !== -1){
                    //Ako se unesena vrijednost BAŠ ODNOSI na dropdown ILI text polje magistralnih pripravaka dopunske liste
                    if(this.magPripravciNaziviDopunskaLista.indexOf(this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown').value) !== -1 
                        || this.magPripravciNaziviDopunskaLista.indexOf(this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').value) !== -1){
                            //Resetiraj polja osnovne liste magistralnih pripravaka
                            this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown').reset();
                            this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').reset();
                    }
                }
            }
        );
        //Pretplaćujem se na promjene u tekstualnim poljima lijekova i mag.pripravaka
        this.subsText = merge(
            this.forma.get('osnovnaListaLijek.osnovnaListaLijekText').valueChanges.pipe(
                distinctUntilChanged(),
                concatMap(value => {
                    //Označavam da je liječnik počeo pretraživati lijekove OSNOVNE liste
                    this.isPretragaLijekOsnovnaLista = true;
                    //Označavam da je liječnik prestao pretraživati ostale proizvode
                    this.isPretragaLijekDopunskaLista = false;
                    return this.receptService.getLijekOsnovnaListaPretraga(value);
                })
            ),
            this.forma.get('dopunskaListaLijek.dopunskaListaLijekText').valueChanges.pipe(
                distinctUntilChanged(),
                concatMap(value => {
                    //Označavam da je liječnik počeo pretraživati lijekove DOPUNSKE liste
                    this.isPretragaLijekDopunskaLista = true;
                    //Označavam da je liječnik prestao pretraživati ostale proizvode
                    this.isPretragaLijekOsnovnaLista = false;
                    return this.receptService.getLijekDopunskaListaPretraga(value);
                })
            )
        ).subscribe(
            (odgovor) => {
                console.log(odgovor);
                //Ako liječnik pretražuje lijekove sa OSNOVNE LISTE
                if(this.isPretragaLijekOsnovnaLista){
                    //Ako je polje unosa prazno
                    if(this.osnovnaListaLijekText.value.length === 0){
                        //Digni ul tag
                        this.isPretragaLijekOsnovnaLista = false;
                    }
                    //Ako je server vratio uspješnu poruku
                    if(odgovor["success"] !== "false"){
                        //Resetiram poruku 
                        this.porukaNemaRezultata = null;
                        //Spremam odgovor servera u svoje polje rezultata
                        this.resultLijekOsnovnaLista = odgovor;
                    } 
                    //Ako je server vratio da nema rezultata
                    else{
                        //Spremam odgovor servera da nema rezultata
                        this.porukaNemaRezultata = odgovor["message"];
                    } 
                }
                //Ako liječnik pretražuje lijekove sa DOPUNSKE LISTE
                if(this.isPretragaLijekDopunskaLista){
                    //Ako je polje unosa prazno
                    if(this.dopunskaListaLijekText.value.length === 0){
                        //Digni ul tag
                        this.isPretragaLijekDopunskaLista = false;
                    }
                    //Ako je server vratio uspješnu poruku (tj. da ima rezultata)
                    if(odgovor["success"] !== "false"){
                        //Resetiram poruku
                        this.porukaNemaRezultata = null;
                        //Spremam odgovor servera u svoje polje rezultata
                        this.resultLijekDopunskaLista = odgovor;
                    }
                    else{
                        //Spremam odgovor servera da nema rezultata
                        this.porukaNemaRezultata = odgovor["message"];
                    }
                }
            }
        )
    }
    //Metoda koja se pokreće kada liječnik izabere neki proizvod iz liste pretrage
    onClickLi(proizvod: string){
        //Ako se naziv proizvoda NALAZI u listi lijekova OSNOVNE LISTE
        if(this.lijekoviOsnovnaListaOJP.indexOf(proizvod) !== -1){
            //U polje unosa pretrage osnovne liste lijekova, stavljam tu vrijednost
            this.inputLijekOsnovnaLista.nativeElement.value = proizvod;
            //Skrivam ul tag
            this.isPretragaLijekOsnovnaLista = false;
            //Resetiraj dropdown i tekstualno polje dopunske liste lijekova
            this.dopunskaListaLijekDropdown.reset();
            this.dopunskaListaLijekText.reset();
        }
        //Ako se naziv proizvoda NALAZI u listi lijekova DOPUNSKE LISTE
        if(this.lijekoviDopunskaListaOJP.indexOf(proizvod) !== -1){
            //U polje unosa pretrage dopunske liste lijekova, stavljam tu vrijednost
            this.inputLijekDopunskaLista.nativeElement.value = proizvod;
            //Skrivam ul tag
            this.isPretragaLijekDopunskaLista = false;
            //Resetiraj dropdown i tekstualno polje osnovne liste lijekova
            this.osnovnaListaLijekDropdown.reset();
            this.osnovnaListaLijekText.reset();
        }
    }

    //Metoda koja se pokreće kada se promijeni vrijednost radio buttona
    onChange($event){
        //Ako radio button koji je kliknut ima vrijednost "Lijek":
        if($event.target.value === "lijek"){
            //Označavam da liječnik ne želi unijeti mag. pripravak
            this.isMagPripravak = false;
            //Označavam da liječnik želi unijeti lijek
            this.isLijek = true;
            //Resetiram sva polja vezana za magistralne pripravke
            this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown').reset();
            this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText').reset();
            this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown').reset();
            this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText').reset(); 
        }
        else if($event.target.value === "magPripravak"){
            //Označavam da liječnik želi unijeti mag.pripravak
            this.isMagPripravak = true;
            //Označavam da liječnik ne želi unijeti lijek
            this.isLijek = false;
            //Resetiram sva polja vezana uz lijekove
            this.forma.get('osnovnaListaLijek.osnovnaListaLijekDropdown').reset();
            this.forma.get('osnovnaListaLijek.osnovnaListaLijekText').reset();
            this.forma.get('dopunskaListaLijek.dopunskaListaLijekDropdown').reset();
            this.forma.get('dopunskaListaLijek.dopunskaListaLijekText').reset();
        }
    }

    //Metoda koja provjerava je li uneseno više istih sekundarnih dijagnoza
    isValidSekundarnaDijagnoza(array: FormArray): {[key: string]: boolean}{
        //Kreiram pomoćno polje
        let pom = [];
        //Prolazim kroz array 
        for(let control of array.controls){
            //Ako se vrijednost sekundarne dijagnoze VEĆ NALAZI u pom polju, ali da nije "Odaberite sekundarnu dijagnozu"
            if(pom.indexOf(control.value) !== -1 && control.value !== null){
                //U svoju varijablu spremam sekundarnu dijagnozu koja je duplikat
                this.sekDijagnoza = control.value;
                return {'duplikat': true};
            }
            //Ako se vrijednost sekundarne dijagnoze NE NALAZI u pom polju
            else{
                //Dodaj ga u pom polje
                pom.push(control.value);
            }
        }
        return null;
    } 
    
    //Metoda koja provjerava je li primarna dijagnoza ista kao i neka od sekundarnih dijagnoza
    isValidDijagnoze(group: FormGroup): {[key: string]: boolean} {
      //Prolazim kroz polje sekundarnih dijagnoza
      for(let control of (group.get('sekundarnaDijagnoza') as FormArray).controls){
          //Ako je vrijednost primarne dijagnoze jednaka vrijednosti sekundarne dijagnoze, ali da oba dvije nisu null, jer bih bilo (Odaberite dijagnozu === Odaberite dijagnozu)
          if(group.get('primarnaDijagnoza').value === control.value && (group.get('primarnaDijagnoza') !== null && control.value !== null)){
              //Spremam vrijednost sekundarne dijagnoze koja je jednaka primarnoj dijagnozi
              this.dijagnoza = control.value;
              return {'primarnaJeIstaKaoSekundarna': true};
          }
      }
      return null;
    }

    //Ova metoda se poziva kada korisnik klikne "Izađi" ili negdje izvan prozora
    onClose(){
        //Izađi iz prozora 
        this.close.emit();
    }
    //Dohvaća pojedine form controlove unutar polja 
    getControlsSekundarna(){
      return (this.forma.get('sekundarnaDijagnoza') as FormArray).controls;
    }

    //Kada se klikne button "Dodaj dijagnozu"
    onAddDiagnosis(){
      (<FormArray>this.forma.get('sekundarnaDijagnoza')).push(
        new FormControl(null) 
      );
    }

    //Kada se klikne button "X"
    onDeleteDiagnosis(index: number){
      (<FormArray>this.forma.get('sekundarnaDijagnoza')).removeAt(index);
    }

    //Ova metoda se poziva kada se komponenta inicijalizira
    ngOnDestroy(){
        //Ako postoji pretplata
        if(this.subs){
            //Izađi iz pretplate
            this.subs.unsubscribe();
        }
        //Ako postoji pretplata
        if(this.subsPromjeneForma){
            //Izađi iz pretplate
            this.subsPromjeneForma.unsubscribe();
        }
        //Ako postoji pretplata
        if(this.subsText){
            //Izađi iz pretplate
            this.subsText.unsubscribe();
        }
    }

    //Getteri za dijelove forme
    get primarnaDijagnoza(): FormControl{
        return this.forma.get('primarnaDijagnoza') as FormControl;
    }
    get mkbPrimarnaDijagnoza(): FormControl{
        return this.forma.get('mkbPrimarnaDijagnoza') as FormControl;
    }
    get sekundarnaDijagnoza(): FormArray{
      return this.forma.get('sekundarnaDijagnoza') as FormArray;
    }
    get tip(): FormGroup{
        return this.forma.get('tip') as FormGroup;
    }
    get lijek(): FormControl{
        return this.forma.get('tip.lijek') as FormControl;
    }
    get magPripravak(): FormControl{
        return this.forma.get('tip.magPripravak') as FormControl;
    }
    get osnovnaListaLijek(): FormGroup{
        return this.forma.get('osnovnaListaLijek') as FormGroup;
    }
    get osnovnaListaLijekDropdown(): FormControl{
        return this.forma.get('osnovnaListaLijek.osnovnaListaLijekDropdown') as FormControl;
    }
    get osnovnaListaLijekText(): FormControl{
        return this.forma.get('osnovnaListaLijek.osnovnaListaLijekText') as FormControl;
    }
    get dopunskaListaLijek(): FormGroup{
        return this.forma.get('dopunskaListaLijek') as FormGroup;
    }
    get dopunskaListaLijekDropdown(): FormControl{
        return this.forma.get('dopunskaListaLijek.dopunskaListaLijekDropdown') as FormControl;
    }
    get dopunskaListaLijekText(): FormControl{
        return this.forma.get('dopunskaListaLijek.dopunskaListaLijekText') as FormControl;
    }
    get osnovnaListaMagPripravak(): FormGroup{
        return this.forma.get('osnovnaListaMagPripravak') as FormGroup;
    }
    get osnovnaListaMagPripravakDropdown(): FormControl{
        return this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakDropdown') as FormControl;
    }
    get osnovnaListaMagPripravakText(): FormControl{
        return this.forma.get('osnovnaListaMagPripravak.osnovnaListaMagPripravakText') as FormControl;
    }
    get dopunskaListaMagPripravak(): FormGroup{
        return this.forma.get('dopunskaListaMagPripravak') as FormGroup;
    }
    get dopunskaListaMagPripravakDropdown(): FormControl{
        return this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakDropdown') as FormControl;
    }
    get dopunskaListaMagPripravakText(): FormControl{
      return this.forma.get('dopunskaListaMagPripravak.dopunskaListaMagPripravakText') as FormControl;
    }
    get kolicina(): FormGroup{
        return this.forma.get('kolicina') as FormGroup;
    }
    get kolicinaDropdown(): FormControl{
        return this.forma.get('kolicina.kolicinaDropdown') as FormControl;
    }
    get kolicinaRimski(): FormControl{
        return this.forma.get('kolicina.kolicinaRimski') as FormControl;
    }
    get kolicinaLatinski(): FormControl{
        return this.forma.get('kolicina.kolicinaLatinski') as FormControl;
    }
    get doziranje(): FormGroup{
        return this.forma.get('doziranje') as FormGroup;
    }
    get doziranjeFrekvencija(): FormControl{
        return this.forma.get('doziranje.doziranjeFrekvencija') as FormControl;
    }
    get doziranjePeriod(): FormControl{
      return this.forma.get('doziranje.doziranjePeriod') as FormControl;
    }
    get doziranjeText(): FormControl{
      return this.forma.get('doziranje.doziranjeText') as FormControl;
    }
    get sifraSpecijalist(): FormControl{
        return this.forma.get('sifraSpecijalist') as FormControl;
    }
    get ostaliPodatci(): FormGroup{
        return this.forma.get('ostaliPodatci') as FormGroup;
    }
    get hitnost(): FormControl{
      return this.forma.get('ostaliPodatci.hitnost') as FormControl;
    }
    get ponovljivost(): FormControl{
      return this.forma.get('ostaliPodatci.ponovljivost') as FormControl;
    }
    get brojPonavljanja(): FormControl{
      return this.forma.get('ostaliPodatci.brojPonavljanja') as FormControl;
    }
    get rijecimaBrojPonavljanja(): FormControl{
      return this.forma.get('ostaliPodatci.rijecimaBrojPonavljanja') as FormControl;
    }
}
