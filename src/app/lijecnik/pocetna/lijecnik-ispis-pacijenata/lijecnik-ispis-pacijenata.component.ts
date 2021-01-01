import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Pacijent } from 'src/app/shared/modeli/pacijent.model';
import { LijecnikService } from '../../lijecnik.service';

@Component({
  selector: 'app-lijecnik-ispis-pacijenata',
  templateUrl: './lijecnik-ispis-pacijenata.component.html',
  styleUrls: ['./lijecnik-ispis-pacijenata.component.css']
})
export class LijecnikIspisPacijenataComponent implements OnInit, OnDestroy {
    //Oznaka je li brisanje aktivno
    isBrisanje: boolean = false;
    //Spremam text poruke brisanja pacijenta
    brisanjePoruka: string = null;
    //Oznaka je li spinner aktivan
    isLoading: boolean = false;
    //Oznaka je li imam odgovor od servera
    response: boolean = false;
    //Spremam odgovor servera
    responsePoruka: string = null;
    //Spremam pretplatu na Observable koji dohvaća sve pacijente
    subs: Subscription;
    //Spremam pretplatu na Observable koji briše pacijenta
    subsBrisanje: Subscription;
    //Spremam pretplatu na Observable koji dohvaća trenutni broj pacijenata
    subsBrojPacijenata: Subscription;
    //Spremam sve pacijente u polje
    pacijenti: Pacijent[];

    //Spremam ID pacijenta iz retka tablice gdje je liječnik kliknuo
    idPacijent: number;
    //Spremam index pacijenta iz retka tablice gdje je liječnik kliknuo
    indexPacijent: number;
    //Spremam MBO pacijenta iz retka tablice gdje je liječnik kliknuo
    mboPacijent: number;
    //Spremam ime pacijenta iz retka tablice gdje je liječnik kliknuo
    imePacijent: string;
    //Spremam prezime pacijenta iz retka tablice gdje je liječnik kliknuo
    prezPacijent: string;

    //Kreiram EventEmitter da obavijestim roditeljsku komponentu da gasi prikaz tablice
    @Output() closeTablica = new EventEmitter<any>();

    constructor(
      //Dohvaćam liječnički servis
      private lijecnikService: LijecnikService,
      //Dohvaćam router da mogu preusmjeriti liječnika na pacijentovu stranicu
      private router: Router,
      //Dohvaćam trenutni route 
      private route: ActivatedRoute
    ) { }

    //Ova metoda se izvodi kada se komponenta inicijalizira
    ngOnInit() {
      
      //Aktiviram spinner 
      this.isLoading = true;
      //Pretplaćujem se na Observable pacijenata i dohvaćam sve pacijente
      this.subs = this.lijecnikService.obsPacijenti.subscribe(
        (response) => {
          //Gasim spinner
          this.isLoading = false;
          //U polje pacijenata spremam vrijednosti iz Observable-a
          this.pacijenti = response;
          //console.log(this.pacijenti);
        }
      );

    }

    //Kada korisnik klikne button "Koš za smeće"
    onDeletePatient(id: number, index: number){

      //Pretplaćujem se na Observable koji vraća odgovor servera 
      this.subsBrisanje = this.lijecnikService.deletePatient(id).subscribe(
        (response) => {
          
          //Označavam da ima odgovora servera
          this.response = true;
          //Spremam odgovor servera
          this.responsePoruka = response["message"];
          
          //Nakon brisanja pacijenta u bazi, moram obrisat pacijenta i u frontendu (polju pacijenata)
          //Uzimam index pacijenta iz prethodnog polja kojega je korisnik obrisao i uklanjam pacijenta na tom indexu 
          this.pacijenti.splice(index,1);
          //U Subject stavljam novu ažuriranu vrijednost polja
          this.lijecnikService.pacijenti.next(this.pacijenti.slice());
          //Zatvori prozor brisanja pacijenta
          this.isBrisanje = false;
          //Pozivam metodu koja vraća trenutni broj pacijenata
          this.onCheckCountPatient();
        }
      );  
    }

    //Metoda koja prikuplja sve podatke iz tablice pacijenata, sprema ih u klasne varijable te otvara prozor brisanja pacijenta
    onGetTableData(id:number, index: number, mbo: number, ime: string, prezime: string){

      //Spremam vrijednosti iz tablice pacijenata u svoje varijable
      this.idPacijent = id;
      this.indexPacijent = index;
      this.mboPacijent = mbo;
      this.imePacijent = ime;
      this.prezPacijent = prezime;

      //Prvo otvaram prozor za brisanje u kojemu liječnik potvrđuje brisanje ili odustaje
      this.isBrisanje = true;
      //Stvaram string kojega šaljem prozoru
      let poruka = `Jeste li sigurni da želite obrisati pacijenta ${this.imePacijent} ${this.prezPacijent}, MBO = ${this.mboPacijent}?`;
      this.brisanjePoruka = poruka;

    }

    ngOnDestroy(){
      //Ako postoji pretplata
      if(this.subs){
        //Izađi iz pretplate
        this.subs.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsBrisanje){
        //Izađi iz pretplate
        this.subsBrisanje.unsubscribe();
      }
      //Ako postoji pretplata
      if(this.subsBrojPacijenata){
        //Izađi iz pretplate
        this.subsBrojPacijenata.unsubscribe();
      }
    }

    //Kada korisnik klikne "Close" na prozoru odgovora servera
    onClose(){
      //Zatvori prozor
      this.response = false;
    }

    //Kada korisnik klikne "Odustani" na prozoru brisanja pacijenta
    onCloseBrisanje(){
      //Zatvori prozor
      this.isBrisanje = false;
    }

    //Kada liječnik klikne na button "Obriši" na prozoru brisanja
    onBrisanje(){
      //Pokreni postupak brisanja pacijenta
      this.onDeletePatient(this.idPacijent,this.indexPacijent);
    }

    //Metoda koja provjerava koliko je pacijenata ostalo u sustavu
    onCheckCountPatient(){
      //Pretplaćujem se na Observable u kojemu se nalazi broj trenutno registriranih pacijenata
      this.subsBrojPacijenata = this.lijecnikService.checkCountPatient().subscribe(
        (response) => {
          //Ako je broj vraćenih pacijenata == 0, emitiram event u roditeljsku komponentu pocetna.ts da ugasim prikaz tablice
          if(response == 0){
            //Emitiram event prema roditeljskoj komponenti
            this.closeTablica.emit();
          }
        }
      );
    }

    //Metoda koja preusmjerava liječnika na pacijentovu stranicu
    onNavigatePacijent(id: number){
      //Presmjeri liječnika na pacijentovu stranicu
      this.router.navigate(['../pacijent/',id,'posjete','dodajPosjet'], {relativeTo: this.route});
    }

}
