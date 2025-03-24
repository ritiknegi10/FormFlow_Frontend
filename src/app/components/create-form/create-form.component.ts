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
        description: [''],
        questions: this.fb.array([])
        });
        this.questions = this.formBuilder.get('questions') as FormArray;
    }

    addQuestion() {
        this.questions.push(this.fb.group({
            questionText: [''],
            type: ['shortText'],
            options: this.fb.array([]),
            required: false, 
        }));    
    }

    duplicateQuestion(index: number) {
      const originalQuestion = this.questions.at(index).value; 
      const duplicatedQuestion = this.fb.group({
        questionText: [originalQuestion.questionText],
        type: [originalQuestion.type],
        required: [originalQuestion.required],
        options: this.fb.array(
          originalQuestion.options ? originalQuestion.options.map((opt: any) => this.fb.control(opt)) : []
        )
      });
      this.questions.insert(index + 1, duplicatedQuestion); 
    }

    removeQuestion(index: number) {
        this.questions.removeAt(index);
    }

    addOption(questionIndex: number) {
        const options = this.getOptions(this.questions.at(questionIndex));
        options.push(new FormControl(''));
    }


    removeOption(questionIndex: number, optionIndex: number) {
        const options = this.getOptions(this.questions.at(questionIndex));
        options.removeAt(optionIndex);
    }


    getOptions(question: any): FormArray {
        return question.get('options') as FormArray;
    }

    onSubmit() {
        console.log("Form saved");
        console.log(this.formBuilder.value);
        this.formService.addForm(this.formBuilder.value);
        alert("Form saved successfully");
        window.location.reload();
    }
}
