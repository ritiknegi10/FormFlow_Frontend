import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { CreateFormComponent } from './components/create-form/create-form.component';
import { FormsListComponent } from './components/forms-list/forms-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { EditFormComponent } from './components/edit-form/edit-form.component';
import { FormAnalyticsComponent } from './components/form-analytics/form-analytics.component';
import { ViewResponseComponent } from './components/view-response/view-response.component';
import { ContactComponent } from './components/contact/contact.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { FaqComponent } from './components/faq/faq.component';
import { SharelinkComponent } from './components/sharelink/sharelink.component';
import { SubmitPageComponent } from './components/submit-page/submit-page.component';
import { AuthGuard } from './guards/auth.guard';
import { SignOutComponent } from './components/sign-out/sign-out.component';
import { UserFormsListComponent } from './components/user-forms-list/user-forms-list.component';
import { OtpComponent } from './components/otp/otp.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'create', component: CreateFormComponent, canActivate: [AuthGuard]  },
  { path: 'forms', component: FormsListComponent, canActivate: [AuthGuard]  },
  { path: 'edit/:id', component: EditFormComponent, canActivate: [AuthGuard]  },
  { path: 'form-analytics/:id', component: FormAnalyticsComponent, canActivate: [AuthGuard]  },  
  { path: 'login', component: LoginComponent },
  { path: 'signout', component: SignOutComponent, canActivate: [AuthGuard]  },
  { path: 'register', component: RegisterComponent },
  { path: 'otp', component: OtpComponent },
  { path: 'view-responses/:id', component: ViewResponseComponent, canActivate: [AuthGuard]  }, 
  { path: 'user-forms', component: UserFormsListComponent, canActivate: [AuthGuard]  }, 
    { path: 'contact', component: ContactComponent },
    {path:'about',component:AboutUsComponent},
    {path:"faq", component:FaqComponent},
    { path: 'sharelink/:id', component: SharelinkComponent, canActivate: [AuthGuard]  },
    { path: 'submit/:title', component: SubmitPageComponent , canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
