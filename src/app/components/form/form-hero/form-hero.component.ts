import { ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, AbstractControl } from '@angular/forms';
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
    scalingOptions=Array.from({ length: 6 }, (_, i) => i + 5);
    submitClicked = false;
    submitSuccess = false;
    singleOption = false;
    formFetched = false;
    isQuestionInvalid: boolean = false;
    showOptionsMap: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    showMenuMap: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    showQuestionDescription: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    otherAddedMap: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};

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
        if (urlParts[1] === 'edit' && urlParts[2]) {
            this.formId = parseInt(urlParts[2]);
            this.formService.getFormById(this.formId).subscribe(form => {

                this.formBuilder.patchValue({
                    title: form.title,
                    description: form.description,
                });

                const parsedSchema = JSON.parse(form.formSchema);
                // console.log(JSON.stringify(parsedSchema));

                const sectionsArray = (parsedSchema.sections || []).map((section:any) =>{
                    const questions = section.questions.map((field:any) =>{
                        return this.fb.group({
                            questionText: field.questionText,
                            questionDescription: '',
                            type: field.type,
                            required: field.required,
                            options: this.fb.array(
                                (field.options || []).map((option: any) => 
                                    this.fb.group({
                                        label: option.label,
                                        goToSection: option.goToSection || null
                                    })
                                )
                            ),
                            rating: field.rating || 5,
                            startValue: [field.startValue ?? 0],
                            endValue: [field.endValue ?? 5],
                            rows: this.fb.array(field.rows || []),         
                            columns: this.fb.array(field.columns || []),   
                            fileUrl: [field.fileUrl || ''], 
                            sectionBasedonAnswer: field.sectionBasedonAnswer || false
                        });
                    });
                    return this.fb.group({
                        sectionTitle: section.sectionTitle,
                        sectionDescription: section.sectionDescription,
                        nextSection: section.nextSection,
                        questions: this.fb.array(questions)
                    });
                });
                this.formBuilder.setControl('sections', this.fb.array(sectionsArray));
                this.formFetched=true;
            });
        } 
        else {
            this.addSection(); // Start with one section by default
        }
    }

    //* Getting Form title in navbar
    @Input() formTitle: string = '';
    @Output() formTitleChange = new EventEmitter<string>();

    //* Getting Form data to preview
    getFormData(){
        return this.formBuilder.value;
    }

    onTitleChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.formTitleChange.emit(input.value);
    }

    onTitleBlur(event: FocusEvent) {
        const input = event.target as HTMLInputElement;
        if (!input.value.trim()) {
            input.value = 'Untitled Form';
            this.formTitleChange.emit('Untitled Form');
        }
    }

    togglesectionBasedonAnswer(sectionIndex: number, questionIndex: number){
        const question = (this.sections.at(sectionIndex).get('questions') as FormArray).at(questionIndex) as FormGroup;
        
        const currentVal = question.get('sectionBasedonAnswer')?.value || false;
        question.get('sectionBasedonAnswer')?.setValue(!currentVal);
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

    //selects all text when focused on option input field
    selectAllText(eventTarget: EventTarget | null){
        if(eventTarget instanceof HTMLInputElement)
            eventTarget.select();
    }

    setDefaultValueIfEmpty(inputElement: EventTarget | null, question: any, opIdx: number){
        if(inputElement instanceof HTMLInputElement){
            if(inputElement && inputElement.value.trim()===''){
                const optionsFormArray = this.getOptions(question);
                const control = optionsFormArray.at(opIdx) as FormGroup;
                if(control){
                    control.get('label')?.setValue(`Option ${opIdx+1}`)
                }
            }
        }
    }

    get sections(): FormArray{
        return this.formBuilder.get('sections') as FormArray;
    }

    addSection() {
        const sectionGroup = this.fb.group({
            sectionTitle: [this.sections.length==0? this.getTitleControl()?.value : 'Untitled Section'],
            sectionDescription: [''],
            nextSection: [this.sections.length + 1],
            questions: this.fb.array([]),
        });
        // handling form title change and updating first secitons title
        this.getTitleControl()?.valueChanges.subscribe(title => {
            this.sections.at(0).get('sectionTitle')?.setValue(title);
        });
        this.sections.push(sectionGroup);
        
        // Add 1 question by default to new section 
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
            rows: this.fb.array([]),
            columns: this.fb.array([]),
            startValue: [0],
            endValue: [5],
            sectionBasedonAnswer: false, 
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
            if(options.length === 0) {
                const newOption = this.fb.group({
                    label: [`Option 1`],
                    goToSection: [sectionIndex + 1]
                });
                options.push(newOption);
            }
                
        }

        if (type === 'multipleChoiceGrid' || type === 'checkboxGrid') {
            const rows = questionGroup.get('rows') as FormArray;
            const columns = questionGroup.get('columns') as FormArray;
        
            if (rows.length === 0) rows.push(this.fb.control('Row 1'));
            if (columns.length === 0) columns.push(this.fb.control('Column 1'));
        }
        
       
        //Removing default option added when the type is not from the 3
        questionGroup.get('type')?.valueChanges.subscribe(type => {
            const rows = questionGroup.get('rows') as FormArray;
            const columns = questionGroup.get('columns') as FormArray;    
            if(!(type === 'multipleChoice' || type === 'checkboxes' || type === 'dropdown')){
                const options = questionGroup.get('options') as FormArray;
                options.clear();
            }
            if (!(type === 'multipleChoiceGrid' || type === 'checkboxGrid')) {
                rows.clear();
                columns.clear();
            }
            if (type !== 'linearScale') {
                questionGroup.patchValue({ startValue: 0, endValue: 5 });
            }
          
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
            questionDescription: [originalQuestion.questionDescription || null],
            type: [originalQuestion.type],
            options: this.fb.array(originalQuestion.options.map((opt: any) => this.fb.control(opt))),
            rating: [originalQuestion.rating],
            required: [originalQuestion.required],
            startValue: [originalQuestion.startValue ?? 0],
            endValue: [originalQuestion.endValue ?? 5],
            rows: this.fb.array(
                originalQuestion.rows
                ? originalQuestion.rows.map((row: any) => this.fb.control(row))
                : []
            ),
            columns: this.fb.array(
                originalQuestion.columns
                ? originalQuestion.columns.map((col: any) => this.fb.control(col))
                : []
            ),
            sectionBasedonAnswer: [originalQuestion.sectionBasedonAnswer] 
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

        const options = this.getOptions(this.getSectionQuestions(sectionIndex).at(questionIndex));
        const index = options.length;

        //* Checking for option - 'Other' added
        if (value === 'Other') {
            if (!this.otherAddedMap[sectionIndex])
                this.otherAddedMap[sectionIndex] = {};
            this.otherAddedMap[sectionIndex][questionIndex] = true;
            const newOption = this.fb.group({
                label: ['Other'],
                goToSection: [sectionIndex + 1]
            });
            options.push(newOption);
    
            // newOption.get('label')?.disable(); // Disable editing "Other"
        }
        else{
            const otherAdded = this.otherAddedMap[sectionIndex]?.[questionIndex];
            const newOption = this.fb.group({
                label: [`Option ${index + (otherAdded? 0:1)}`],
                goToSection: [sectionIndex + 1]
            });
            options.push(newOption);
        }
        // if(value!=''){
        //     if(!this.otherAddedMap[sectionIndex])
        //         this.otherAddedMap[sectionIndex]={};
        //     this.otherAddedMap[sectionIndex][questionIndex]=true;
        //     options.push(new FormControl(value));
        //     options.at(index).disable() // Can't edit option - 'Other'
        // }
        // else{
        //     const otherAdded = this.otherAddedMap[sectionIndex]?.[questionIndex];
        //     options.push(new FormControl(`Option ${index + (otherAdded? 0:1)}`));
        // }
        this.singleOption = false;
    }

    removeOption(sectionIndex: number, questionIndex: number, optionIndex: number){
        const questions = this.getSectionQuestions(sectionIndex).at(questionIndex);
        const options = this.getOptions(this.getSectionQuestions(sectionIndex).at(questionIndex));

        if(options.at(optionIndex).get('label')?.value==='Other'){
            this.otherAddedMap[sectionIndex][questionIndex]=false;
        }
        options.removeAt(optionIndex);
        if(options.length==1)
            this.singleOption=true
    }

    drop(event: CdkDragDrop<string[]>, sectionIndex: number){
        const questionsArray = this.getSectionQuestions(sectionIndex);
        moveItemInArray(questionsArray.controls, event.previousIndex, event.currentIndex);
        questionsArray.updateValueAndValidity();
    }



    addGridRow(sectionIndex: number, questionIndex: number) {
        const question = this.getSectionQuestions(sectionIndex).at(questionIndex) as FormGroup;
      
        let rows = question.get('rows') as FormArray;
        if (!rows) {
          rows = this.fb.array([]);
          question.addControl('rows', rows);
        }
      
        rows.push(this.fb.control(''));
      }
      
      addGridColumn(sectionIndex: number, questionIndex: number) {
        const question = this.getSectionQuestions(sectionIndex).at(questionIndex) as FormGroup;
      
        let columns = question.get('columns') as FormArray;
        if (!columns) {
          columns = this.fb.array([]);
          question.addControl('columns', columns);
        }
      
        columns.push(this.fb.control(''));
      }
      getNonEmptyGridItems(items: FormArray): number {
        return items.controls.filter(control => {
          return control.value && control.value.trim() !== '';
        }).length;
      }      
      
      removeGridRow(sectionIndex: number, questionIndex: number, rowIndex: number) {
        const question = this.getSectionQuestions(sectionIndex).at(questionIndex);
        const rows = this.getRows(question);
        rows.removeAt(rowIndex);
      }
      
  
      removeGridColumn(sectionIndex: number, questionIndex: number, colIndex: number) {
        const questions = this.getSectionQuestions(sectionIndex);
        const question = questions.at(questionIndex) as FormGroup;
        const columns = this.getColumns(question);
        columns.removeAt(colIndex);
      }      
  
  getRows(question: AbstractControl): FormArray {
    return question.get('rows') as FormArray;
  }
  
  getColumns(question: AbstractControl): FormArray {
    return question.get('columns') as FormArray;
  }
  hasEmptyGridItem(array: FormArray): boolean {
    return array.controls.some(control => !control.value?.trim());
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

                    const type = ques.get('type')?.value;
                    const rows = ques.get('rows') as FormArray;
                    const columns = ques.get('columns') as FormArray;
                    if ((type === 'checkboxGrid' || type === 'multipleChoiceGrid')) {
                        const nonEmptyRows = rows?.controls.filter(rowCtrl => rowCtrl.value?.trim()) || [];
                        const nonEmptyCols = columns?.controls.filter(colCtrl => colCtrl.value?.trim()) || [];
                        if (nonEmptyRows.length === 0 || nonEmptyCols.length === 0) {
                            this.isQuestionInvalid = true;
                        }
                    }
                    // optionsArray.controls.forEach(optionControl => {
                    //     if (((ques.get('type')?.value === "multipleChoice") || (ques.get('type')?.value === "dropdown"))
                    //         &&
                    //         (optionsArray.length < 2))
                    //         this.singleOption = true;
                    // });
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
            // console.log("logging form");
            // console.log(payload);

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