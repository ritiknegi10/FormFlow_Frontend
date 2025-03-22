import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.scss']
})
export class CreateFormComponent {
  formBuilder: FormGroup;
  questions: FormArray;

  constructor(private fb: FormBuilder, private formService: FormService) {
    this.formBuilder = this.fb.group({
      title: [''],
      questions: this.fb.array([])
    });
    this.questions = this.formBuilder.get('questions') as FormArray;
  }

  addQuestion() {
    this.questions.push(this.fb.group({
      questionText: [''],
      type: ['text'],
      options: this.fb.array([])  
    }));    
  }

  addOption(questionIndex: number) {
    const options = this.getOptions(this.questions.at(questionIndex));
    options.push(new FormControl(''));
  }

  removeOption(questionIndex: number, optionIndex: number) {
    const options = this.getOptions(this.questions.at(questionIndex));
    options.removeAt(optionIndex);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  getOptions(question: any): FormArray {
    return question.get('options') as FormArray;
  }

  onSubmit() {
    console.log('Form before saving:', JSON.stringify(this.formBuilder.value, null, 2));
    this.formService.addForm(this.formBuilder.value);
  }
}
