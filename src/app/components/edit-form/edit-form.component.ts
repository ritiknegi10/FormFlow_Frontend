import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { FormService } from '../../services/form.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AbstractControl } from '@angular/forms';


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
  ratingOptions: number[] = [3, 4, 5, 6, 7, 8, 9, 10];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private formService: FormService
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.route.paramMap.subscribe(params => {
      this.formIndex = Number(params.get('id'));
      this.formService.getFormById(this.formIndex).subscribe(formData => {
        const formSchema = JSON.parse(formData.formSchema);
        const questions = formSchema.fields;
        console.log("this is form schema",formSchema);
        this.form = this.fb.group({
          title: new FormControl(formData.title || ''),
          description: new FormControl(formData.description || ''),
          questions: this.fb.array(questions.map((q: any, index:number) => this.createQuestionGroup(q, index)))
        });
        //console.log(this.form);
      });
    });
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.questions.controls, event.previousIndex, event.currentIndex);
    this.questions.updateValueAndValidity();
  }

  createQuestionGroup(question: any, index: number): FormGroup {
    return this.fb.group({
      questionText: new FormControl(question.label || ''),
      type: new FormControl(question.type || 'shortText'),
      required: new FormControl(question.required || false),
      options: this.fb.array(question.options ? question.options.map((opt: any) => new FormControl(opt)) : []),
      rating: new FormControl(question.rating || 5),
      startValue: new FormControl(question.startValue ?? 0),
      endValue: new FormControl(question.endValue ?? 5),
      rows: this.fb.array(question.rows ? question.rows.map((r: any) => new FormControl(r)) : []),
      columns: this.fb.array(question.columns ? question.columns.map((c: any) => new FormControl(c)) : []),

    });
  }

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  getTitleControl() {
    return this.form.get('title');
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
      rating: ['5'],
      required: false,
      startValue: new FormControl(0),
      endValue: new FormControl(5),
      rows: this.fb.array([]),
      columns: this.fb.array([]),

    });

    questionGroup.get('type')?.valueChanges.subscribe(type => {
      this.submitClicked = true;
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
      startValue: new FormControl(originalQuestion.startValue ?? 0),
      endValue: new FormControl(originalQuestion.endValue ?? 5),
      rows: this.fb.array(
        originalQuestion.rows ? originalQuestion.rows.map((row: any) => this.fb.control(row)) : []
      ),
      columns: this.fb.array(
        originalQuestion.columns ? originalQuestion.columns.map((col: any) => this.fb.control(col)) : []
      )
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

  getRows(question: AbstractControl): FormArray {
    return question.get('rows') as FormArray;
  }
  
  getColumns(question: AbstractControl): FormArray {
    return question.get('columns') as FormArray;
  }
  
  addRow(index: number) {
    const question = this.questions.at(index);
    const rows = this.getRows(question);
    rows.push(this.fb.control(''));
  }
  
  addColumn(index: number) {
    const question = this.questions.at(index);
    const cols = this.getColumns(question);
    cols.push(this.fb.control(''));
  }
  
  removeRow(questionIndex: number, rowIndex: number) {
    const rows = this.getRows(this.questions.at(questionIndex));
    rows.removeAt(rowIndex);
  }
  
  removeColumn(questionIndex: number, colIndex: number) {
    const cols = this.getColumns(this.questions.at(questionIndex));
    cols.removeAt(colIndex);
  }
  
  

  cancelEditform() {
    this.router.navigate(['/forms']);
    window.scrollTo(0, 0);
  }
  
  saveChanges() {
    this.submitClicked = true;

    if (!this.getTitleControl()?.value.trim()) return;

    this.isQuestionInvalid = false;
    this.singleOption = false;
    let isOptionInvalid = false;

    this.questions.controls.forEach((control) => {
      if (control instanceof FormGroup) {
        const ques = control;
        const optionsArray = this.getOptions(ques);

        if (!this.getQuestionTextControl(ques)?.value.trim()) this.isQuestionInvalid = true;

        optionsArray.controls.forEach(optionControl => {
          if (!optionControl.value.trim()) isOptionInvalid = true;
          else if (((ques.get('type')?.value === "multipleChoice") && (optionsArray.controls.length < 2)) ||
            (ques.get('type')?.value === "dropdown") && (optionsArray.controls.length < 2))
            this.singleOption = true;
        });
      }
    });

    if (this.isQuestionInvalid || isOptionInvalid || this.singleOption) return;

    const updatedForm = {
      ...this.form.value,
      questions: this.form.value.questions.map((q: any) => ({
        questionText: q.questionText || '',
        type: q.type || 'text',
        required: q.required,
        options: q.options ? q.options.map((opt: any) => opt) : [],
        rating: q.rating,
        startValue: q.startValue,
        endValue: q.endValue,
        rows: q.rows ? q.rows.map((row: any) => row) : [],
        columns: q.columns ? q.columns.map((col: any) => col) : [],
      }))
    };

    this.formService.updateForm(this.formIndex, updatedForm).subscribe(() => {
      this.router.navigate(['/forms']);
      window.scrollTo(0, 0);
      this.submitClicked = false;
    });
  }
}