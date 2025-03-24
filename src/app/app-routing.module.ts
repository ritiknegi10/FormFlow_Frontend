import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { CreateFormComponent } from './components/create-form/create-form.component';
import { FormsListComponent } from './components/forms-list/forms-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { EditFormComponent } from './components/edit-form/edit-form.component';
import { FormAnalyticsComponent } from './components/form-analytics/form-analytics.component';
import { FormBuilderComponent } from './components/form-builder/form-builder.component';
import { ViewResponseComponent } from './components/view-response/view-response.component';
import { ContactComponent } from './components/contact/contact.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { FaqComponent } from './components/faq/faq.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'create', component: FormBuilderComponent },
  { path: 'forms', component: FormsListComponent },
  { path: 'edit/:id', component: EditFormComponent },
  { path: 'form-analytics/:id', component: FormAnalyticsComponent },  
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'view-responses/:id', component: ViewResponseComponent }
, 
    { path: 'contact', component: ContactComponent },
    {path:'about',component:AboutUsComponent},
    {path:"faq", component:FaqComponent},
  { path: '**', redirectTo: '' }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
