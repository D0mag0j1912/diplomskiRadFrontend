import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginGuard } from '../login/login.guard';
import { CekaonicaResolverService } from '../shared/cekaonica/cekaonica-resolver.service';
import { CekaonicaComponent } from '../shared/cekaonica/cekaonica.component';
import { MedSestraComponent } from './med-sestra.component';
import { MedSestraGuard } from './med-sestra.guard';
import { NarucivanjeComponent } from './narucivanje/narucivanje.component';
import { DateTimeResolverService } from './narucivanje/dateTime-resolver.service';
import { AzuriranjeOsobnihPodatakaComponent } from '../shared/azuriranje-osobnih-podataka/azuriranje-osobnih-podataka.component';
import { AzuriranjeLozinkaComponent } from '../shared/azuriranje-lozinka/azuriranje-lozinka.component';
import { MedSestraResolverService } from './med-sestra-resolver.service';

const routes = [
    //Kada se upiše /med-sestra u URL, loada se komponenta medicinske sestre 
    {path: '', component: MedSestraComponent, canActivate:[LoginGuard, MedSestraGuard],
    children: [
        {path: 'obrada',loadChildren:() => import('../shared/obrada/obrada.module').then(m => m.ObradaModule)},
        {path: 'cekaonica', component: CekaonicaComponent, resolve: {pacijenti: CekaonicaResolverService}},
        {path: 'narucivanje', component: NarucivanjeComponent, resolve: {podatci: DateTimeResolverService}},
        {path: 'editPersonalData', component: AzuriranjeOsobnihPodatakaComponent, resolve: {podatci: MedSestraResolverService}},
        {path: 'editPassword/:id', component: AzuriranjeLozinkaComponent} 
    ]}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MedSestraRoutingModule{

}