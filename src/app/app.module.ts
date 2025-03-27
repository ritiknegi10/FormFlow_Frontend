import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

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
    SubmitPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule

  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
