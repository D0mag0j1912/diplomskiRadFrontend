import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from './alert/alert.component';
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

@NgModule({
    declarations: [
        AlertComponent,
        PretragaPacijentComponent,
        CekaonicaComponent,
        DetaljiPregledaComponent,
        IzdaniReceptiComponent,
        AzuriranjeOsobnihPodatakaComponent,
        AzuriranjeLozinkaComponent,
        PrikaziPovijestBolestiComponent,
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
        AlertComponent,
        PretragaPacijentComponent,
        CekaonicaComponent,
        DetaljiPregledaComponent,
        IzdaniReceptiComponent,
        AzuriranjeOsobnihPodatakaComponent,
        AzuriranjeLozinkaComponent,
        IzdaneUputniceComponent,
        UzorciComponent,
        PrikaziPovijestBolestiComponent,
        DialogComponent
    ],
    entryComponents: [DialogComponent]
})
export class SharedModule{}
