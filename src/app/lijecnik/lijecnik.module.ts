import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LijecnikRoutingModule } from './lijecnik-routing.module';
import { LijecnikComponent } from './lijecnik.component';
import { PovijestBolestiComponent } from './povijest-bolesti/povijest-bolesti.component';
import { NalaziComponent } from './nalazi/nalazi.component';
import { NalaziListComponent } from './nalazi/nalazi-list/nalazi-list.component';
import { NalaziDetailComponent } from './nalazi/nalazi-list/nalazi-detail/nalazi-detail.component';
import { AngularMaterialModule } from '../angular-material.module';
import { PovezaniPovijestBolestiComponent } from './povezani-povijest-bolesti/povezani-povijest-bolesti.component';

@NgModule({
    declarations: [
        LijecnikComponent,
        PovijestBolestiComponent,
        PovezaniPovijestBolestiComponent,
        NalaziComponent,
        NalaziListComponent,
        NalaziDetailComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
        LijecnikRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        AngularMaterialModule
    ],
    exports: [
        LijecnikComponent,
        PovijestBolestiComponent,
        NalaziComponent,
        NalaziListComponent,
        NalaziDetailComponent,
        PovezaniPovijestBolestiComponent
    ]
})
export class LijecnikModule{

}
