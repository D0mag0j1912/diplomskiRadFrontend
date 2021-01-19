import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { PacijentiResolverService } from "./pacijenti-resolver.service";
import { ReceptImportiResolverService } from "./recept-importi-resolver.service";
import { ReceptComponent } from "./recept.component";

const routes = [
    {path: '', component: ReceptComponent, resolve: {pacijenti: PacijentiResolverService,importi: ReceptImportiResolverService}}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReceptRoutingModule{

}