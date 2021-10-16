import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { AuthComponent } from './auth/auth.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/auth'},
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'auth', component: AuthComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
