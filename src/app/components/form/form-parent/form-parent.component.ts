import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-form-parent',
  templateUrl: './form-parent.component.html',
  styleUrls: ['./form-parent.component.scss']
})
export class FormParentComponent implements OnInit{
  
  formTitle = 'Untitled Form';

  ngOnInit() {
      window.scrollTo(0, 0);
  }

  updateFormTitle(newTitle: string) {
    this.formTitle = newTitle;
  }
}
