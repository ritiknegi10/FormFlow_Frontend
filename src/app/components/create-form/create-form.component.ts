

import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.scss']
})
export class CreateFormComponent {
  formBuilder: FormGroup;
  questions: FormArray;

  constructor(private fb: FormBuilder) {
    this.formBuilder = this.fb.group({
      title: [''],
      questions: this.fb.array([])
    });
    this.questions = this.formBuilder.get('questions') as FormArray;
  }

  addQuestion() {
    this.questions.push(this.fb.group({
      questionText: [''],
      type: ['text']
    }));
  }

  onSubmit() {
    console.log(this.formBuilder.value);
    // Add form submission logic here
  }
}