import { ChangeDetectorRef, Component, OnInit, Input, Output, EventEmitter, ElementRef, HostListener, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, AbstractControl, Validators, ValidationErrors, FormArrayName } from '@angular/forms';
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

    ratingOptions = Array.from({ length: 8 }, (_, i) => i + 3);
    scalingOptions = Array.from({ length: 6 }, (_, i) => i + 5);
    minDateTime!: string;
    currentUrl!: string;

    // Flags
    showTemplateSuccess = false;
    showDraftSuccess = false;
    isTemplateMode = false;
    formFetched = false;
    submitClicked = false;
    submitSuccess = false;
    isQuestionInvalid = false;
    showFormNavigation = true;
    isDropdownOpen = false;
    isDeadline = false;
    
    // Mapping properties
    selectedTypes: { [sIdx: number]: { [qIdx: number]: any } } = {};
    showMenuMap: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    showQuestionDescription: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    collapseQuestionMap: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    otherAddedMap: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    questionTypeDropdown: { [sectionIndex: number]: { [questionIndex: number]: boolean } } = {};
    
    
    formId: number | null = null;
    formBuilder: FormGroup;

    constructor(private fb: FormBuilder, 
                private formService: FormService, 
                private router: Router, 
                private cdr: ChangeDetectorRef,
                private route: ActivatedRoute) {
        this.formBuilder = this.fb.group({
            title: 'Untitled Form',
            description: '',
            deadline: [null],
            sections: this.fb.array([]),
            isDraft: [false],
            draftId: [null]
        });
        
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
            this.currentUrl = event.url;
        });
    }

    ngOnInit() {

        // deadline validation functions
        this.updateDeadlineValidator();
        this.setMinDateTime();

        // if you're editing an existing form/template/draft, fetch data
        const urlParts = this.router.url.split('/');
        this.route.queryParams.subscribe(params => {

            const templateId = params['templateId'];
            const draftId = params['draftId'];

            if (templateId) {
                this.formId = templateId;
                this.loadForm(templateId, true);
            }

            else if(draftId) {
                this.formId = draftId;
                this.loadForm(draftId, false);
            }

            else if (urlParts[1] === 'edit' && urlParts[2]) {
                this.formId = parseInt(urlParts[2]);
                this.loadForm(this.formId, false);

            } 
            else {
                this.addSection(); 
            }
        });
    }
    
    private loadForm(formId: number, isTemplate: boolean) {
        this.formService.getFormById(formId).subscribe({
            next: (form) => {

                console.log(form);
                // Clear existing form
                while (this.sections.length !== 0) {
                    this.sections.removeAt(0);
                }

                if(isTemplate) {
                    this.formBuilder.patchValue({
                        title: form.title + ' (Copy)',
                        description: form.description,
                        deadline: form.deadline,
                        isDraft: form.isDraft,
                        draftId: form.id
                    });
                } else {
                    this.formBuilder.patchValue({
                        title: form.title,
                        description: form.description,
                        deadline: form.deadline,
                        isDraft: form.isDraft,
                        draftId: form.id
                    });
                }

                console.log(this.formBuilder.get('isDraft'));

                // Show deadline if present
                if(form.deadline) {
                    this.isDeadline = true;
                    this.formBuilder.get('deadline')?.updateValueAndValidity();
                }
                this.updateDeadlineValidator();
                
                // Send form title to navbar component
                this.formTitleChange.emit(this.formBuilder.value.title);
                
                // Parse form schema
                const parsedSchema = typeof form.formSchema === 'string' ? JSON.parse(form.formSchema) : form.formSchema;
                
                const sectionsArray = (parsedSchema.sections || []).map((section: any, sIdx: number) => {
                    const questions = section.questions.map((field: any, qIdx: number) => {

                        // Update map properties
                        if(field.questionDescription) this.showQuestionDescription[sIdx][qIdx] = true;
                        
                        if (!this.otherAddedMap[sIdx]) this.otherAddedMap[sIdx] = {};
                        if(field.options) {
                            field.options.map((option: any) => {
                                if(option.isOther) this.otherAddedMap[sIdx][qIdx] = true;
                            });
                        }

                        return this.fb.group({
                            questionText: field.questionText,
                            questionDescription: field.questionDescription,
                            type: field.type,
                            required: field.required,
                            sectionBasedonAnswer: field.sectionBasedonAnswer || false,
                            options: this.fb.array(
                                (field.options || []).map((option: any) => 
                                    this.fb.group({
                                        label: [{ value: option.label, disabled: option.isOther }],
                                        goToSection: option.goToSection || null,
                                        isOther: option.isOther
                                    })
                                )
                            ),
                            rating: field.rating || 5,
                            startValue: [field.startValue ?? 0],
                            endValue: [field.endValue ?? 5],
                            rows: this.fb.array(field.rows || []),         
                            columns: this.fb.array(field.columns || []),   
                            fileUrl: [field.fileUrl || ''], 
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
                
                // Initialise mapping properties
                this.selectedTypes = parsedSchema.sections.map((section: any) => 
                    section.questions.map((question: any) => {
                    const found = this.questionTypes.find(q => q.type === question.type);
                    return { ...found };
                    })
                );
                this.questionTypeDropdown = parsedSchema.sections.map((section: any) => 
                    section.questions.map(() => false)
                );
                this.showQuestionDescription = parsedSchema.sections.map((section: any) => 
                    section.questions.map(() => false)
                );
                
                this.formFetched = true;
            },
            error: (err) => {
                console.error('Error loading form', err);
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

    updateDeadlineValidator() {
        
        const deadlineControl = this.formBuilder.get('deadline');
        if (this.isDeadline) {
            deadlineControl?.setValidators([Validators.required, FormHeroComponent.futureDateValidator]);
        } else {
            deadlineControl?.clearValidators();
            deadlineControl?.setValue(null); // optional: reset field
        }
        
        deadlineControl?.updateValueAndValidity();
    }

    setMinDateTime() {
        const now = new Date();
        // Convert to ISO and remove seconds + milliseconds
        const isoString = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
        this.minDateTime = isoString;
    }

    static futureDateValidator(control: AbstractControl): ValidationErrors | null {
        if (!control.value) return null;
        const selectedDate = new Date(control.value);
        const now = new Date();

        return selectedDate > now ? null : { pastDate: true };
    }

    //* --Getting Form data to preview
    getFormData(){
        return this.formBuilder.value;
    }

    getStarsArray(count: number): number[] {
        return Array.from({ length: count }, (_, i) => i + 1);
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

    scrollToTarget(targetId: string, color: string): void {

        const el = document.getElementById(targetId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            el.classList.add('ring-2', 'ring-' + color + '-300');
        
            setTimeout(() => {
              el.classList.remove('ring-2', 'ring-' + color + '-300');
            }, 2000);
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

    toggleDeadline() {
        this.submitClicked = false;
        this.isDeadline = !this.isDeadline;
        this.updateDeadlineValidator();
    }

    toggleSectionBasedonAnswer(sectionIndex: number, questionIndex: number) {
        const question = (this.sections.at(sectionIndex).get('questions') as FormArray).at(questionIndex) as FormGroup;
        
        const currentVal = question.get('sectionBasedonAnswer')?.value || false;
        question.get('sectionBasedonAnswer')?.setValue(!currentVal);
    }
  
    // other options menu toggle
    toggleOtherOptionsMenu(sectionIndex: number, questionIndex: number) {
        if (!this.showMenuMap[sectionIndex]) this.showMenuMap[sectionIndex] = {};
        if (!this.selectedTypes[sectionIndex]) this.selectedTypes[sectionIndex] = {};
        const isMenuOpen = this.showMenuMap[sectionIndex][questionIndex];
        this.showMenuMap[sectionIndex][questionIndex] = !isMenuOpen;
    }

    toggleQuestionDescription(sectionIndex: number, questionIndex: number) {
        const isVisible = this.showQuestionDescription[sectionIndex][questionIndex];
        this.showQuestionDescription[sectionIndex][questionIndex] = !isVisible;
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

    onRowColBlur(inputElement: EventTarget | null, question: any){
        const rows = this.getRows(question);
        rows.controls.forEach((row, index) => {
            if(row.value.trim()==='')
                row.setValue(`Row ${index+1}`)
        });

        const columns = this.getColumns(question);
        columns.controls.forEach((column, index) => {
            if(column.value.trim()==='')
                column.setValue(`Column ${index+1}`);
        });
    }

    get sections(): FormArray{
        return this.formBuilder.get('sections') as FormArray;
    }

    addSection(sIdx: number = -1) {
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

        // --scroll to new section added
        if(sIdx !== -1){
            const el = document.getElementById(`section-${sIdx}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    removeSection(sIdx: number){
        this.sections.removeAt(sIdx);

        // --scroll to previous section
        if(sIdx !== -1){
            const el = document.getElementById(`section-${sIdx-1}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    getSectionTitleControl(section: any){
        // --Making form title as 1st sections title
        this.sections.at(0).get('sectionTitle')?.setValue(this.getTitleControl()?.value || 'Untitled Section');

        // --handling form title change and updating first sections title
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
        if (!this.collapseQuestionMap[sectionIndex]) this.collapseQuestionMap[sectionIndex] = {};
        
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

        const isOptionType = (type === 'multipleChoice' || type === 'checkboxes' || type === 'dropdown');
        const isGridType = (type === 'multipleChoiceGrid' || type === 'checkboxGrid');

        // --Handle option-based questions
        if (isOptionType) {

            if (options.length === 0) {
                options.push(this.fb.group({
                    label: ['Option 1'],
                    goToSection: [sectionIndex + 1],
                    isOther: [false]
                }));
            }

            console.log(options);
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
                    goToSection: [sectionIndex + 1],
                    isOther: [false]
                }));
            } else if (!isNewOptionType) {
                options.clear();
            }

            if(isNewGridType){
                if(rows.length===0) rows.push(this.fb.control('Row 1'));
                if (columns.length === 0) columns.push(this.fb.control('Column 1'));
            } else if (!isNewGridType) {
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

        // --scroll to new question everytime added
        if(section.controls.length>1){
            const el = document.getElementById(`question-${sectionIndex}-${section.controls.length-1}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                el.classList.add('ring-2', 'ring-indigo-200');
            
                setTimeout(() => {
                    el.classList.remove('ring-2', 'ring-indigo-200');
                }, 1500);
            }
        }
    }

    duplicateQuestion(sectionIndex: number, questionIndex: number) {
        const section = this.getSectionQuestions(sectionIndex);
        const originalQuestion = section.at(questionIndex);
    
        if (!originalQuestion) return;
    
        const duplicated = this.fb.group({
            questionText: [originalQuestion.get('questionText')?.value || ''],
            questionDescription: [originalQuestion.get('questionDescription')?.value || ''],
            type: [originalQuestion.get('type')?.value || 'multipleChoice'],
            options: this.fb.array([]),
            rating: [originalQuestion.get('rating')?.value || 5],
            required: originalQuestion.get('required')?.value || false,
            rows: this.fb.array([]),
            columns: this.fb.array([]),
            startValue: [originalQuestion.get('startValue')?.value || 0],
            endValue: [originalQuestion.get('endValue')?.value || 5],
            sectionBasedonAnswer: originalQuestion.get('sectionBasedonAnswer')?.value || false,
        });
    
        const options = duplicated.get('options') as FormArray;
        const rows = duplicated.get('rows') as FormArray;
        const columns = duplicated.get('columns') as FormArray;
    
        const type = duplicated.get('type')?.value;
    
        if (['multipleChoice', 'checkboxes', 'dropdown'].includes(type)) {
            const originalOptions = originalQuestion.get('options') as FormArray;
            originalOptions?.controls.forEach(opt => {
                options.push(this.fb.group({
                    label: [opt.get('label')?.value || ''],
                    goToSection: [opt.get('goToSection')?.value ?? null],
                    isOther: [opt.get('isOther')?.value ?? false]
                }));
            });
        }
    
        if (['multipleChoiceGrid', 'checkboxGrid'].includes(type)) {
            const originalRows = originalQuestion.get('rows') as FormArray;
            const originalCols = originalQuestion.get('columns') as FormArray;
    
            originalRows?.controls.forEach(row => rows.push(this.fb.control(row.value)));
            originalCols?.controls.forEach(col => columns.push(this.fb.control(col.value)));
        }
    
        // Initialise map properties
        const qIdx = section.length;
        if (!this.selectedTypes[sectionIndex]) this.selectedTypes[sectionIndex] = {};
        this.selectedTypes[sectionIndex][qIdx] = this.questionTypes.find(q => q.type === type);
    
        if (!this.showQuestionDescription[sectionIndex]) this.showQuestionDescription[sectionIndex] = {};
        if (!this.questionTypeDropdown[sectionIndex]) this.questionTypeDropdown[sectionIndex] = {};
        if (!this.collapseQuestionMap[sectionIndex]) this.collapseQuestionMap[sectionIndex] = {};
    
        
        duplicated.get('type')?.valueChanges.subscribe(updatedType => {
            const isNewOptionType = ['multipleChoice', 'checkboxes', 'dropdown'].includes(updatedType);
            const isNewGridType = ['multipleChoiceGrid', 'checkboxGrid'].includes(updatedType);
    
            if (isNewOptionType && options.length === 0) {
                options.push(this.fb.group({
                    label: ['Option 1'],
                    goToSection: [sectionIndex + 1],
                    isOther: [false]
                }));
            } else if (!isNewOptionType) {
                options.clear();
            }
    
            if (isNewGridType) {
                if (rows.length === 0) rows.push(this.fb.control('Row 1'));
                if (columns.length === 0) columns.push(this.fb.control('Column 1'));
            } else {
                rows.clear();
                columns.clear();
            }
    
            if (updatedType !== 'linearScale') {
                duplicated.patchValue({ startValue: 0, endValue: 5 });
            }
    
            this.submitClicked = false;
        });
    
        section.insert(questionIndex + 1, duplicated);
        this.cdr.detectChanges();
    
        // Scroll to duplicated question
        const el = document.getElementById(`question-${sectionIndex}-${questionIndex + 1}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-indigo-200');
            setTimeout(() => {
                el.classList.remove('ring-2', 'ring-indigo-200');
            }, 1500);
        }
    }

    removeQuestion(sectionIndex: number, questionIndex: number){
        const section = this.getSectionQuestions(sectionIndex);
        section.removeAt(questionIndex);

        // --scroll to previous question
        if(questionIndex>0){
            const el = document.getElementById(`question-${sectionIndex}-${questionIndex-1}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                el.classList.add('ring-2', 'ring-indigo-200');
            
                setTimeout(() => {
                    el.classList.remove('ring-2', 'ring-indigo-200');
                }, 1500);
            }
        }
        else{
            const el = document.getElementById(`question-${sectionIndex}-${questionIndex}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                el.classList.add('ring-2', 'ring-indigo-200');
            
                setTimeout(() => {
                    el.classList.remove('ring-2', 'ring-indigo-200');
                }, 1500);
            }
        }
    }

    getOptions(question: any): FormArray {
        return question.get('options') as FormArray;
    }

    addOption(sectionIndex: number, questionIndex: number, value: string = '') {
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
                goToSection: [sectionIndex + 1],
                isOther: [true],
            });
            newOption.disable();
            options.push(newOption);
            console.log(newOption.value);
        }
        else {
            const otherAdded = this.otherAddedMap[sectionIndex]?.[questionIndex];
            const otherIndex = options.controls.findIndex(opt => opt.value.isOther === true);
            const newOption = this.fb.group({
                label: [`Option ${index + (otherAdded? 0:1)}`],
                goToSection: [sectionIndex + 1],
                isOther: [false],
            });
            
            // -- keeping 'Other' option always below normal options
            if(otherIndex != -1) options.insert(otherIndex, newOption);
            else options.push(newOption);
        }
    }

    removeOption(sectionIndex: number, questionIndex: number, optionIndex: number) {
        const questions = this.getSectionQuestions(sectionIndex).at(questionIndex);
        const options = this.getOptions(questions);

        if(options.at(optionIndex).get('label')?.value === 'Other') {
            this.otherAddedMap[sectionIndex][questionIndex] = false;
        }
        options.removeAt(optionIndex);
    }

    dropSection(event: CdkDragDrop<string[]>){
        moveItemInArray(this.sections.controls, event.previousIndex, event.currentIndex);
    }

    dropQuestion(event: CdkDragDrop<string[]>, sectionIndex: number){
        const questionsArray = this.getSectionQuestions(sectionIndex);
        moveItemInArray(questionsArray.controls, event.previousIndex, event.currentIndex);
        questionsArray.updateValueAndValidity();
    }

    dropOption(event: CdkDragDrop<any[]>, sIdx: number, qIdx: number) {
        const optionsArray = this.getOptions(this.getSectionQuestions(sIdx).at(qIdx));
        
        // Check if trying to drop on 'Other' option
        const targetOption = optionsArray.at(event.currentIndex);
        if (targetOption.get('label')?.value === 'Other') return;
        
        moveItemInArray(optionsArray.controls, event.previousIndex, event.currentIndex);
      
        const updatedControls = optionsArray.controls.map(ctrl => ctrl);
        optionsArray.clear();
        updatedControls.forEach(ctrl => optionsArray.push(ctrl));
    }

    addGridRow(sectionIndex: number, questionIndex: number) {
        const question = this.getSectionQuestions(sectionIndex).at(questionIndex) as FormGroup;
        
        let rows = question.get('rows') as FormArray;
        if (!rows) {
            rows = this.fb.array([]);
            question.addControl('rows', rows);
        }
        
        rows.push(this.fb.control(`Row ${rows.length+1}`));
    }
      
    addGridColumn(sectionIndex: number, questionIndex: number) {
        const question = this.getSectionQuestions(sectionIndex).at(questionIndex) as FormGroup;
        
        let columns = question.get('columns') as FormArray;
        if (!columns) {
            columns = this.fb.array([]);
            question.addControl('columns', columns);
        }
        
        columns.push(this.fb.control(`Column ${columns.length+1}`));
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
  
    saveDraft(shouldNavigate: boolean = false) {
        const payload = {
            title: this.formBuilder.value.title,
            description: this.formBuilder.value.description,
            deadline: this.formBuilder.value.deadline,
            formSchema: {
                sections: this.formBuilder.get('sections')?.getRawValue()
            },
            isTemplate: false,
        };

        // for creating new draft
        this.formService.createDraft(payload).subscribe({
            next: () => {
                this.showDraftSuccess = true;
                setTimeout(() => {
                    this.showDraftSuccess = false;
                    if(shouldNavigate) this.router.navigate(['/form-template']);
                }, 2000);
            },
            error: (error) => {
                console.error("Error updating draft", error);
            }
        });
    }

    updateDraft() {
        const payload = {
            title: this.formBuilder.value.title,
            description: this.formBuilder.value.description,
            deadline: this.formBuilder.value.deadline,
            formSchema: {
                sections: this.formBuilder.get('sections')?.getRawValue()
            },
            isTemplate: false,
        };
        if(this.formId) {
            this.formService.updateDraft(this.formId, payload).subscribe({
                next: () => {
                    this.showDraftSuccess = true;
                    setTimeout(() => {
                        this.showDraftSuccess = false;
                        this.router.navigate(['/form-template']);
                    }, 2000);
                },
                error: (error) => {
                    console.error("Error updating draft", error);
                }
            });
        }
        
    }

    @Output() formSaved = new EventEmitter<number>();

    onSubmit(isTemplate: boolean = false, shouldNavigate: boolean = false) {
        this.submitClicked = true;

        // Validating form fields
        console.log("onsubmit called");
        if((this.formBuilder.get('deadline')?.hasError('required') && !this.formBuilder.get('deadline')?.value )
            || this.formBuilder.get('deadline')?.hasError('pastDate')) {
            this.scrollToTarget('form-deadline', 'red');
            return;
        }

        let sIdx = 0;
        this.sections.controls.forEach(section => {
            const questionsArray = (section.get('questions') as FormArray);
            let qIdx = 0;
            questionsArray.controls.forEach(control => {
                if (control instanceof FormGroup) {
                    const ques = control;

                    if (!this.getQuestionTextControl(ques)?.value.trim()) {
                        this.isQuestionInvalid = true;
                        this.scrollToTarget(`question-${sIdx}-${qIdx}`, 'red');
                        
                    }

                    const type = ques.get('type')?.value;
                    const rows = ques.get('rows') as FormArray;
                    const columns = ques.get('columns') as FormArray;
                    if ((type === 'checkboxGrid' || type === 'multipleChoiceGrid')) {
                        const nonEmptyRows = rows?.controls.filter(rowCtrl => rowCtrl.value?.trim()) || [];
                        const nonEmptyCols = columns?.controls.filter(colCtrl => colCtrl.value?.trim()) || [];
                        if (nonEmptyRows.length === 0 || nonEmptyCols.length === 0) {
                            this.isQuestionInvalid = true;
                            this.scrollToTarget(`question-${sIdx}-${qIdx}`, 'red');
                        }
                    }
                }
                qIdx++;
            });
            sIdx++;
        });

        if (this.isQuestionInvalid) return;

        if (this.formBuilder.valid) {
            console.log("form is valid");
            const payload = {
                title: this.formBuilder.value.title,
                description: this.formBuilder.value.description,
                deadline: this.formBuilder.value.deadline,
                formSchema: {
                    sections: this.formBuilder.get('sections')?.getRawValue()
                },
                isDraft: this.formBuilder.value.isDraft,
                draftId: this.formBuilder.value.draftId
            };
            
            console.log(payload);
            // For saving template
            if (isTemplate) {
                this.formService.saveAsTemplate(payload).subscribe({
                    next: (response: any) => {
                        this.showTemplateSuccess = true;
                        setTimeout(() => {
                            this.showTemplateSuccess = false;
                            if(shouldNavigate) this.router.navigate(['/form-template']);
                        }, 2000);

                        const formId = response.id;
                        this.formSaved.emit(formId);
                    },
                    error: (error) => console.error(error)
                });
            }

            // For saving changes (edit-form)
            else if (this.formId) {
                this.formService.updateForm(this.formId, payload).subscribe({
                    next: (response: any) => {
                        this.submitSuccess = true;
                        setTimeout(() => {
                            this.submitSuccess = false;
                            if(shouldNavigate) this.router.navigate(['/forms']);
                        }, 2000);
                        const formId = response.id;
                        this.formSaved.emit(formId);
                    },
                    error: (error) => {
                        console.error("Error updating form", error);
                    }
                });
            } 
            // For saving new form 
            else {
                this.formService.addForm(payload).subscribe({
                    next: (response: any) => {
                        console.log(response);
                        this.submitSuccess = true;
                        setTimeout(() => {
                            this.submitSuccess = false;
                            if(shouldNavigate) this.router.navigate(['/forms']);
                        }, 3000);

                        const formId = response.id;
                        this.formSaved.emit(formId);
                    },
                    error: (error) => {
                        console.error("Error updating form", error);
                    }
                });
                
                
            }
             
        } 
        else {  // Move this else inside the main if block
            console.log("Form is invalid");
        }
    }

}