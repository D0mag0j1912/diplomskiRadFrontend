import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PacijentResolverService } from './pacijent-resolver.service';
import { PacijentComponent } from './pacijent.component';
import { DijagnozeResolverService } from './posjete/dijagnoze-resolver.service';
import { DodajNoviPosjetComponent } from './posjete/dodaj-novi-posjet/dodaj-novi-posjet.component';
import { PosjeteComponent } from './posjete/posjete.component';


const routes = [
    {path: '', component: PacijentComponent, resolve: {podatci: PacijentResolverService},
        children: [
            {path: 'posjete', component: PosjeteComponent, children: [
                {path: 'dodajPosjet', component: DodajNoviPosjetComponent, resolve: {podatci: DijagnozeResolverService}}
            ]}
        ]
    } 
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PacijentRoutingModule{

} 