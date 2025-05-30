import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { CreateFormComponent } from './components/create-form/create-form.component';
import { FormsListComponent } from './components/forms-list/forms-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { EditFormComponent } from './components/edit-form/edit-form.component';
import { FormAnalyticsComponent } from './components/form-analytics/form-analytics.component';
import { FormVersionsComponent } from './components/form-versions/form-versions.component';
import { ViewResponseComponent } from './components/view-response/view-response.component';
import { AnalyticsChartsComponent } from './components/analytics-charts/analytics-charts.component';
import { ContactComponent } from './components/contact/contact.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { FaqComponent } from './components/faq/faq.component';
import { SharelinkComponent } from './components/sharelink/sharelink.component';
import { SubmitPageComponent } from './components/submit-page/submit-page.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { SignOutComponent } from './components/sign-out/sign-out.component';
import { UserFormsListComponent } from './components/user-forms-list/user-forms-list.component';
import { OtpComponent } from './components/otp/otp.component';
import { FormParentComponent } from './components/form/form-parent/form-parent.component';
import { FormPreviewComponent } from './components/form-preview/form-preview.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './components/reset-password/reset-password.component'
import { AssignFormComponent } from './components/assigning/assign-form/assign-form.component';
import { AssignedFormsComponent } from './components/assigning/assigned-forms/assigned-forms.component';
import { FormTemplateComponent } from './components/form-template/form-template.component';
import { AssignmentDetailsComponent } from './components/assignment-details/assignment-details.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { AssignViewersComponent } from './components/assigning/assign-viewers/assign-viewers.component';
import { AssignedViewersComponent } from './components/assigning/assigned-viewers/assigned-viewers.component';
import { AssigningComponent } from './components/assigning/assigning.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminTrendsComponent } from './components/admin-trends/admin-trends.component';
import { AdminMiscellaneousComponent } from './components/admin-miscellaneous/admin-miscellaneous.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'create', component: FormParentComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: FormParentComponent, canActivate: [AuthGuard] },
  { path: 'forms', component: FormsListComponent, canActivate: [AuthGuard] },
  { path: 'deprecated', component: CreateFormComponent, canActivate: [AuthGuard]  },
  { path: 'forms', component: FormsListComponent, canActivate: [AuthGuard]  },
  { path: 'forms/:formId/versions/:formVersion', component: FormVersionsComponent },
  { path: 'form-analytics/:id', component: FormAnalyticsComponent, canActivate: [AuthGuard] },
  { path: 'forms/:id/assigning', component: AssigningComponent, canActivate: [AuthGuard] },  
  { path: 'forms/:id/assign', component: AssignFormComponent, canActivate: [AuthGuard] }, 
  { path: 'assigned-forms', component: AssignedFormsComponent, canActivate: [AuthGuard] },  
  { path: 'forms/:id/assign-viewers', component: AssignViewersComponent, canActivate: [AuthGuard] }, 
  { path: 'assigned-viewers', component: AssignedViewersComponent, canActivate: [AuthGuard] },  
  { path: 'assignment-details/:id', component: AssignmentDetailsComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signout', component: SignOutComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'otp', component: OtpComponent },
  { path: 'view-responses/:id', component: ViewResponseComponent, canActivate: [AuthGuard] },
  { path: 'view-responses/my-responses/:id', component: ViewResponseComponent, canActivate: [AuthGuard] },
  { path: 'analytics-charts/:id', component: AnalyticsChartsComponent, canActivate: [AuthGuard] },
  { path: 'user-forms', component: UserFormsListComponent, canActivate: [AuthGuard] },
  { path: 'contact', component: ContactComponent },
  { path:'about',component:AboutUsComponent },
  { path: 'faq', component:FaqComponent },
  { path: 'submit/:title', component: SubmitPageComponent , canActivate: [AuthGuard] },
  { path: 'error/:msg', component: ErrorPageComponent,canActivate: [AuthGuard]},  
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent},
  { path: 'about', component: AboutUsComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'sharelink/:id', component: SharelinkComponent, canActivate: [AuthGuard] },
  { path: 'submit/:title', component: SubmitPageComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin/trends', component: AdminTrendsComponent, canActivate: [AuthGuard] },
  { path: 'admin/miscellaneous', component: AdminMiscellaneousComponent, canActivate: [AuthGuard] },

  
  { path: 'create', component: FormParentComponent, canActivate: [AuthGuard] },
  { path: 'form-template', component: FormTemplateComponent, canActivate: [AuthGuard] },
  { path: 'form-preview', component: FormPreviewComponent },
  { path: '**', redirectTo: '' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }