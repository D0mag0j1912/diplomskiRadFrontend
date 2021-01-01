import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MedSestraRoutingModule } from './med-sestra-routing.module';
import { MedSestraComponent } from './med-sestra.component';
import { MedSestraAzuriranjePodatciComponent } from './med-sestra-azuriranje-podatci/med-sestra-azuriranje-podatci.component';
import { MedSestraAzuriranjeLozinkaComponent } from './med-sestra-azuriranje-lozinka/med-sestra-azuriranje-lozinka.component';
import { NarucivanjeComponent } from './narucivanje/narucivanje.component';
import { OpciPodatciPregledaComponent } from './opci-podatci-pregleda/opci-podatci-pregleda.component';

@NgModule({
    declarations: [
        MedSestraComponent,
        MedSestraAzuriranjePodatciComponent,
        MedSestraAzuriranjeLozinkaComponent,
        NarucivanjeComponent,
        OpciPodatciPregledaComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        SharedModule,
        MedSestraRoutingModule,
        ReactiveFormsModule
    ],
    exports: [
        MedSestraComponent,
        MedSestraAzuriranjePodatciComponent,
        MedSestraAzuriranjeLozinkaComponent,
        NarucivanjeComponent,
        OpciPodatciPregledaComponent
    ]
})
export class MedSestraModule{

}