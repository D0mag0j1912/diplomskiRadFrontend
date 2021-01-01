import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  //Ovo je kada prvi put posjetimo stranicu
  //pathMatch => preusmjeri samo ako je full path prazan
  {path: '', redirectTo: '/login', pathMatch: 'full'},
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
    loadChildren:() => import('./lijecnik/lijecnik.module').then(m => m.LijecnikModule)
  },
  //Kada se posjeti path /med-sestra, Angular izvršava samo dio koda koji je vezan za taj path
  {
    path: 'med-sestra', 
    loadChildren:() => import('./med-sestra/med-sestra.module').then(m => m.MedSestraModule)
  },
  //Kada korisnik upiše neki random path, apk ga preusmjerava na login stranicu (Wildcard route)
  {
    path: '**',
    loadChildren:() => import('./wildcard/wildcard.module').then(m => m.WildCardModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
