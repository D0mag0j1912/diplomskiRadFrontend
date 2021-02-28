import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from './alert/alert.component';
import { DropdownDirective } from './direktive/dropdown.directive';
import { BrisanjePacijentaAlertComponent } from './brisanje-pacijenta-alert/brisanje-pacijenta-alert.component';
import { PretragaPacijentComponent } from './pretraga-pacijent/pretraga-pacijent.component';
import { OtvoreniSlucajComponent } from './otvoreni-slucaj/otvoreni-slucaj.component';
import { NarudzbaComponent } from './narudzba/narudzba.component';
import { CekaonicaComponent } from './cekaonica/cekaonica.component';
import { DetaljiPregledaComponent } from './cekaonica/detalji-pregleda/detalji-pregleda.component';
import { PrikaziPovijestBolestiComponent } from './prikazi-povijest-bolesti/prikazi-povijest-bolesti.component';
import { PovezaniPovijestBolestiComponent } from '../lijecnik/povezani-povijest-bolesti/povezani-povijest-bolesti.component';

@NgModule({
    declarations: [
        AlertComponent,
        DropdownDirective,
        BrisanjePacijentaAlertComponent,
        PretragaPacijentComponent,
        OtvoreniSlucajComponent,
        NarudzbaComponent,
        CekaonicaComponent,
        DetaljiPregledaComponent,
        PrikaziPovijestBolestiComponent,
        PovezaniPovijestBolestiComponent
    ],
    imports:[
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        AlertComponent,
        DropdownDirective,
        BrisanjePacijentaAlertComponent,
        PretragaPacijentComponent,
        OtvoreniSlucajComponent,
        NarudzbaComponent,
        CekaonicaComponent,
        DetaljiPregledaComponent,
        PrikaziPovijestBolestiComponent,
        PovezaniPovijestBolestiComponent
    ]
})
export class SharedModule{

}