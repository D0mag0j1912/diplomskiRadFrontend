import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { SekundarniHeaderComponent } from '../sekundarni-header/sekundarni-header.component';
import { ObradaRoutingModule } from './obrada-routing.module';
import { ObradaComponent } from './obrada.component';
import { OsnovniPodatciComponent } from './osnovni-podatci/osnovni-podatci.component';
import { ZdravstveniPodatciComponent } from './zdravstveni-podatci/zdravstveni-podatci.component';

@NgModule({
    declarations: [
        OsnovniPodatciComponent,
        ZdravstveniPodatciComponent,
        ObradaComponent,
        SekundarniHeaderComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        SharedModule,
        ReactiveFormsModule,
        ObradaRoutingModule
    ],
    exports: [
        OsnovniPodatciComponent,
        ZdravstveniPodatciComponent,
        ObradaComponent,
        SekundarniHeaderComponent
    ]
})
export class ObradaModule{

}