import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { UputnicaRoutingModule } from "./uputnica-routing.module";
import { UputnicaComponent } from "./uputnica.component";
import { IzdajUputnicaComponent } from './izdaj-uputnica/izdaj-uputnica.component';

@NgModule({
    declarations: [
        UputnicaComponent,
        IzdajUputnicaComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SharedModule,
        UputnicaRoutingModule
    ],
    exports: [
        UputnicaComponent,
        IzdajUputnicaComponent
    ]
})
export class UputnicaModule {}