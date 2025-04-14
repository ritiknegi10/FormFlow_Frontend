import { ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { FormService } from 'src/app/services/form.service';
import { Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-form-hero',
  templateUrl: './form-hero.component.html',
  styleUrls: ['./form-hero.component.scss']
})
export class FormHeroComponent implements OnInit{
    formId: number | null = null;
    formBuilder: FormGroup;
    ratingOptions = Array.from({ length: 10 }, (_, i) => i + 1);
    submitClicked = false;
    submitSuccess = false;
    singleOption = false;
    isQuestionInvalid: boolean = false;
    showOptionsMap: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    showMenuMap: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    showQuestionDescription: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};

    otherAddedMap: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    // sectionBasedonAnswer: boolean = false;
    // otherAdded: boolean = false;
    // otherIndex: number | undefined;
    

    constructor(private fb: FormBuilder, 
                private formService: FormService, 
                private router: Router, 
                private cdr: ChangeDetectorRef) {
        this.formBuilder = this.fb.group({
            title: 'Untitled Form',
            description: '',
            sections: this.fb.array([])
        });
    }

    ngOnInit() {
        // if you're editing an existing form, fetch data
        const urlParts = this.router.url.split('/');
        // console.log(urlParts);
        if (urlParts[2] === 'edit' && urlParts[3]) {
            this.formId = parseInt(urlParts[3]);
            this.formService.getFormById(this.formId).subscribe(form => {
                this.formBuilder.patchValue({
                    title: form.title,
                    description: form.description,
                });
                // const questionsArray = form.formSchema.fields.map((field: any) => {
                //     return this.fb.group({
                //         questionText: field.label,
                //         type: field.type,
                //         required: field.required,
                //         options: this.fb.array(field.options || []),
                //         rating: field.rating || 5,
                //     });
                // });
                // this.formBuilder.setControl('questions', this.fb.array(questionsArray));

                const sectionsArray = form.formSchema.sections?.map((section:any) =>{
                    const questions = section.questions.map((field:any) =>{
                        return this.fb.group({
                            questionText: field.label,
                            questionDescription: '',
                            type: field.type,
                            required: field.required,
                            options: this.fb.array(field.options || []),
                            rating: field.rating || 5,
                        });
                    });
                    return this.fb.group({
                        sectionTitle: section.sectionTitle,
                        questions: this.fb.array(questions)
                    });
                });
                this.formBuilder.setControl('sections', this.fb.array(sectionsArray));
            });
        } 
        else {
            this.addSection(); // Start with one section by default
        }
    }

    @Input() formTitle: string = '';
    @Output() formTitleChange = new EventEmitter<string>();

    onTitleChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.formTitleChange.emit(input.value);
    }

    //!------------------pre-final changes------------------------
    togglesectionBasedonAnswer(sectionIndex: number, questionIndex: number){
        const questionGroup = this.sections.at(sectionIndex).get('questions') as FormArray;
        const thatQuestion = questionGroup.at(questionIndex) as FormGroup;
        const currentVal = thatQuestion.get('sectionBasedonAnswer')?.value || false;

        thatQuestion.get('sectionBasedonAnswer')?.setValue(!currentVal);
    }
    

    // other options menu toggle
    toggleOtherOptionsMenu(sectionIndex: number, questionIndex: number) {
        if (!this.showMenuMap[sectionIndex]) {
            this.showMenuMap[sectionIndex] = {};
        }
        const isMenuOpen = this.showMenuMap[sectionIndex][questionIndex];
        this.showMenuMap[sectionIndex][questionIndex] = !isMenuOpen;
    }

    // collapse or explan options
    toggleOptions(sectionIndex: number, questionIndex: number) {
        const isVisible = this.showOptionsMap[sectionIndex][questionIndex];
        this.showOptionsMap[sectionIndex][questionIndex] = !isVisible;
    }

    toggleQuestionDescription(sectionIndex: number, questionIndex: number) {
        const isVisible = this.showQuestionDescription[sectionIndex][questionIndex];
        this.showQuestionDescription[sectionIndex][questionIndex] = !isVisible;
    }

    selectAllText(eventTarget: EventTarget | null){
        if(eventTarget instanceof HTMLInputElement)
            eventTarget.select();
    }

    setDefaultValueIfEmpty(inputElement: EventTarget | null, question: any, opIdx: number){
        if(inputElement instanceof HTMLInputElement){
            if(inputElement && inputElement.value.trim()===''){
                const optionsFormArray = this.getOptions(question);
                const control = optionsFormArray.at(opIdx) as FormControl;
                if(control){
                    control.setValue(`Option ${opIdx+1}`);
                }
            }
        }
    }

    get sections(): FormArray{
        return this.formBuilder.get('sections') as FormArray;
    }

    addSection(){
        const sectionGroup = this.fb.group({
            sectionTitle: ['Untitled Section'],
            sectionDescription: [''],
            questions: this.fb.array([]),
        });

        this.sections.push(sectionGroup);
        //* Add default 1 question to new section - uncomment below line if required this feature
        this.addQuestionToSection(this.sections.length - 1);
        this.cdr.detectChanges();
    }

    removeSection(index: number){
        this.sections.removeAt(index);
    }

    getSectionTitleControl(section: any){
        // Making form title as 1st sections title
        this.sections.at(0).get('sectionTitle')?.setValue(this.getTitleControl()?.value || 'Untitled Section');

        // handling form title change and updating first secitons title
        this.getTitleControl()?.valueChanges.subscribe(title => {
            this.sections.at(0).get('sectionTitle')?.setValue(title);
        });

        return section.get('sectionTitle');
    }

    //* Questions getter by Section
    getSectionQuestions(sectionIndex: number): FormArray {
        return this.sections.at(sectionIndex).get('questions') as FormArray;
    }

    getQuestionsControl(section: any): FormArray{
        return section.get('questions') as FormArray;
    }

    getTitleControl(){
        return this.formBuilder.get('title');
    }

    getQuestionTextControl(question: any){
        return question.get('questionText');
    }

    //* Add Question to a section
    addQuestionToSection(sectionIndex: number){
        this.submitClicked = false;
        const section = this.getSectionQuestions(sectionIndex);

        const questionGroup = this.fb.group({
            questionText: [''],
            questionDescription: [''],
            type: ['multipleChoice'],
            options: this.fb.array([]),
            rating: [5],
            required: false,
            otherAdded: false, //*map
            sectionBasedonAnswer: false, //!imp
        });

        if (!this.showQuestionDescription[sectionIndex]) {
            this.showQuestionDescription[sectionIndex] = {};
        }
        
        const type = questionGroup.get('type')?.value;
        if(type === 'multipleChoice' || type === 'checkboxes' || type === 'dropdown') {

            if (!this.showOptionsMap[sectionIndex]) {
                this.showOptionsMap[sectionIndex] = {};
            }
            this.showOptionsMap[sectionIndex][section.length] = true;

            const options = questionGroup.get('options') as FormArray;
            if(options.length === 0)
                options.push(new FormControl('Option 1'));
        }    

        questionGroup.get('type')?.valueChanges.subscribe(type => {
            this.submitClicked = false;
        });
        section.push(questionGroup);
        this.cdr.detectChanges();
    }

    duplicateQuestion(sectionIndex: number, questionIndex: number){
        this.submitClicked = false;
        const section = this.getSectionQuestions(sectionIndex);
        const originalQuestion = section.at(questionIndex).value;
        const duplicated = this.fb.group({
            questionText: [originalQuestion.questionText],
            questionDescription: [''],
            type: [originalQuestion.type],
            options: this.fb.array(originalQuestion.options.map((opt: any) => this.fb.control(opt))),
            rating: [originalQuestion.rating],
            required: [originalQuestion.required],
            otherAdded: false, //*map
            sectionBasedonAnswer: [originalQuestion.sectionBasedonAnswer] //!imp
        });
        section.insert(questionIndex + 1, duplicated);
    }

    removeQuestion(sectionIndex: number, questionIndex: number){
        const section = this.getSectionQuestions(sectionIndex);
        section.removeAt(questionIndex);
    }

    getOptions(question: any): FormArray{
        return question.get('options') as FormArray;
    }

    addOption(sectionIndex: number, questionIndex: number, value: string = ''){
        this.submitClicked = false;

        const questionGroup = this.sections.at(sectionIndex).get('questions') as FormArray;
        const thatQuestion = questionGroup.at(questionIndex) as FormGroup;

        const options = this.getOptions(this.getSectionQuestions(sectionIndex).at(questionIndex));
        const index = options.length;

        //* Checking for option - 'Other' added
        if(value!=''){
            if(!this.otherAddedMap[sectionIndex])
                this.otherAddedMap[sectionIndex]={};
            this.otherAddedMap[sectionIndex][questionIndex]=true;
            options.push(new FormControl(value));
            thatQuestion.get('otherAdded')?.setValue(true);
            options.at(index).disable() // Can't edit option - 'Other'
        }
        else{
            // const otherAdded = thatQuestion.get('otherAdded')?.value;
            const otherAdded = this.otherAddedMap[sectionIndex][questionIndex];
            options.push(new FormControl(`Option ${index + (otherAdded? 0:1)}`));
        }
        this.singleOption = false;
    }

    removeOption(sectionIndex: number, questionIndex: number, optionIndex: number){
        const questions = this.getSectionQuestions(sectionIndex).at(questionIndex);
        const options = this.getOptions(this.getSectionQuestions(sectionIndex).at(questionIndex));
        if(options.at(optionIndex)?.value==='Other'){
            this.otherAddedMap[sectionIndex][questionIndex]=false;
            questions.get('otherAdded')?.setValue(false);
            // questions.get('otherIndex')?.setValue(undefined);
            // this.otherAdded = false;
            // this.otherIndex = undefined;
        }
        options.removeAt(optionIndex);
    }

    drop(event: CdkDragDrop<string[]>, sectionIndex: number){
        const questionsArray = this.getSectionQuestions(sectionIndex);
        moveItemInArray(questionsArray.controls, event.previousIndex, event.currentIndex);
        questionsArray.updateValueAndValidity();
    }

    onSubmit(){
        this.submitClicked = true;
        if(!this.getTitleControl()?.value.trim()) return;

        this.isQuestionInvalid = false;
        this.singleOption = false;
        let isOptionInvalid = false;

        this.sections.controls.forEach(section => {
            const questionsArray = (section.get('questions') as FormArray);
            questionsArray.controls.forEach(control => {
                if (control instanceof FormGroup) {
                    const ques = control;
                    const optionsArray = this.getOptions(ques);

                    if (!this.getQuestionTextControl(ques)?.value.trim()) this.isQuestionInvalid = true;

                    optionsArray.controls.forEach(optionControl => {
                        if (!optionControl.value.trim()) isOptionInvalid = true;
                        else if (((ques.get('type')?.value === "multipleChoice") && (optionsArray.length < 2)) ||
                            (ques.get('type')?.value === "dropdown") && (optionsArray.length < 2))
                            this.singleOption = true;
                    });
                }
            });
        });

        if (this.isQuestionInvalid || isOptionInvalid || this.singleOption) return;

        if (this.formBuilder.valid) {
            const payload = {
                title: this.formBuilder.value.title,
                description: this.formBuilder.value.description,
                formSchema: {
                    sections: this.formBuilder.value.sections
                }
            };

            if (this.formId) {
                this.formService.updateForm(this.formId, payload).subscribe({
                    next: () => {
                        this.submitSuccess = true;
                        setTimeout(() => {
                            this.submitSuccess = false;
                            this.router.navigate(['/forms']);
                        }, 3000);
                    },
                    error: (error) => {
                        console.error("Error updating form", error);
                    }
                });
            } else {
                this.formService.addForm(payload);
                this.submitSuccess = true;
                setTimeout(() => {
                    this.submitSuccess = false;
                    this.router.navigate(['/forms']);
                }, 3000);
            }
        } else {
            console.log("Form is invalid");
        }
    }
}
    
    //!------------------pre-final changes------------------------

    // get questions(): FormArray {
    //     return this.formBuilder.get('questions') as FormArray;
    // }
    
    // getTitleControl() {
    //    return this.formBuilder.get('title');
    // }
    
    // getQuestionTextControl(question: any) {
    //     return question.get('questionText');
    // }
    
    // addQuestion() {
    //     this.submitClicked = false;
    //     const questionGroup = this.fb.group({
    //         questionText: [''],
    //         type: ['shortText'],
    //         options: this.fb.array([]),
    //         rating: [5],
    //         required: false,
    //     });
    
    //     questionGroup.get('type')?.valueChanges.subscribe(type => {
    //         this.submitClicked = false;
    //         if (type === 'multipleChoice' || type === 'checkboxes' || type === 'dropdown') {
    //             const options = questionGroup.get('options') as FormArray;
    //             if (options.length === 0)
    //                 options.push(new FormControl(''));
    //         }
    //     });
    
    //     this.questions.push(questionGroup);
    // }
    
    // duplicateQuestion(index: number) {
    //     this.submitClicked = false;
    //     const originalQuestion = this.questions.at(index).value;
    //     const duplicatedQuestion = this.fb.group({
    //             questionText: [originalQuestion.questionText],
    //             type: [originalQuestion.type],
    //             required: [originalQuestion.required],
    //             options: this.fb.array(originalQuestion.options ? originalQuestion.options.map((opt: any) => this.fb.control(opt)) : []),
    //             rating: [originalQuestion.rating]
    //     });
    //     this.questions.insert(index + 1, duplicatedQuestion);
    // }
    
    // removeQuestion(index: number) {
    //     this.questions.removeAt(index);
    // }
    
    // addOption(questionIndex: number) {
    //     this.submitClicked = false;
    //     const options = this.getOptions(this.questions.at(questionIndex));
    //     options.push(new FormControl(''));
    //     this.singleOption = false;
    // }
    
    // removeOption(questionIndex: number, optionIndex: number) {
    //     const options = this.getOptions(this.questions.at(questionIndex));
    //     options.removeAt(optionIndex);
    // }
    
    // getOptions(question: any): FormArray {
    //     return question.get('options') as FormArray;
    // }
    
    // onSubmit() {
    //     this.submitClicked = true;
    //     if (!this.getTitleControl()?.value.trim()) return;
    
    //     this.isQuestionInvalid = false;
    //     this.singleOption = false;
    //     let isOptionInvalid = false;
    
    //     this.questions.controls.forEach((control) => {
    //         if (control instanceof FormGroup) {
    //             const ques = control;
    //             const optionsArray = this.getOptions(ques);
        
    //             if (!this.getQuestionTextControl(ques)?.value.trim()) this.isQuestionInvalid = true;
        
    //             optionsArray.controls.forEach(optionControl => {
    //                 if (!optionControl.value.trim()) isOptionInvalid = true;
    //                 else if (((ques.get('type')?.value === "multipleChoice") && (optionsArray.controls.length < 2)) ||
    //                     (ques.get('type')?.value === "dropdown") && (optionsArray.controls.length < 2))
    //                     this.singleOption = true;
    //             });
    //         }
    //     });
    
    //     if (this.isQuestionInvalid || isOptionInvalid || this.singleOption) return;
    
    
    //     if (this.formBuilder.valid) {
    //         if (this.formId) {
    //             this.formService.updateForm(this.formId, this.formBuilder.value).subscribe({
    //             next: () => {
    //                 this.submitSuccess = true;
    //                 setTimeout(() => {
    //                 this.submitSuccess = false;
    //                 this.router.navigate(['/forms']);
    //                 }, 3000);
    //             },
    //             error: (error) => {
    //                 console.error("Error updating form", error);
    //             }
    //             });
    //         } else {
    //             this.formService.addForm(this.formBuilder.value);
    //             this.submitSuccess = true;
    //             setTimeout(() => {
    //             this.submitSuccess = false;
    //             this.router.navigate(['/forms']);
    //             }, 3000);
    //         }
    //     } else {
    //     console.log("Form is invalid");
    //     }
    // }
    
    // drop(event: CdkDragDrop<string[]>) {
    //     moveItemInArray(this.questions.controls, event.previousIndex, event.currentIndex);
    //     this.questions.updateValueAndValidity();
    // }
// }
