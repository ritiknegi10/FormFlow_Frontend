import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { FormService } from '../../services/form.service';

@Component({
    selector: 'app-edit-form',
    templateUrl: './edit-form.component.html',
    styleUrls: ['./edit-form.component.scss']
})
export class EditFormComponent implements OnInit {
    form!: FormGroup;
    formIndex!: number;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private formService: FormService
    ) {}

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
        this.formIndex = Number(params.get('id'));
        const formData = this.formService.getFormByIndex(this.formIndex);

        //console.log("Loaded formData:", formData); 

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
    }

    createQuestionGroup(question: any): FormGroup {
        return this.fb.group({
        questionText: new FormControl(question.questionText || ''),
        type: new FormControl(question.type || 'text'),
        required: new FormControl(question.required || false),
        options: this.fb.array(
            question.options ? question.options.map((opt: any) => new FormControl(opt)) : []
        )
        });
    }

    get questions(): FormArray {
        return this.form.get('questions') as FormArray;
    }

    addQuestion() {
        this.questions.push(this.createQuestionGroup({ questionText: '', type: 'text', options: []}));
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
        const optionsArray = this.getOptions(questionIndex);
        optionsArray.push(new FormControl(''));
    }

    removeOption(questionIndex: number, optionIndex: number) {
        this.getOptions(questionIndex).removeAt(optionIndex);
    }

    getOptions(questionIndex: number): FormArray {
        return this.questions.at(questionIndex).get('options') as FormArray;
    }

    saveChanges() {
        const updatedForm = {
            ...this.form.value,
            questions: this.form.value.questions.map((q: any) => ({
                questionText: q.questionText || '',
                type: q.type || 'text',
                required: q.required,
                options: q.options ? q.options.map((opt: any) => opt) : []
            }))
        };
    
        console.log("Updated form before saving:", JSON.stringify(updatedForm, null, 2));
    
        this.formService.updateForm(this.formIndex, updatedForm);
        
        // Redirect back to forms list (NOT form analytics)
        this.router.navigate(['/forms']);
    }
}
