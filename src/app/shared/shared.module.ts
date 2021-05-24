import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PretragaPacijentComponent } from './pretraga-pacijent/pretraga-pacijent.component';
import { CekaonicaComponent } from './cekaonica/cekaonica.component';
import { DetaljiPregledaComponent } from './cekaonica/detalji-pregleda/detalji-pregleda.component';
import { IzdaniReceptiComponent } from './izdani-recepti/izdani-recepti.component';
import { AzuriranjeOsobnihPodatakaComponent } from './azuriranje-osobnih-podataka/azuriranje-osobnih-podataka.component';
import { AzuriranjeLozinkaComponent } from './azuriranje-lozinka/azuriranje-lozinka.component';
import { IzdaneUputniceComponent } from './izdane-uputnice/izdane-uputnice.component';
import { UzorciComponent } from './uzorci/uzorci.component';
import { AngularMaterialModule } from '../angular-material.module';
import { PrikaziPovijestBolestiComponent } from './prikazi-povijest-bolesti/prikazi-povijest-bolesti.component';
import { DialogComponent } from './dialog/dialog.component';
import { PovezaniPovijestBolestiComponent } from '../lijecnik/povezani-povijest-bolesti/povezani-povijest-bolesti.component';

@NgModule({
    declarations: [
        PretragaPacijentComponent,
        CekaonicaComponent,
        DetaljiPregledaComponent,
        IzdaniReceptiComponent,
        AzuriranjeOsobnihPodatakaComponent,
        AzuriranjeLozinkaComponent,
        PrikaziPovijestBolestiComponent,
        PovezaniPovijestBolestiComponent,
        IzdaneUputniceComponent,
        UzorciComponent,
        DialogComponent
    ],
    imports:[
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AngularMaterialModule
    ],
    exports: [
        PretragaPacijentComponent,
        CekaonicaComponent,
        DetaljiPregledaComponent,
        IzdaniReceptiComponent,
        AzuriranjeOsobnihPodatakaComponent,
        AzuriranjeLozinkaComponent,
        IzdaneUputniceComponent,
        UzorciComponent,
        PrikaziPovijestBolestiComponent,
        PovezaniPovijestBolestiComponent
    ],
    entryComponents: [DialogComponent]
})
export class SharedModule{}
