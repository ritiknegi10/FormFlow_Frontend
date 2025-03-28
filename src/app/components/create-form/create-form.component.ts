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
    submitClicked: boolean = false;
    submitSuccess: boolean = false;
    isQuestionInvalid: boolean = false;
    singleOption: boolean = false;
    ratingOptions: number[] =[3, 4, 5, 6, 7, 8, 9, 10];

    constructor(private fb: FormBuilder, private formService: FormService) {
        this.formBuilder = this.fb.group({
        title: [''],
        description: [''],
        questions: this.fb.array([])
        });
        this.questions = this.formBuilder.get('questions') as FormArray;
    }
    ngOnInit() {
        if (localStorage.getItem("formSaved") === "true") {
            this.submitSuccess = true;
            localStorage.removeItem("formSaved");

            setTimeout(() => {
                this.submitSuccess = false;
            }, 5000);
        }
    }

    getTitleControl() {
        return this.formBuilder.get('title');
    }

    getQuestionTextControl(question: any){
        return question.get('questionText');
    }

    addQuestion(){
        this.submitClicked = false;
        const questionGroup = this.fb.group({
            questionText: [''],
            type: ['shortText'],
            options: this.fb.array([]),
            rating: ['5'],
            required: false,
        });
    
        // Listen for type changes to add default option
        questionGroup.get('type')?.valueChanges.subscribe(type => {
            this.submitClicked=false;
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
        this.submitClicked = false;
        const originalQuestion = this.questions.at(index).value; 
        const duplicatedQuestion = this.fb.group({
            questionText: [originalQuestion.questionText],
            type: [originalQuestion.type],
            required: [originalQuestion.required],
            options: this.fb.array(
                originalQuestion.options ? originalQuestion.options.map((opt: any) => this.fb.control(opt)) : []
            ),
            rating: [originalQuestion.rating]
        });
        this.questions.insert(index + 1, duplicatedQuestion); 
    }

    removeQuestion(index: number) {
        this.questions.removeAt(index);
    }

    addOption(questionIndex: number) {
        this.submitClicked = false;
        const options = this.getOptions(this.questions.at(questionIndex));
        options.push(new FormControl(''));
        this.singleOption = false;
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

        // Title validation
        if (!this.getTitleControl()?.value.trim()) return;
            
        this.isQuestionInvalid = false;
        this.singleOption = false;
        let isOptionInvalid = false;

        // Question text validation
        this.questions.controls.forEach((control) => {
            if(control instanceof FormGroup) {
                const ques = control;
                const optionsArray = this.getOptions(ques);
                
                if(!this.getQuestionTextControl(ques)?.value.trim()) this.isQuestionInvalid = true;
                
                // Option text validation
                optionsArray.controls.forEach(optionControl => {
                    if (!optionControl.value.trim()) isOptionInvalid = true;
                    else if(((ques.get('type')?.value === "multipleChoice") && (optionsArray.controls.length < 2))
                        || (ques.get('type')?.value === "dropdown") && (optionsArray.controls.length < 2)) 
                    this.singleOption = true;                       
                });
            }
        });

        if(this.isQuestionInvalid || isOptionInvalid || this.singleOption) return;
        
        // Form saved

        localStorage.setItem("formSaved", "true");
        // console.log(JSON.stringify(this.formBuilder.value));
        this.formService.addForm(this.formBuilder.value);
        
        window.location.reload();
        window.scrollTo(0, 0);
        this.submitClicked = false;
    }
}
