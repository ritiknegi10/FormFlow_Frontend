import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { CreateFormComponent } from './components/create-form/create-form.component';
import { FormsListComponent } from './components/forms-list/forms-list.component';
import { ReactiveFormsModule } from '@angular/forms';
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
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { SignOutComponent } from './components/sign-out/sign-out.component';
import { UserFormsListComponent } from './components/user-forms-list/user-forms-list.component';
import { OtpComponent } from './components/otp/otp.component';
import { FormVersionsComponent } from './components/form-versions/form-versions.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { RecaptchaModule } from 'ng-recaptcha';
import { FormModule } from "./components/form/form.module";
import { FormPreviewComponent } from './components/form-preview/form-preview.component';
import { CommonModule } from '@angular/common';
import {AdminDashboardComponent} from './components/admin-dashboard/admin-dashboard.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AssignFormComponent } from './components/assigning/assign-form/assign-form.component';
import { AssignedFormsComponent } from './components/assigning/assigned-forms/assigned-forms.component';
import { FormTemplateComponent } from './components/form-template/form-template.component';
import { AnalyticsChartsComponent } from './components/analytics-charts/analytics-charts.component';
import { AssignmentDetailsComponent } from './components/assignment-details/assignment-details.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { AssignedViewersComponent } from './components/assigning/assigned-viewers/assigned-viewers.component';
import { AssignViewersComponent } from './components/assigning/assign-viewers/assign-viewers.component';
import { AssigningComponent } from './components/assigning/assigning.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminTrendsComponent } from './components/admin-trends/admin-trends.component';
import { AdminMiscellaneousComponent } from './components/admin-miscellaneous/admin-miscellaneous.component';



@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    CreateFormComponent,
    FormsListComponent,
    LoginComponent,
    RegisterComponent,
    EditFormComponent,
    FormAnalyticsComponent,
    ViewResponseComponent,
    ContactComponent,
    AboutUsComponent,
    FaqComponent,
    SharelinkComponent,
    SubmitPageComponent,
    SignOutComponent,
    UserFormsListComponent,
    OtpComponent,
    FormVersionsComponent,
    FormPreviewComponent,
    OtpComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    OtpComponent,
    AssignFormComponent,
    AssignedFormsComponent,
    FormTemplateComponent,
    AnalyticsChartsComponent,
    AssignmentDetailsComponent,
    AdminDashboardComponent,
    ErrorPageComponent,
    AssignedViewersComponent,
    AssignViewersComponent,
    AssigningComponent,
    ProfileComponent,
    AdminComponent,
    AdminTrendsComponent,
    AdminMiscellaneousComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    DragDropModule,
    RecaptchaModule,
    FormModule,
    NgxChartsModule,
    CommonModule,
    BrowserAnimationsModule
],
    

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
