import { ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter, ElementRef, HostListener, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { FormService } from 'src/app/services/form.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-form-hero',
  templateUrl: './form-hero.component.html',
  styleUrls: ['./form-hero.component.scss']
})
export class FormHeroComponent implements OnInit{

    formId: number | null = null;
    formBuilder: FormGroup;
    showTemplateSuccess = false;
    isTemplateMode = false;

    // maintain order in questionTypes
    questionTypes = [
        { type: 'shortText', label: 'Short Text', icon: 'assets/question-type-icons/shortText.svg' },
        { type: 'paragraph', label: 'Paragraph', icon: 'assets/question-type-icons/paragraph.svg'},
        { type: 'multipleChoice', label: 'Multiple Choice', icon: 'assets/question-type-icons/multipleChoice.svg'},
        { type: 'checkboxes', label: 'Checkboxes', icon: 'assets/question-type-icons/checkboxes.svg'},
        { type: 'dropdown', label: 'Dropdown', icon: 'assets/question-type-icons/dropdown.svg'},
        { type: 'date', label: 'Date', icon: 'assets/question-type-icons/date.svg'},
        { type: 'time', label: 'Time', icon: 'assets/question-type-icons/time.svg'},
        { type: 'linearScale', label: 'Linear Scale', icon: 'assets/question-type-icons/linearScale.svg'},
        { type: 'multipleChoiceGrid', label: 'Multiple Choice Grid', icon: 'assets/question-type-icons/multipleChoiceGrid.svg'},
        { type: 'checkboxGrid', label: 'Checkbox Grid', icon: 'assets/question-type-icons/checkboxGrid.svg'},
        { type: 'rating', label: 'Rating', icon: 'assets/question-type-icons/rating.svg'},
        { type: 'file', label: 'File Upload', icon: 'assets/question-type-icons/file.svg'},
    ];
    selectedTypes: { [sIdx: number]: { [qIdx: number]: any } } = {};
    showFormNavigation: boolean = true;
    ratingOptions = Array.from({ length: 10 }, (_, i) => i + 1);
    scalingOptions = Array.from({ length: 6 }, (_, i) => i + 5);
    currentUrl!: String;
    submitClicked = false;
    submitSuccess = false;
    singleOption = false;
    formFetched = false;
    isQuestionInvalid: boolean = false;
    showOptionsMap: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    showMenuMap: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    showQuestionDescription: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    otherAddedMap: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    questionTypeDropdown: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    isDropdownOpen: boolean = false;

