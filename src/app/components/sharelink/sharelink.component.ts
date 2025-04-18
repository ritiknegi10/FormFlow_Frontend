import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { ResponseService } from '../../services/response.service';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-sharelink',
  templateUrl: './sharelink.component.html',
  styleUrls: ['./sharelink.component.scss']
})
export class SharelinkComponent implements OnInit {
  formId!: number;
  formData: any;
  answers: any[] = [];
  submitClicked = false;
  touchedFields: boolean[] = [];
  uploadedFiles: boolean[] = [];
  uploadedFileNames: string[] = [];
  invalidtype: boolean[] = [];
  invalidsize: boolean[] = [];
  ratingValues: number[] = [];
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private formService: FormService,
    private router: Router,
    private responseService: ResponseService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const formId = Number(params.get('id'));
      if (formId) {
        this.loadForm(formId);
      }
    });
  }

  private loadForm(formId: number): void {
    this.formService.getFormById(formId).subscribe({
      next: (form) => {
        this.formData = form;
        this.formId = formId;
        this.initializeFormData();
      },
      error: (error) => {
        console.error('Error loading form:', error);
        this.router.navigate(['/']);
      }
    });
  }

  private initializeFormData(): void {
    try {
      this.formData.formSchema = JSON.parse(this.formData.formSchema);
      this.initializeAnswers();
      this.ratingValues = this.formData.formSchema.fields
        .filter((f: any) => f.type === 'rating')
        .map(() => 0);
    } catch (error) {
      console.error('Error parsing form schema:', error);
      this.router.navigate(['/']);
    }
  }

  private initializeAnswers(): void {
    this.answers = this.formData.formSchema.fields.map((field: any) => {
      if (field.type === 'multipleChoiceGrid') {
        return new Array(field.rows.length).fill(null);
      }
      if (field.type === 'checkboxGrid') {
        return new Array(field.rows.length).fill(null).map(() => []);
      }
      return null;
    });
  }

  updateCheckbox(index: number, option: string, event: any) {
    if (!this.answers[index]) {
      this.answers[index] = [];
    }
    if (event.target.checked) {
      this.answers[index].push(option);
    } else {
      this.answers[index] = this.answers[index].filter((item: string) => item !== option);
    }
  }

  isGridQuestionInvalid(i: number, question: any): boolean {
    if (!question || !question.required || !Array.isArray(this.answers[i])) return false;
    return (this.submitClicked || this.touchedFields[i]) && this.answers[i].some((val: any) => val === null);
  }

  isCheckboxGridInvalid(i: number, question: any): boolean {
    if (!question || !question.required || !Array.isArray(this.answers[i])) return false;
    return (this.submitClicked || this.touchedFields[i]) &&
           this.answers[i].some((row: any) => !Array.isArray(row) || row.length === 0);
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.invalidtype[index] = true;
      input.value = '';
      return;
    }

    if (file.size > maxSize) {
      this.invalidsize[index] = true;
      input.value = '';
      return;
    }

    this.invalidsize[index] = false;
    this.invalidtype[index] = false;

    this.uploadedFileNames[index] = file.name;
    this.uploadedFiles[index] = true;

    this.formService.uploadFile(file).subscribe({
      next: (fileUrl: string) => {
        this.answers[index] = fileUrl;
      }
    });
  }

  onDeleteFile(index: number): void {
    this.uploadedFiles[index] = false;
    this.uploadedFileNames[index] = '';
    const fileUrl = this.answers[index];
    this.answers[index] = '';
    this.formService.deleteFile(fileUrl).subscribe({
      next: () => {
        console.log('File deleted from backend');
      },
      error: (err) => {
        console.error('Error deleting file:', err);
      }
    });
  }

  updateRatingValue(questionIndex: number, value: number) {
    this.ratingValues[questionIndex] = value;
    this.answers[questionIndex] = value;
  }

  ratingStars(n: number): number[] {
    return Array(n).fill(0);
  }

  async submitForm() {
    this.submitClicked = true;
    if (this.isFormInvalid()) return;

    this.isSubmitting = true;
    try {
      const response = await this.prepareAndSubmitResponse();
      this.handleSuccess(response);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private isFormInvalid(): boolean {
    return this.formData.formSchema.fields.some((question: any, index: number) =>
      this.isQuestionInvalid(question, index)
    );
  }

  private isQuestionInvalid(question: any, index: number): boolean {
    if (!question.required) return false;
    const answer = this.answers[index];
    if (question.type === 'multipleChoiceGrid') {
      return answer.some((val: any) => val === null);
    }
    if (question.type === 'checkboxGrid') {
      return answer.some((row: any) => !Array.isArray(row) || row.length === 0);
    }
    return !answer && answer !== false;
  }

  private async prepareAndSubmitResponse(): Promise<any> {
    const responseData = this.prepareResponseData();
    return this.responseService.submitResponse(this.formId, responseData).toPromise();
  }

  private prepareResponseData(): any {
    return this.formData.formSchema.fields.reduce((acc: any, field: any, index: number) => {
      acc[field.label] = this.answers[index];
      return acc;
    }, {});
  }

  private handleSuccess(response: any): void {
    Swal.fire({
      icon: 'success',
      title: 'Form Submitted!',
      text: 'Your responses have been recorded successfully.',
      confirmButtonColor: '#4CAF50',
    });
    this.router.navigate(['/assigned-forms'], {
      state: { formTitle: this.formData.title }
    });
  }

  private handleError(error: any): void {
    console.error('Submission error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Submission Failed',
      text: 'There was an error submitting your form. Please try again.',
      confirmButtonColor: '#d33',
    });
  }

  markAsTouched(index: number) {
    this.touchedFields[index] = true;
  }

  toggleCheckbox(questionIndex: number, rowIndex: number, column: string) {
    const current: string[] = this.answers[questionIndex][rowIndex] || [];
    this.answers[questionIndex][rowIndex] = current.includes(column)
      ? current.filter(item => item !== column)
      : [...current, column];
  }
}