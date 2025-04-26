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
  formId!:number;
  answer: any[] = [];
  submitClicked = false;
  touchedFields: boolean[] = [];
  uploadedFiles: boolean[] = [];
  uploadedFileNames: string[] = [];
  invalidtype: boolean[] = [];
  invalidsize: boolean[] = [];
  ratingValues: number[] = [];
  isSubmitting = false;
  sections: any[] = [];
  formPreviewData: any;
    nextSectionData: { [key: number]: number } = {};
    nextClicked: boolean = false;
    currentSectionIndex!: number;
    dropdownOpen: boolean = false;
    selectedOption: string | null = null;
    loadedForm: any;

  constructor(
    private route: ActivatedRoute,
    private formService: FormService,
    private router: Router,
    private responseService: ResponseService
  ) { }

  ngOnInit() {
    const formIdParam = this.route.snapshot.paramMap.get('id');
    const formId = formIdParam ? Number(formIdParam) : null;

    if(formId !== null){this.formId=formId;}
    this.formService.checkFormAccess(this.formId).subscribe({
      next: (response: string) => {
        if (response === "Access granted") {
          console.log('Access granted! Proceeding with form submission.');
        }
      },
      error: (error) => {  
        if (error.status === 404) {
          this.router.navigate(['/error', 404], { replaceUrl: true });
        } 
        else if (error.status === 403) {
          this.router.navigate(['/error', 403], { replaceUrl: true });
        } 
        else if (error.status === 409) {
          setTimeout(() => {
            this.router.navigate(['/error', 409], { replaceUrl: true });          }, 0); 
        }
        
      }
    });
    this.currentSectionIndex = 0;
    //this.loadForm(this.formId);
    console.log(formIdParam);
    if (formId) {
      this.formService.getFormById(formId).subscribe({
        next: (form) => {
          this.loadedForm=form;
          const schema = typeof form.formSchema === 'string'
            ? JSON.parse(form.formSchema)
            : form.formSchema;
  
          this.formPreviewData = schema;
          this.sections = schema.sections;
          this.sections.forEach((section, index) => {
            this.nextSectionData[index] = section.nextSection;
          });
        },
        error: (err) => {
          console.error('Failed to load form data:', err);
        }
      });
    } else {
      console.warn('No form ID found in route.');
    }
  }

  // private loadForm(formId: number): void {
  //   this.formService.getFormById(formId).subscribe({
  //     next: (form) => {
  //       this.loadedForm = form;
  //       this.formId = formId;
  //       this.initializeFormData();
  //     },
  //     error: (error) => {
  //       console.error('Error loading form:', error);
  //     }
  //   });
  // }

  // private initializeFormData(): void {
  //   try {
  //     this.loadedForm.formSchema = JSON.parse(this.loadedForm.formSchema);
  //     this.initializeAnswers();
  //     this.ratingValues = this.loadedForm.formSchema.fields
  //       .filter((f: any) => f.type === 'rating')
  //       .map(() => 0);
  //   } catch (error) {
  //     console.error('Error parsing form schema:', error);
  //   }
  // }

  // private initializeAnswers(): void {
  //   this.answer = this.loadedForm.formSchema.fields.map((field: any) => {
  //     if (field.type === 'multipleChoiceGrid') {
  //       return new Array(field.rows.length).fill(null);
  //     }
  //     if (field.type === 'checkboxGrid') {
  //       return new Array(field.rows.length).fill(null).map(() => []);
  //     }
  //     return null;
  //   });
  // }

  gotoNextSection() {
          this.currentSectionIndex = this.nextSectionData[this.currentSectionIndex];
          window.scroll(0,0);
          this.nextClicked = true;
      }
  
      gotoPreviousSection() {
          if(this.currentSectionIndex > 0) {
              this.currentSectionIndex--;
              window.scroll(0,0);
          }
  
      }
  
      toggleCheckbox(label: string, question: any, index:number) {
          const idx = question.answer.indexOf(label);
          if (idx === -1) {
            question.answer.push(label);
          } else {
            question.answer.splice(idx, 1);
          }
        }
  
      onAnswerSelected(option: any, question: any) {
          if (!question.sectionBasedonAnswer) return;
  
          const gotoSectionIndex = option.goToSection;
          if (gotoSectionIndex !== undefined && gotoSectionIndex !== -1) {
              this.nextSectionData[this.currentSectionIndex] = gotoSectionIndex;
              console.log(`Setting next section to ${gotoSectionIndex} based on option ${option.label}`);
          }
          if(gotoSectionIndex === -1) {
              console.log("submit form section");
          }
      }
  
      confirmClearForm(formRef: any) {
          Swal.fire({
              title: 'Are you sure?',
              text: 'This will erase all answers from your form, and cannot be undone',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Yes, clear form',
          }).then((result) => {
              if (result.isConfirmed) {
                  this.clearForm(formRef);
              }
          });
        }
  
      clearForm(formRef: any) {
          formRef.resetForm();
      }
  updateCheckbox(index: number, option: string, event: any) {
    if (!this.answer[index]) {
      this.answer[index] = [];
    }
    if (event.target.checked) {
      this.answer[index].push(option);
    } else {
      this.answer[index] = this.answer[index].filter((item: string) => item !== option);
    }
  }

  isGridQuestionInvalid(i: number, question: any): boolean {
    if (!question || !question.required || !Array.isArray(this.answer[i])) return false;
    return (this.submitClicked || this.touchedFields[i]) && this.answer[i].some((val: any) => val === null);
  }

  isCheckboxGridInvalid(i: number, question: any): boolean {
    if (!question || !question.required || !Array.isArray(this.answer[i])) return false;
    return (this.submitClicked || this.touchedFields[i]) &&
           this.answer[i].some((row: any) => !Array.isArray(row) || row.length === 0);
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
        this.answer[index] = fileUrl;
      }
    });
  }

  onDeleteFile(index: number): void {
    this.uploadedFiles[index] = false;
    this.uploadedFileNames[index] = '';
    const fileUrl = this.answer[index];
    this.answer[index] = '';
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
    this.answer[questionIndex] = value;
  }

  ratingStars(n: number): number[] {
    return Array(n).fill(0);
  }

  // async submitForm() {
  //   this.submitClicked = true;
  //   if (this.isFormInvalid()) return;

  //   this.isSubmitting = true;
  //   try {
  //     const response = await this.prepareAndSubmitResponse();
  //     this.handleSuccess(response);
  //   } catch (error) {
  //     this.handleError(error);
  //   } finally {
  //     this.isSubmitting = false;
  //   }
  // }

  // private isFormInvalid(): boolean {
  //   return this.loadedForm.formSchema.fields.some((question: any, index: number) =>
  //     this.isQuestionInvalid(question, index)
  //   );
  // }

  // private isQuestionInvalid(question: any, index: number): boolean {
  //   if (!question.required) return false;
  //   const answer = this.answer[index];
  //   if (question.type === 'multipleChoiceGrid') {
  //     return answer.some((val: any) => val === null);
  //   }
  //   if (question.type === 'checkboxGrid') {
  //     return answer.some((row: any) => !Array.isArray(row) || row.length === 0);
  //   }
  //   return !answer && answer !== false;
  // }

  // private async prepareAndSubmitResponse(): Promise<any> {
  //   const responseData = this.prepareResponseData();
  //   return this.responseService.submitResponse(this.formId, responseData).toPromise();
  // }

  // private prepareResponseData(): any {
  //   return this.loadedForm.formSchema.fields.reduce((acc: any, field: any, index: number) => {
  //     acc[field.label] = this.answer[index];
  //     return acc;
  //   }, {});
  // }

  // private handleSuccess(response: any): void {
  //   Swal.fire({
  //     icon: 'success',
  //     title: 'Form Submitted!',
  //     text: 'Your responses have been recorded successfully.',
  //     confirmButtonColor: '#4CAF50',
  //   });
  //   this.router.navigate(['/assigned-forms'], {
  //     state: { formTitle: this.loadedForm.title }
  //   });
  // }

  // private handleError(error: any): void {
  //   console.error('Submission error:', error);
  //   Swal.fire({
  //     icon: 'error',
  //     title: 'Submission Failed',
  //     text: 'There was an error submitting your form. Please try again.',
  //     confirmButtonColor: '#d33',
  //   });
  // }

  markAsTouched(index: number) {
    this.touchedFields[index] = true;
  }

  toggleCheckboxgrid(questionIndex: number, rowIndex: number, column: string) {
    const current: string[] = this.answer[questionIndex][rowIndex] || [];
    this.answer[questionIndex][rowIndex] = current.includes(column)
      ? current.filter(item => item !== column)
      : [...current, column];
  }
  onSubmit(){
    console.log("Submit button clicked");
    //this.submitForm();

    const mappedResponse = this.sections.map((section: any, sectionIndex: number) => {
      const responses = section.questions.map((question: any, questionIndex: number) => {
        const answer = this.answer?.[sectionIndex]?.[questionIndex];
        return {
          question: question.label,
          answer: answer !== undefined && answer !== null
            ? Array.isArray(answer) ? answer : answer.toString()
            : ''
        };
      });
      return {
        section: section.title,
        responses
      };
    });
    console.log("previewdata", this.formPreviewData);
    this.responseService.submitResponse(this.formId, JSON.stringify(mappedResponse)).subscribe({
      next: (res) => console.log('Response submitted successfully', res),
      error: (err) => console.error('Submission error:', err)
    });
    this.router.navigate(['/submit',this.loadedForm.title], { replaceUrl: true });
    console.log("Submit button clicked2");

  }
}