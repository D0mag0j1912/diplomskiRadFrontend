import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReceptRoutingModule } from "./recept-routing.module";
import { ReceptComponent } from "./recept.component";
import { PacijentiComponent } from './pacijenti/pacijenti.component';
import { ListaReceptiComponent } from './lista-recepti/lista-recepti.component';
import { ReactiveFormsModule } from "@angular/forms";
import { IzdajReceptComponent } from './pacijenti/izdaj-recept/izdaj-recept.component';
import { ReceptDirective } from "./recept.directive";
import { SharedModule } from "src/app/shared/shared.module";
import { PrikazReceptComponent } from './lista-recepti/prikaz-recept/prikaz-recept.component';

@NgModule({
    declarations: [
        ReceptComponent,
        PacijentiComponent,
        ListaReceptiComponent,
        IzdajReceptComponent,
        ReceptDirective,
        PrikazReceptComponent
    ],
    imports: [
        CommonModule,
        ReceptRoutingModule,
        ReactiveFormsModule,
        SharedModule
    ],
    exports: [
        ReceptComponent,
        PacijentiComponent,
        ListaReceptiComponent,
        IzdajReceptComponent,
        ReceptDirective,
        PrikazReceptComponent
    ]
})
export class ReceptModule{

}
