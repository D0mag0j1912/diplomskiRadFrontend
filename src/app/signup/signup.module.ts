import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { SignupRoutingModule } from './signup-routing.module';
import { SignupComponent } from './signup.component';

@NgModule({
    declarations: [
        SignupComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        SignupRoutingModule,
        SharedModule
    ],
    exports: [
        SignupComponent
    ]
})
export class SignupModule{

}