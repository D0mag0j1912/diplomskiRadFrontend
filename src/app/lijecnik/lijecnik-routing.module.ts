import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginGuard } from '../login/login.guard';
import { CekaonicaResolverService } from '../shared/cekaonica/cekaonica-resolver.service';
import { CekaonicaComponent } from '../shared/cekaonica/cekaonica.component';
import { AzuriranjeLozinkaComponent } from '../shared/azuriranje-lozinka/azuriranje-lozinka.component';
import { AzuriranjeOsobnihPodatakaComponent } from '../shared/azuriranje-osobnih-podataka/azuriranje-osobnih-podataka.component';
import { LijecnikResolverService } from './lijecnik-resolver.service';
import { LijecnikComponent } from './lijecnik.component';
import { LijecnikGuard } from './lijecnik.guard';

const routes = [
    //Kada se /lijecnik nalazi u URL-u, loada se liječnička početna stranica
    {path: '', component: LijecnikComponent, resolve: {podatci: LijecnikResolverService}, canActivate: [LoginGuard, LijecnikGuard], 
    children: [
        //Ovo su djeca od patha "lijecnik"
        {path: 'obrada',loadChildren:() => import('../shared/obrada/obrada.module').then(m => m.ObradaModule)},
        {path: 'cekaonica', component: CekaonicaComponent, resolve: {pacijenti: CekaonicaResolverService}},
        {path: 'editPersonalData', component: AzuriranjeOsobnihPodatakaComponent, resolve: {podatci: LijecnikResolverService}},
        //Označavam da će u URL-u biti ID liječnika
        {path: 'editPassword/:id', component: AzuriranjeLozinkaComponent},
        {path: 'recept',loadChildren:() => import('./recept/recept.module').then(module => module.ReceptModule)}  
    ]}
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LijecnikRoutingModule{

}