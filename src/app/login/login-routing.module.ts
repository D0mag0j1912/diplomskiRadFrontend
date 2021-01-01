import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
//Definiram put i komponentu koja će se loadati kada se upiše taj put
const routes = [
    {path: '', component: LoginComponent}
];

@NgModule({
    //Deklariram svoje routeove pomoću RouterModule
    imports: [RouterModule.forChild(routes)],
    //Šaljem svoje routeove drugim modulima
    exports: [RouterModule]
})
export class LoginRoutingModule{
    
}