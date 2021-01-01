import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { PacijentComponent } from './pacijent.component';
import { PosjeteComponent } from './posjete/posjete.component';
import { PosjeteListComponent } from './posjete-list/posjete-list.component';
import { DodajNoviPosjetComponent } from './posjete/dodaj-novi-posjet/dodaj-novi-posjet.component';
import {PacijentRoutingModule} from './pacijent-routing.module';
@NgModule({
    declarations: [
        PacijentComponent,
        PosjeteComponent,
        PosjeteListComponent,
        DodajNoviPosjetComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        PacijentRoutingModule 
    ],
    exports: [
        PacijentComponent,
        PosjeteComponent,
        PosjeteListComponent,
        DodajNoviPosjetComponent
    ]
})
export class PacijentModule{

}