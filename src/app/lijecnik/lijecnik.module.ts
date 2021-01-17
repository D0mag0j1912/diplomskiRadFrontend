import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LijecnikRoutingModule } from './lijecnik-routing.module';
import { LijecnikComponent } from './lijecnik.component';
import { AzuriranjeOsobnihPodatakaComponent } from './azuriranje-osobnih-podataka/azuriranje-osobnih-podataka.component';
import { AzuriranjeLozinkaComponent } from './azuriranje-lozinka/azuriranje-lozinka.component';
import { PovijestBolestiComponent } from './povijest-bolesti/povijest-bolesti.component';
import { PovezaniPovijestBolestiComponent } from './povezani-povijest-bolesti/povezani-povijest-bolesti.component';
import { ReceptModule } from './recept/recept.module';
@NgModule({
    declarations: [
        LijecnikComponent,
        AzuriranjeOsobnihPodatakaComponent,
        AzuriranjeLozinkaComponent,
        PovijestBolestiComponent,
        PovezaniPovijestBolestiComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
        LijecnikRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        ReceptModule
    ],
    exports: [
        LijecnikComponent,
        AzuriranjeOsobnihPodatakaComponent,
        AzuriranjeLozinkaComponent,
        PovijestBolestiComponent,
        PovezaniPovijestBolestiComponent
    ]
})
export class LijecnikModule{

}