import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginGuard } from '../login/login.guard';
import { CekaonicaResolverService } from '../shared/cekaonica/cekaonica-resolver.service';
import { CekaonicaComponent } from '../shared/cekaonica/cekaonica.component';
import { MedSestraAzuriranjeLozinkaComponent } from './med-sestra-azuriranje-lozinka/med-sestra-azuriranje-lozinka.component';
import { MedSestraAzuriranjePodatciComponent } from './med-sestra-azuriranje-podatci/med-sestra-azuriranje-podatci.component';
import { MedSestraResolverService } from './med-sestra-resolver.service';
import { MedSestraComponent } from './med-sestra.component';
import { MedSestraGuard } from './med-sestra.guard';
import { NarucivanjeComponent } from './narucivanje/narucivanje.component';
import { DateTimeResolverService } from './narucivanje/dateTime-resolver.service';

const routes = [
    //Kada se upiše /med-sestra u URL, loada se komponenta medicinske sestre 
    {path: '', component: MedSestraComponent, canActivate:[LoginGuard, MedSestraGuard],
    children: [
        {path: 'obrada',loadChildren:() => import('../shared/obrada/obrada.module').then(m => m.ObradaModule)},
        {path: 'cekaonica', component: CekaonicaComponent, resolve: {pacijenti: CekaonicaResolverService}},
        {path: 'narucivanje', component: NarucivanjeComponent, resolve: {podatci: DateTimeResolverService}},
        {path: 'editPersonalData', component: MedSestraAzuriranjePodatciComponent, resolve: {podatci: MedSestraResolverService}},
        {path: 'editPassword/:id', component: MedSestraAzuriranjeLozinkaComponent}
    ]}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MedSestraRoutingModule{

}