import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IzdajReceptResolverService } from "./izdaj-recept-resolver.service";
import { IzdajReceptComponent } from "./pacijenti/izdaj-recept/izdaj-recept.component";
import { PacijentiResolverService } from "./pacijenti-resolver.service";
import { ReceptComponent } from "./recept.component";

const routes = [
    {path: '', component: ReceptComponent, resolve: {pacijenti: PacijentiResolverService},
    children: [
        {path:':id', component: IzdajReceptComponent, resolve: {importi: IzdajReceptResolverService}}
    ]}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReceptRoutingModule{

}