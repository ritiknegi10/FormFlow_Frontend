import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { FormService } from '../../services/form.service';
import { Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.scss']
})
export class CreateFormComponent implements OnInit {
  formId!: number;
  formBuilder: FormGroup;
  submitClicked = false;
  submitSuccess = false;
  ratingOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  singleOption = false;
  isQuestionInvalid: boolean = false;

  constructor(private fb: FormBuilder, private formService: FormService, private router: Router) {
    this.formBuilder = this.fb.group({
      title: '',
      description: '',
      questions: this.fb.array([])
    });
  }

  ngOnInit() {
    // If you are editing an existing form, fetch the data
    window.scrollTo(0, 0);
    const urlParts = this.router.url.split('/');
    if (urlParts[2] === 'edit' && urlParts[3]) {
      this.formId = parseInt(urlParts[3]);
      this.formService.getFormById(this.formId).subscribe(form => {
        this.formBuilder.patchValue({
          title: form.title,
          description: form.description,
        });
        const questionsArray = form.formSchema.fields.map((field: any) => {
          return this.fb.group({
            questionText: field.label,
            type: field.type,
            required: field.required,
            options: this.fb.array(field.options || []),
            rating: field.rating || 5,
            startValue: [field.startValue ?? 0],   
            endValue: [field.endValue ?? 5],   
            gridRows: this.fb.array(field.gridRows || []),
            gridColumns: this.fb.array(field.gridColumns || [])    
          });
        });
        this.formBuilder.setControl('questions', this.fb.array(questionsArray));
      });
    } else {
      this.addQuestion();
    }
  }

  get questions(): FormArray {
    return this.formBuilder.get('questions') as FormArray;
  }

  getTitleControl() {
    return this.formBuilder.get('title');
  }

  getQuestionTextControl(question: any) {
    return question.get('questionText');
  }

  addQuestion() {
    this.submitClicked = false;
    const questionGroup = this.fb.group({
      questionText: [''],
      type: ['shortText'],
      options: this.fb.array([]),
      rating: [5],
      required: false,
      startValue:[0],
      endValue:[5],
      rows: this.fb.array([]),     
      columns: this.fb.array([]) 

    });

    questionGroup.get('type')?.valueChanges.subscribe(type => {
      this.submitClicked = false;
      if (type === 'multipleChoice' || type === 'checkboxes' || type === 'dropdown') {
        const options = questionGroup.get('options') as FormArray;
        if (options.length === 0) {
          options.push(new FormControl(''));
        }
      }
      if (type === 'multipleChoiceGrid' || type === 'checkboxGrid') {
        const rows = questionGroup.get('rows') as FormArray;
        const columns = questionGroup.get('columns') as FormArray;
    
        if (rows.length === 0) rows.push(new FormControl(''));
        if (columns.length === 0) columns.push(new FormControl(''));
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
      options: this.fb.array(originalQuestion.options ? originalQuestion.options.map((opt: any) => this.fb.control(opt)) : []),
      rating: [originalQuestion.rating],
      startValue: [originalQuestion.startValue ?? 0],  
      endValue: [originalQuestion.endValue ?? 5],
      rows: this.fb.array(originalQuestion.rows ? originalQuestion.rows.map((row: any) => this.fb.control(row)) : []),
      columns: this.fb.array(originalQuestion.columns ? originalQuestion.columns.map((col: any) => this.fb.control(col)) : [])
    });
    this.questions.insert(index + 1, duplicatedQuestion);
  }

  
  addGridRow(index: number) {
    const question = this.questions.at(index) as FormGroup;
    let rows = question.get('rows') as FormArray;
  
    if (!rows) {
      rows = this.fb.array([]);
      question.addControl('rows', rows);
    }
  
    rows.push(this.fb.control(''));
  }
  
  addGridColumn(index: number) {
    const question = this.questions.at(index) as FormGroup;
    let cols = question.get('columns') as FormArray;
  
    if (!cols) {
      cols = this.fb.array([]);
      question.addControl('columns', cols);
    }
  
    cols.push(this.fb.control(''));
  }
  
  
  removeGridRow(questionIndex: number, rowIndex: number) {
    const rows = this.getRows(this.questions.at(questionIndex));
    rows.removeAt(rowIndex);
  }
  
  removeGridColumn(questionIndex: number, colIndex: number) {
    const columns = this.getColumns(this.questions.at(questionIndex));
    columns.removeAt(colIndex);
  }
  
  getRows(question: AbstractControl): FormArray {
    return question.get('rows') as FormArray;
  }
  
  getColumns(question: AbstractControl): FormArray {
    return question.get('columns') as FormArray;
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
  getNonEmptyGridItems(array: FormArray): number {
    return array.controls.filter(control => control.value?.trim()).length;
  }
  
  hasEmptyGridItem(array: FormArray): boolean {
    return array.controls.some(control => !control.value?.trim());
  }
 

  onSubmit() {
    this.submitClicked = true;
    if (!this.getTitleControl()?.value.trim()) return;
    
    this.isQuestionInvalid = false;
    this.singleOption = false;
    let isOptionInvalid = false;

    this.questions.controls.forEach((control) => {
      if (control instanceof FormGroup) {
        const ques = control;
        const optionsArray = this.getOptions(ques);
        const rowsArray = this.getRows(ques);
        const colsArray = this.getColumns(ques);

        if (!this.getQuestionTextControl(ques)?.value.trim()) this.isQuestionInvalid = true;

        optionsArray.controls.forEach(optionControl => {
          if (!optionControl.value.trim()) isOptionInvalid = true;
          else if (((ques.get('type')?.value === "multipleChoice") && (optionsArray.controls.length < 2)) ||
            (ques.get('type')?.value === "dropdown") && (optionsArray.controls.length < 2))
            this.singleOption = true;
        });

        if (ques.get('type')?.value === "multipleChoiceGrid" || ques.get('type')?.value === "checkboxGrid") {
          let nonEmptyRows = 0;
          let nonEmptyCols = 0;
    
          rowsArray.controls.forEach(rowControl => {
            if (rowControl.value.trim()) nonEmptyRows++;
          });
    
          colsArray.controls.forEach(colControl => {
            if (colControl.value.trim()) nonEmptyCols++;
          });
    
          if (nonEmptyRows === 0 || nonEmptyCols === 0) {
            this.isQuestionInvalid = true;
          }
        }
      }
    });

    if (this.isQuestionInvalid || isOptionInvalid || this.singleOption) return;
    

    if (this.formBuilder.valid) {
      if (this.formId) {
        this.formService.updateForm(this.formId, this.formBuilder.value).subscribe({
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
        this.formService.addForm(this.formBuilder.value);
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.questions.controls, event.previousIndex, event.currentIndex);
    this.questions.updateValueAndValidity();
  }
}