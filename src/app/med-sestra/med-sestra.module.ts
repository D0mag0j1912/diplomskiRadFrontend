import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../angular-material.module';
import { SharedModule } from '../shared/shared.module';
import { MedSestraRoutingModule } from './med-sestra-routing.module';
import { MedSestraComponent } from './med-sestra.component';
import { NarucivanjeComponent } from './narucivanje/narucivanje.component';
import { OpciPodatciPregledaComponent } from './opci-podatci-pregleda/opci-podatci-pregleda.component';
import {NarudzbaComponent} from './narudzba/narudzba.component';
import { OtvoreniSlucajComponent } from './otvoreni-slucaj/otvoreni-slucaj.component';

@NgModule({
    declarations: [
        MedSestraComponent,
        NarucivanjeComponent,
        NarudzbaComponent,
        OpciPodatciPregledaComponent,
        OtvoreniSlucajComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        SharedModule,
        MedSestraRoutingModule,
        ReactiveFormsModule,
        AngularMaterialModule
    ],
    exports: [
        MedSestraComponent,
        NarucivanjeComponent,
        NarudzbaComponent,
        OpciPodatciPregledaComponent,
        OtvoreniSlucajComponent
    ]
})
export class MedSestraModule{

}
