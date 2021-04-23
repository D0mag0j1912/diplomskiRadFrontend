import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MedSestraRoutingModule } from './med-sestra-routing.module';
import { MedSestraComponent } from './med-sestra.component';
import { NarucivanjeComponent } from './narucivanje/narucivanje.component';
import { OpciPodatciPregledaComponent } from './opci-podatci-pregleda/opci-podatci-pregleda.component';
import { UzorciComponent } from './uzorci/uzorci.component';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@NgModule({
    declarations: [
        MedSestraComponent,
        NarucivanjeComponent,
        OpciPodatciPregledaComponent,
        UzorciComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        SharedModule,
        MedSestraRoutingModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule
    ],
    exports: [
        MedSestraComponent,
        NarucivanjeComponent,
        OpciPodatciPregledaComponent
    ]
})
export class MedSestraModule{

}