    constructor(private fb: FormBuilder, 
                private formService: FormService, 
                private router: Router, 
                private cdr: ChangeDetectorRef,
            private route: ActivatedRoute) {
        this.formBuilder = this.fb.group({
            title: 'Untitled Form',
            description: '',
            sections: this.fb.array([])
        });

        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
            this.currentUrl = event.url;
        });

        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
            this.currentUrl = event.url;
        });
    }

    ngOnInit() {
        // --if you're editing an existing form, fetch data
        const urlParts = this.router.url.split('/');
        this.route.queryParams.subscribe(params => {
            const templateId = params['templateId'];
            if (templateId) {
              this.loadTemplate(templateId);
            }
            else if (urlParts[1] === 'edit' && urlParts[2]) {
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
        });
    }

    private loadTemplate(templateId: number) {
        this.formService.getFormById(templateId).subscribe({
        next: (form) => {
            // Clear existing form
            while (this.sections.length !== 0) {
            this.sections.removeAt(0);
            }
    
            // Parse form schema
            const parsedSchema = typeof form.formSchema === 'string' ? 
                            JSON.parse(form.formSchema) : 
                            form.formSchema;
    
            // Rebuild sections
            parsedSchema.sections.forEach((section: any) => {
            const newSection = this.fb.group({
                sectionTitle: section.sectionTitle,
                sectionDescription: section.sectionDescription,
                nextSection: section.nextSection,
                questions: this.fb.array([])
            });
    
            section.questions.forEach((question: any) => {
                const questionGroup = this.fb.group({
                questionText: question.questionText,
                questionDescription: question.questionDescription,
                type: question.type,
                options: this.fb.array(
                    (question.options || []).map((opt: any) =>
                    this.fb.group({
                        label: opt.label,
                        goToSection: opt.goToSection
                    })
                    )
                ),
                rating: question.rating || 5,
                required: question.required,
                sectionBasedonAnswer: question.sectionBasedonAnswer
                });
                
                (newSection.get('questions') as FormArray).push(questionGroup);
            });
    
            this.sections.push(newSection);
            });
    
            this.formBuilder.patchValue({
            title: form.title + ' (Copy)',
            description: form.description
            });
            
            this.formFetched = true;
        },
        error: (err) => {
            console.error('Error loading template:', err);
            this.router.navigate(['/form-template']);
        }
        });
    }
  
    ngAfterViewInit() {
        if (this.formFetched && !this.sections.length) {
        this.router.navigate(['/form-template'], {
            queryParams: { error: 'invalid-template' }
        });
        }
    }


    //* --Getting Form data to preview
    getFormData(){
        return this.formBuilder.value;
    }

    //* Getting Form title in navbar
    @Input() formTitle: string = '';
    @Output() formTitleChange = new EventEmitter<string>();

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

    // navigate to question from form navigation
    scrollToQuestion(sectionIndex: number, questionIndex: number): void {
        const el = document.getElementById(`question-${sectionIndex}-${questionIndex}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            el.classList.add('ring-2', 'ring-indigo-200');
        
            setTimeout(() => {
              el.classList.remove('ring-2', 'ring-indigo-200');
            }, 1500);
        }
    }

    selectType(sIdx: number, qIdx: number, type: string) {
        const question = (this.sections.at(sIdx).get('questions') as FormArray).at(qIdx) as FormGroup;
        question.get('type')?.setValue(type);

        const selected = this.questionTypes.find(opt => opt.type === type);
        if (!this.selectedTypes[sIdx]) this.selectedTypes[sIdx] = {};
        this.selectedTypes[sIdx][qIdx] = selected;

        // Close dropdown
        this.questionTypeDropdown[sIdx][qIdx] = false; 
        this.isDropdownOpen = false;
    }
    
    @ViewChildren('dropdownBox') dropdownBoxes!: QueryList<ElementRef>;
    @HostListener('document:click', ['$event.target'])
    onClickOutside(target: HTMLElement) {
        const clickedInsideAny = this.dropdownBoxes.some(dropdown =>
            dropdown.nativeElement.contains(target)
        );

        if (!clickedInsideAny) {
            this.isDropdownOpen = false;

            // Optionally close all dropdowns
            for (let sIdx in this.questionTypeDropdown) {
            for (let qIdx in this.questionTypeDropdown[sIdx]) {
                this.questionTypeDropdown[sIdx][qIdx] = false;
            }
            }
        }
    }

    showQuestionTypeDropdown(sectionIndex: number, questionIndex: number) {
        if (!this.questionTypeDropdown[sectionIndex]) {
            this.questionTypeDropdown[sectionIndex] = {};
        }
        this.questionTypeDropdown[sectionIndex][questionIndex] = true;
        this.isDropdownOpen = true;
    }

    togglesectionBasedonAnswer(sectionIndex: number, questionIndex: number){
        const question = (this.sections.at(sectionIndex).get('questions') as FormArray).at(questionIndex) as FormGroup;
        
        const currentVal = question.get('sectionBasedonAnswer')?.value || false;
        question.get('sectionBasedonAnswer')?.setValue(!currentVal);
    }
  
    // --other options menu toggle
    toggleOtherOptionsMenu(sectionIndex: number, questionIndex: number) {
        if (!this.showMenuMap[sectionIndex]) this.showMenuMap[sectionIndex] = {};
        if (!this.selectedTypes[sectionIndex]) this.selectedTypes[sectionIndex] = {};
        const isMenuOpen = this.showMenuMap[sectionIndex][questionIndex];
        this.showMenuMap[sectionIndex][questionIndex] = !isMenuOpen;
    }

    // --collapse or explan options
    toggleOptions(sectionIndex: number, questionIndex: number) {
        const isVisible = this.showOptionsMap[sectionIndex][questionIndex];
        this.showOptionsMap[sectionIndex][questionIndex] = !isVisible;
    }

    toggleQuestionDescription(sectionIndex: number, questionIndex: number) {
        const isVisible = this.showQuestionDescription[sectionIndex][questionIndex];
        this.showQuestionDescription[sectionIndex][questionIndex] = !isVisible;
    }

    //selects all text when focused on option input field
    // selectAllText(eventTarget: EventTarget | null){
    //     if(eventTarget instanceof HTMLInputElement)
    //         eventTarget.select();
    // }

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
        // --handling form title change and updating first secitons title
        this.getTitleControl()?.valueChanges.subscribe(title => {
            this.sections.at(0).get('sectionTitle')?.setValue(title);
        });
        this.sections.push(sectionGroup);
        
        // --Add 1 question by default to new section 
        this.addQuestionToSection(this.sections.length - 1);
        this.cdr.detectChanges();
    }

    removeSection(index: number){
        this.sections.removeAt(index);
    }

    getSectionTitleControl(section: any){
        // --Making form title as 1st sections title
        this.sections.at(0).get('sectionTitle')?.setValue(this.getTitleControl()?.value || 'Untitled Section');

        // --handling form title change and updating first secitons title
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

        if (!this.showQuestionDescription[sectionIndex]) this.showQuestionDescription[sectionIndex] = {};
        if (!this.questionTypeDropdown[sectionIndex]) this.questionTypeDropdown[sectionIndex] = {};
        
        // set default question type as multipleChoice
        const defaultType = 'multipleChoice'; 
        const defaultOption = this.questionTypes.find(option => option.type === defaultType);
        const qIdx = this.getSectionQuestions(sectionIndex).controls.length;

        if (!this.selectedTypes[sectionIndex]) this.selectedTypes[sectionIndex] = {};
        this.selectedTypes[sectionIndex][qIdx] = defaultOption;
        
        // add default option if question type is mcq, checkbox, or dropdown
        const type = questionGroup.get('type')?.value;
        const options = questionGroup.get('options') as FormArray;
        const rows = questionGroup.get('rows') as FormArray;
        const columns = questionGroup.get('columns') as FormArray;

        const isOptionType = type === 'multipleChoice' || type === 'checkboxes' || type === 'dropdown';
        const isGridType = type === 'multipleChoiceGrid' || type === 'checkboxGrid';

        // --Handle option-based questions
        if (isOptionType) {
            if (!this.showOptionsMap[sectionIndex]) {
                this.showOptionsMap[sectionIndex] = {};
            }
            this.showOptionsMap[sectionIndex][section.length] = true;

            if (options.length === 0) {
                options.push(this.fb.group({
                    label: ['Option 1'],
                    goToSection: [sectionIndex + 1]
                }));
            }
        }

        // --Handle grid-based questions
        if (isGridType) {
            if (rows.length === 0) rows.push(this.fb.control('Row 1'));
            if (columns.length === 0) columns.push(this.fb.control('Column 1'));
        }

        // --Subscribe to type changes
        questionGroup.get('type')?.valueChanges.subscribe(updatedType => {
            if (typeof updatedType !== 'string') return; 
            const isNewOptionType = ['multipleChoice', 'checkboxes', 'dropdown'].includes(updatedType);
            const isNewGridType = ['multipleChoiceGrid', 'checkboxGrid'].includes(updatedType);

            if (isNewOptionType && options.length === 0) {
                options.push(this.fb.group({
                    label: ['Option 1'],
                    goToSection: [sectionIndex + 1]
                }));
            } else if (!isNewOptionType) {
                options.clear();
            }

            if (!isNewGridType) {
                rows.clear();
                columns.clear();
            }

            if (updatedType !== 'linearScale') {
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

        //* --Checking for option - 'Other' added
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
        else {
            const otherAdded = this.otherAddedMap[sectionIndex]?.[questionIndex];
            const otherIndex = options.controls.findIndex(opt => opt.value.label === 'Other');
            const newOption = this.fb.group({
                label: [`Option ${index + (otherAdded? 0:1)}`],
                goToSection: [sectionIndex + 1]
            });
            
            // -- keeping 'Other' option always below normal options
            if(otherIndex != -1)
                options.insert(otherIndex, newOption)
            else
            options.push(newOption);
        }
        this.singleOption = false;
    }

    removeOption(sectionIndex: number, questionIndex: number, optionIndex: number) {
        const questions = this.getSectionQuestions(sectionIndex).at(questionIndex);
        const options = this.getOptions(this.getSectionQuestions(sectionIndex).at(questionIndex));

        if(options.at(optionIndex).get('label')?.value === 'Other') {
            this.otherAddedMap[sectionIndex][questionIndex] = false;
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
  


    onSubmit(isTemplate: boolean = false) {
        this.submitClicked = true;
        if (!this.getTitleControl()?.value.trim()) return;

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

            if (isTemplate) {
                this.formService.saveAsTemplate(payload).subscribe({
                    next: () => {
                        this.showTemplateSuccess = true;
                        setTimeout(() => {
                            this.router.navigate(['/form-template']);
                        }, 2000);
                    },
                    error: (error) => console.error(error)
                });
            } else {
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
            } 
        }else {  // Move this else inside the main if block
            console.log("Form is invalid");
        }
    }
}