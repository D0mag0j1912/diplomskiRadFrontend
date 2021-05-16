import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UputnicaResolverService } from "./uputnica-resolver.service";
import { UputnicaComponent } from "./uputnica.component";

const routes: Routes = [
    {
        path: '',
        component: UputnicaComponent,
        resolve: {importi: UputnicaResolverService}
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UputnicaRoutingModule{}
