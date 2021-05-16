import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { LijecnikGuard } from './lijecnik/lijecnik.guard';
import { LoginGuard } from './login/login.guard';
import { MedSestraGuard } from './med-sestra/med-sestra.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
    //Ovo je kada prvi put posjetimo stranicu
    //pathMatch => preusmjeri samo ako je full path prazan
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    //Lazy loading se naglašava propertyem loadChildren, i on omogućava izvršavanje programskog koda
    //modula na kojega loadChildren upućuje samo kada se posjeti navedeni path.
    //Ako ovo stavimo, moramo dignut import "<x>Module" iz AppModule

    //Kada se posjeti path /login, Angular izvršava samo dio koda koji je vezan za taj path
    {
        path: 'login',
        loadChildren:() => import('./login/login.module').then(m => m.LoginModule)
    },
    //Kada se posjeti path /signup, Angular izvršava samo dio koda koji je vezan za taj path
    {
        path: 'signup',
        loadChildren:() => import('./signup/signup.module').then(m => m.SignupModule)
    },
    //Kada se posjeti path /lijecnik, Angular izvršava samo dio koda koji je vezan za taj path
    {
        path: 'lijecnik',
        loadChildren:() => import('./lijecnik/lijecnik.module').then(m => m.LijecnikModule),
        //Potrebno je ovdje definirati Guardove, da se prvo provjeri je li korisnik smije ući na route te TEK ONDA zavisno smije ili ne smije, LOADATI MODULE
        canLoad: [LoginGuard, LijecnikGuard]
    },
    //Kada se posjeti path /med-sestra, Angular izvršava samo dio koda koji je vezan za taj path
    {
        path: 'med-sestra',
        loadChildren:() => import('./med-sestra/med-sestra.module').then(m => m.MedSestraModule),
        canLoad: [LoginGuard, MedSestraGuard]
    },
    {
        path: 'not-found',
        component: PageNotFoundComponent
    },
    //Kada korisnik upiše neki random path, apk ga preusmjerava na login stranicu (Wildcard route)
    {
        path: '**',
        redirectTo: '/not-found'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
