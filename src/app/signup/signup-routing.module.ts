import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SignupResolverService } from './signup-resolver.service';
import { SignupComponent } from './signup.component';
//Definiram put i komponentu koja će se loadati kada se upiše taj put
const routes = [
    {path: '', component: SignupComponent, resolve: {specijalizacije: SignupResolverService}}
];


@NgModule({
    //Deklariram svoje puteve i šaljem na obradu u RouterModule
    imports: [RouterModule.forChild(routes)],
    //Šaljem svoje routeove vanka da ih ostali moduli mogu dohvatiti
    exports: [RouterModule]
})
export class SignupRoutingModule{

}
