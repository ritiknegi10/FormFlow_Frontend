import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

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
import { ContactComponent } from './components/contact/contact.component';
import { FormBuilderComponent } from './components/form-builder/form-builder.component';
import { QuestionComponent } from './components/question/question.component';

// --------MATERIAL---------
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
// --------MATERIAL---------

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
    RegisterComponent,
    ContactComponent,
    FormBuilderComponent,
    QuestionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
// --------MATERIAL---------
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
// --------MATERIAL---------
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
