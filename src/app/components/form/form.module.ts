import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormParentComponent } from './form-parent/form-parent.component';
import { FormNavbarComponent } from './form-navbar/form-navbar.component';
import { FormHeroComponent } from './form-hero/form-hero.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    FormParentComponent,
    FormNavbarComponent,
    FormHeroComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    FormParentComponent
  ]
})
export class FormModule { }
