import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';

@NgModule({
    declarations: [
        //U ovom se modulu nalazi komponenta LoginComponent
        LoginComponent
    ],
    imports: [
        //U ovom modulu importam ove module jer mi trebaju njihove komponente, funkcionalnosti...
        CommonModule,
        RouterModule,
        FormsModule,
        //Zbog routova za login
        LoginRoutingModule,
        //Zbog alerta, spinnera itd..
        SharedModule
    ],
    //Exportam ovu komponentu da kad drugi moduli importaju ovaj modul, mogu se služiti ovom komponentom
    exports: [LoginComponent]
})
export class LoginModule{

}