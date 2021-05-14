import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
import { SharedModule } from '../shared/shared.module';
import { SignupRoutingModule } from './signup-routing.module';
import { SignupComponent } from './signup.component';

@NgModule({
    declarations: [
        SignupComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SignupRoutingModule,
        SharedModule,
        AngularMaterialModule
    ],
    exports: [
        SignupComponent
    ]
})
export class SignupModule{

}
