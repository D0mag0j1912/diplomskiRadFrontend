import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IzdajReceptResolverService } from "./izdaj-recept-resolver.service";
import { IzdajReceptComponent } from "./pacijenti/izdaj-recept/izdaj-recept.component";
import { ReceptComponent } from "./recept.component";
import {ReceptResolverService} from './recept-resolver.service';
const routes = [
    {
        path: '',
        component: ReceptComponent,
        resolve: {podatci: ReceptResolverService},
        children: [
            {
                path:':id',
                component: IzdajReceptComponent,
                resolve: {importi: IzdajReceptResolverService}
            }
    ]}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReceptRoutingModule{

}
