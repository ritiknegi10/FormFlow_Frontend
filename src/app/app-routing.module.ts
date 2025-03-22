import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { CreateFormComponent } from './components/create-form/create-form.component';
import { FormsListComponent } from './components/forms-list/forms-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ContactComponent } from './components/contact/contact.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'create', component: CreateFormComponent },
  { path: 'forms', component: FormsListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
    { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
