import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { FormService } from '../../services/form.service';

@Component({
    selector: 'app-edit-form',
    templateUrl: './edit-form.component.html',
    styleUrls: ['./edit-form.component.scss']
})
export class EditFormComponent implements OnInit {
    form!: FormGroup;
    formIndex!: number;
    submitClicked: boolean = false;
    isQuestionInvalid: boolean = false;
    singleOption: boolean = false;
    ratingOptions: number[] =[3, 4, 5, 6, 7, 8, 9, 10];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private formService: FormService
    ) {}

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const formId = Number(params.get('id'));
            this.formService.getFormById(formId).subscribe(formData => {
                this.form = formData;
                console.log(formData);
                if (formData) {
                    this.form = this.fb.group({
                        title: new FormControl(formData.title || ''),
                        description: new FormControl(formData.description || ''),
                        questions: this.fb.array(
                            formData.questions.map((q: any) => this.createQuestionGroup(q))
                        )
                    });
    
                    // console.log("Form initialized:", this.form.value);
                } else {
                    this.router.navigate(['/forms']);
                }
            });
        });
    }
    

    createQuestionGroup(question: any): FormGroup {
        return this.fb.group({
        questionText: new FormControl(question.questionText || ''),
        type: new FormControl(question.type || 'shortText'),
        required: new FormControl(question.required || false),
        options: this.fb.array(
            question.options ? question.options.map((opt: any) => new FormControl(opt)) : []
        ),
        rating: new FormControl(question.rating || '5')
        });
    }

    get questions(): FormArray {
        return this.form.get('questions') as FormArray;
    }

    getTitleControl() {
        return this.form.get('title');
    }

    getQuestionTextControl(question: any){
        return question.get('questionText');
    }

    addQuestion() {
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
            this.submitClicked = true;
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

    cancelEditform(){
        this.router.navigate(['/forms']);
        window.scrollTo(0, 0);
    }

    saveChanges() {
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

        // Changes saved

        const updatedForm = {
            ...this.form.value,
            questions: this.form.value.questions.map((q: any) => ({
                questionText: q.questionText || '',
                type: q.type || 'text',
                required: q.required,
                options: q.options ? q.options.map((opt: any) => opt) : []
            }))
        };
    
        this.formService.updateForm(this.formIndex, updatedForm);
        
        this.router.navigate(['/forms']);
        window.scrollTo(0, 0);
        this.submitClicked = false;
    }

}
