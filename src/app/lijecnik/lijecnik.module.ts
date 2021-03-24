import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LijecnikRoutingModule } from './lijecnik-routing.module';
import { LijecnikComponent } from './lijecnik.component';
import { PovijestBolestiComponent } from './povijest-bolesti/povijest-bolesti.component';
@NgModule({
    declarations: [
        LijecnikComponent,
        PovijestBolestiComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
        LijecnikRoutingModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        LijecnikComponent,
        PovijestBolestiComponent
    ]
})
export class LijecnikModule{

}