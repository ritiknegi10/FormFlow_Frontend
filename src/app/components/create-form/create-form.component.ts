import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.scss']
})
export class CreateFormComponent {
    formBuilder: FormGroup;
    questions: FormArray;
    submitClicked: boolean = false;
    isQuestionInvalid: boolean = false;

    constructor(private fb: FormBuilder, private formService: FormService) {
        this.formBuilder = this.fb.group({
        title: ['', Validators.required],
        description: [''],
        questions: this.fb.array([])
        });
        this.questions = this.formBuilder.get('questions') as FormArray;
    }

    get titleControl() {
        return this.formBuilder.get('title');
    }

    getQuestionTextControl(question: FormGroup){
        return question.get('questionText')
    }

    addQuestion(){
        const questionGroup = this.fb.group({
            questionText: ['', Validators.required],
            type: ['shortText'],
            options: this.fb.array([]),
            required: false,
        });
    
        // Listen for type changes to add default option
        questionGroup.get('type')?.valueChanges.subscribe(type => {
        if (type === 'multipleChoice' || type === 'checkboxes' || type === 'dropdown') {
            const options = questionGroup.get('options') as FormArray;
            if (options.length === 0) {
                options.push(new FormControl('')); // Add default option
            }
        }
        });
    
        this.questions.push(questionGroup);
    }

    duplicateQuestion(index: number) {
      const originalQuestion = this.questions.at(index).value; 
      const duplicatedQuestion = this.fb.group({
        questionText: [originalQuestion.questionText, Validators.required],
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
        this.submitClicked = true;
        if (this.titleControl?.invalid) {
            alert("Please enter a valid form title.");
            return;
        }

        this.isQuestionInvalid = false;
        this.questions.controls.forEach((control) => {
            if(control instanceof FormGroup){
                const ques = control;

                if(this.getQuestionTextControl(ques)?.invalid)
                    this.isQuestionInvalid = true;
            }
        });

        if(this.isQuestionInvalid){
            alert("Please enter a valid question text");
            return;
        }

        console.log("Form saved");
        console.log(JSON.stringify(this.formBuilder.value));
        this.formService.addForm(this.formBuilder.value);
        alert("Form saved successfully");
        // window.location.reload();
    }
}
