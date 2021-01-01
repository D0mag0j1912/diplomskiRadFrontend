import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LijecnikRoutingModule } from './lijecnik-routing.module';
import { LijecnikComponent } from './lijecnik.component';
import { AzuriranjeOsobnihPodatakaComponent } from './azuriranje-osobnih-podataka/azuriranje-osobnih-podataka.component';
import { AzuriranjeLozinkaComponent } from './azuriranje-lozinka/azuriranje-lozinka.component';
import { PocetnaComponent } from './pocetna/pocetna.component';
import { LijecnikDodajPacijentaComponent } from './lijecnik-dodaj-pacijenta/lijecnik-dodaj-pacijenta.component';
import { LijecnikIspisPacijenataComponent } from './pocetna/lijecnik-ispis-pacijenata/lijecnik-ispis-pacijenata.component';
import { LijecnikAzurirajPacijentaComponent } from './lijecnik-azuriraj-pacijenta/lijecnik-azuriraj-pacijenta.component';
import { PovijestBolestiComponent } from './povijest-bolesti/povijest-bolesti.component';
import { PovezaniPovijestBolestiComponent } from './povezani-povijest-bolesti/povezani-povijest-bolesti.component';
/* import { PacijentModule } from './pacijent/pacijent.module'; */
@NgModule({
    declarations: [
        LijecnikComponent,
        AzuriranjeOsobnihPodatakaComponent,
        AzuriranjeLozinkaComponent,
        PocetnaComponent,
        LijecnikDodajPacijentaComponent,
        LijecnikIspisPacijenataComponent,
        LijecnikAzurirajPacijentaComponent,
        PovijestBolestiComponent,
        PovezaniPovijestBolestiComponent
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
        AzuriranjeOsobnihPodatakaComponent,
        AzuriranjeLozinkaComponent,
        PocetnaComponent,
        LijecnikDodajPacijentaComponent,
        LijecnikIspisPacijenataComponent,
        LijecnikAzurirajPacijentaComponent,
        PovijestBolestiComponent,
        PovezaniPovijestBolestiComponent
    ]
})
export class LijecnikModule{

}