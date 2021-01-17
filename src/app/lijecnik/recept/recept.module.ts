import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReceptRoutingModule } from "./recept-routing.module";
import { ReceptComponent } from "./recept.component";
import { PacijentiComponent } from './pacijenti/pacijenti.component';
import { ListaReceptiComponent } from './lista-recepti/lista-recepti.component';
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
    declarations: [
        ReceptComponent,
        PacijentiComponent,
        ListaReceptiComponent
    ],
    imports: [
        CommonModule,
        ReceptRoutingModule,
        ReactiveFormsModule
    ],
    exports: [
        ReceptComponent,
        PacijentiComponent,
        ListaReceptiComponent
    ]
})
export class ReceptModule{

}