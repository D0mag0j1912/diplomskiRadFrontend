import {NgModule} from '@angular/core';
import { WildcardComponentComponent } from './wildcard-component/wildcard-component.component';
import { WildCardRoutingModule } from './wildcard-routing.module';
@NgModule({
    declarations: [WildcardComponentComponent],
    imports: [WildCardRoutingModule],
    exports: [WildcardComponentComponent]
})
export class WildCardModule{

}