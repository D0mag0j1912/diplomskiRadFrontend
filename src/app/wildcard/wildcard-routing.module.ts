import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WildcardComponentComponent } from './wildcard-component/wildcard-component.component';
import { WildCardGuard } from './wildcard.guard';

const routes = [
    {path: '', component: WildcardComponentComponent, canActivate: [WildCardGuard]}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WildCardRoutingModule{

}