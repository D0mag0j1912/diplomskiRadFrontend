import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PovijestBolestiComponent } from 'src/app/lijecnik/povijest-bolesti/povijest-bolesti.component';
import { ImportiResolverService } from '../../med-sestra/importi-resolver.service';
import { OpciPodatciPregledaComponent } from '../../med-sestra/opci-podatci-pregleda/opci-podatci-pregleda.component';
import { ObradaResolverService } from './obrada-resolver.service';
import { ObradaComponent } from './obrada.component';
import { OsnovniPodatciImportResolverService } from './osnovni-podatci/osnovni-podatci-import-resolver.service';
import { OsnovniPodatciResolverService } from './osnovni-podatci/osnovni-podatci-resolver.service';
import { OsnovniPodatciComponent } from './osnovni-podatci/osnovni-podatci.component';
import { ZdravstveniPodatciResolverService } from './zdravstveni-podatci/zdravstveni-podatci-resolver.service';
import { ZdravstveniPodatciComponent } from './zdravstveni-podatci/zdravstveni-podatci.component';

const routes = [
    {path: '', component: ObradaComponent ,resolve: {pacijent: ObradaResolverService}, children: [
        {path: 'opciPodatci', component: OpciPodatciPregledaComponent, resolve: {podatci: ImportiResolverService, pacijent: ObradaResolverService}},
        {path: 'povijestBolesti', component: PovijestBolestiComponent,resolve: {podatci: ImportiResolverService, pacijent: ObradaResolverService}},
        {path: 'osnovniPodatci', component: OsnovniPodatciComponent, resolve: {podatci: OsnovniPodatciImportResolverService, pacijenti: OsnovniPodatciResolverService}},
        {path: 'zdravstveniPodatci', component: ZdravstveniPodatciComponent, resolve: {podatci: ImportiResolverService, zdravstveniPodatci: ZdravstveniPodatciResolverService}}
    ]},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ObradaRoutingModule{

}