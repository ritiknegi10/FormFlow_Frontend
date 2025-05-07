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
    loadedForm: any;
    formData: any;
    sections: any[] = [];
    currentSectionIndex!: number;
    sectionHistory: number[] = [];
    nextSectionData: { [key: number]: number } = {};
    answer: { [sectionIndex: number]: { [questionIndex: number]: any } } = {};
    otherInputValues: { [sectionIndex: number]: { [questionIndex: number]: any } } = {};
    validationErrors: { [sectionIndex: number]: { [questionIndex: number]: any } } = {};
    selectedOption: string | null = null;

    touchedFields: boolean[] = [];
    uploadedFiles: boolean[] = [];
    uploadedFileNames: string[] = [];
    invalidtype: boolean[] = [];
    invalidsize: boolean[] = [];
    ratingValues: number[] = [];
    dropdownOpen: boolean[] = [];

  
    allowAnonymous: boolean = true;
    anonymousToggle:boolean= false;
    submitClicked = false;
    isSubmitting = false;
    nextClicked= false;
    
    constructor(
        private route: ActivatedRoute,
        private formService: FormService,
        private router: Router,
        private responseService: ResponseService
    ) {}

    ngOnInit() {
        const formIdParam = this.route.snapshot.paramMap.get('id');
        const formId = formIdParam ? Number(formIdParam) : null;

        
        if(formId !== null) this.formId = formId;

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
                this.router.navigate(['/error', 409], { replaceUrl: true });
                }, 0); 
            }
            else if (error.status === 410) {
                setTimeout(() => {
                this.formService.timestamp=true;
                this.onSubmit();
                }, 0); 
            }
            }
        });

        this.currentSectionIndex = 0;
        
        if (formId) {
            this.formService.getFormById(formId).subscribe({
                next: (form) => {
                    this.loadedForm = form;
                    
                    const formSchema = typeof form.formSchema === 'string' ? JSON.parse(form.formSchema) : form.formSchema;
                    this.formData = formSchema;
                    this.sections = formSchema.sections;

                    this.sections.forEach((section: any, sIdx: number) => {
                        this.nextSectionData[sIdx] = section.nextSection;
                        this.answer[sIdx] = {};
                        this.otherInputValues[sIdx] = {};

                        section.questions.forEach((question: any, qIdx: number) => {
                            this.answer[sIdx][qIdx] = this.getAnswerValueType(question.type);
                        });
                        if (!this.validationErrors[sIdx]) this.validationErrors[sIdx] = {};
                    });
                },
                error: (err) => {
                    console.error('Failed to load form data:', err);
                }
            });
        } 
        else {
            console.warn('No form ID found in route.');
        }
    }

    getAnswerValueType(questionType: string) {
        switch (questionType) {
            case 'shortText':
            case 'paragraph':
            case 'multipleChoice':
            case 'dropdown':
            case 'date':
            case 'time':
              return ''; // empty string for text-like inputs
            
            case 'checkboxes':
              return []; // array for multi-selections
            
            case 'multipleChoiceGrid':
            case 'checkboxGrid':
              return {}; // object where rows/columns selected can be saved
            
            case 'linearScale':
            case 'rating':
              return null; // number later
            
            case 'file':
              return null; // file  
            
            default:
              return null;
          }
    }

    onAnonymousToggleChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      this.anonymousToggle = input.checked;
      console.log('Anonymous toggle:', this.anonymousToggle);
    }
    
  
    fetchFormDetails() {
      this.formService.getFormSubmissionDetails(this.formId.toString()).subscribe({
        next: (response: any) => {
          this.allowAnonymous = response.allowAnonymous ?? false; 
        },
        error: (err) => {
          console.error('Error fetching form details:', err);
        }
      });
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
        if(this.validateCurrentSection(this.currentSectionIndex)) {
            this.sectionHistory.push(this.currentSectionIndex);
            this.currentSectionIndex = this.nextSectionData[this.currentSectionIndex];
            if (!this.validationErrors[this.currentSectionIndex]) this.validationErrors[this.currentSectionIndex] = {}; 
            window.scroll(0,0);
            this.nextClicked = true;
        }
        else {
            const section = this.sections[this.currentSectionIndex];
      
            section.questions.forEach((question: any, questionIndex: number) => {
                const ques = document.getElementById(`question-${this.currentSectionIndex}-${questionIndex}`);
                if(ques && this.validationErrors[this.currentSectionIndex][questionIndex]) {
                    ques.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    }

    gotoPreviousSection() {
        if (this.sectionHistory.length > 0) {
            this.currentSectionIndex = this.sectionHistory.pop()!;
            if (!this.validationErrors[this.currentSectionIndex]) this.validationErrors[this.currentSectionIndex] = {}; 
            window.scroll(0, 0);
        }
    }

    getRatingRange(question: any): number[] {
        const range: number[] = [];
        for(let i = 1; i <= question.rating; i++) range.push(i);
        return range;
    }

    getScaleRange(question: any): number[] {
        const range: number[] = [];
        for(let i = question.startValue; i <= question.endValue; i++) range.push(i);
        return range;
    }

    onCheckboxChange(event: any, sIdx: number, qIdx: number) {
        const value = event.target.value;
        if (event.target.checked) {
            this.answer[sIdx][qIdx].push(value);
        } else {
            const index = this.answer[sIdx][qIdx].indexOf(value);
            if (index !== -1) {
                this.answer[sIdx][qIdx].splice(index, 1);
            }
        }
    }
    
    onOtherInputChanged(event: any, sIdx: number, qIdx: number, checkInputId: string) {

        const inputText = (event.target as HTMLInputElement).value;
        const checkInput = document.getElementById(checkInputId) as HTMLInputElement;
        if (checkInput) checkInput.checked = true;

        if (!this.otherInputValues[sIdx]) this.otherInputValues[sIdx] = {};
        this.otherInputValues[sIdx][qIdx] = inputText;

        if (!this.answer[sIdx]) this.answer[sIdx] = {};

        // for checkboxes
        if (Array.isArray(this.answer[sIdx][qIdx])) {
            if (!this.answer[sIdx][qIdx].includes('Other')) {
                this.answer[sIdx][qIdx].push('Other');
            }
        }

        // for multipleChoice
        else this.answer[sIdx][qIdx] = 'Other';

        
    }

    selectDropdownOption(option: any, sIdx: number, qIdx: number) {
        this.answer[sIdx][qIdx] = option.label;
        this.dropdownOpen[qIdx] = false;
        this.onOptionSelected(option, this.sections[sIdx].questions[qIdx]);
    }

    onOptionSelected(option: any, question: any) {
        if (!question.sectionBasedonAnswer) return;

        const gotoSectionIndex = option.goToSection;
        if (gotoSectionIndex !== undefined && gotoSectionIndex !== -1) {
            this.nextSectionData[this.currentSectionIndex] = gotoSectionIndex;
            console.log(`Setting next section to ${gotoSectionIndex} based on option ${option.label}`);
        }
        if(gotoSectionIndex === -1)
            console.log("submit form section");
    }

    onCheckboxGridChange(event: any, sIdx: number, qIdx: number, row: string, column: string) {
        const checkbox = event.target as HTMLInputElement;
  
        if (!this.answer[sIdx][qIdx]) {
            this.answer[sIdx][qIdx] = {};
        }
        
        if (!this.answer[sIdx][qIdx][row]) {
            this.answer[sIdx][qIdx][row] = [];
        }

        if (checkbox.checked) {
            this.answer[sIdx][qIdx][row].push(column);
        } else {
            this.answer[sIdx][qIdx][row] = this.answer[sIdx][qIdx][row].filter((col: string) => col !== column);
        }
    }

    onAnswer(sectionIndex: number, questionIndex: number) {
        if (this.validationErrors?.[sectionIndex]?.[questionIndex]) {
            const question = this.sections[sectionIndex].questions[questionIndex];
            let answer = this.answer?.[sectionIndex]?.[questionIndex];
            const otherInput = this.otherInputValues?.[sectionIndex]?.[questionIndex];

            let isAnswered = true;

            if(question.type === 'multipleChoice') {
                answer = answer?.toString() ?? '';
                if (!answer.trim() || (answer === 'Other' && (!otherInput || !otherInput.trim()))) isAnswered = false;
            }
            
            else if (question.type === 'checkboxes') {
                const isArray = Array.isArray(answer);
                
                const hasValidSelection = isArray && answer.length > 0 && answer.some((opt: any) => opt.toString().trim() !== '');
                const hasOtherValid = isArray && answer.includes('Other') ? (otherInput && otherInput.trim()) : true;
        
                if (!hasValidSelection || !hasOtherValid) isAnswered = false;
            }

            else if (question.type === 'multipleChoiceGrid' || question.type === 'checkboxGrid') {
                const rows = question.rows || [];
                const isAnswerObject = answer && typeof answer === 'object' && !Array.isArray(answer);
        
                const allRowsAnswered = isAnswerObject && rows.every((row: string) => {
                    const val = answer[row];

                    if (question.type === 'checkboxGrid') return Array.isArray(val) && val.length > 0;
                    else return val !== undefined && val !== null && val.toString().trim() !== ''; 
                });
        
                if (!allRowsAnswered) isAnswered = false;
            }
            else {
                answer = answer?.toString() ?? '';
                if (!answer.trim()) isAnswered = false;
            }

            if (isAnswered) this.validationErrors[sectionIndex][questionIndex] = false;
            
        }
    }

    showClearSelection(question: any, sIdx: number, qIdx: number) {
        const ans = this.answer[sIdx]?.[qIdx];
        if (!question || ans == null) return false;

        if (question.type === 'multipleChoiceGrid' && typeof ans === 'object') {
            return Object.values(ans).some(value => value);
        }
        if ((question.type === 'multipleChoice' ||
            question.type === 'dropdown' ||
            question.type === 'linearScale' ||
            question.type === 'rating') && ans) {
            return true;
        }
          
        return false;
    }

    clearSelection(sIdx: number, qIdx: number, question: any) {
        if (!this.answer[sIdx]) return;
      
        if (question.type === 'multipleChoiceGrid') {
            this.answer[sIdx][qIdx] = {}; 
        } else {
            this.answer[sIdx][qIdx] = null;
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
            if (result.isConfirmed)
                this.clearForm(formRef);
        });
    }

    clearForm(formRef: any) {
        formRef.resetForm();
        this.answer = {};
        this.otherInputValues = {};
        this.validationErrors = {};

        this.sections.forEach((section: any, sectionIndex: number) => {
            
            this.answer[sectionIndex] = {};
            this.otherInputValues[sectionIndex] = {};
            this.validationErrors[sectionIndex] = {};

            section.questions.forEach((question: any, questionIndex: number) => {

                this.otherInputValues[sectionIndex][questionIndex] = '';
                this.validationErrors[sectionIndex][questionIndex] = false;

                if (question.type === 'checkboxes') {
                    this.answer[sectionIndex][questionIndex] = []; 
                } else if (question.type === 'multipleChoiceGrid' || question.type === 'checkboxGrid') {
                    const rowAnswers: any = {};
                    question.rows.forEach((row: string) => {
                        if(question.type == 'multipleChoiceGrid') rowAnswers[row] = ''; 
                        else rowAnswers[row] = [];
                    });
                    this.answer[sectionIndex][questionIndex] = rowAnswers;
                } else {
                    this.answer[sectionIndex][questionIndex] = ''; 
                }
            });
        });
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

    // onDeleteFile(index: number): void {
    //     this.uploadedFiles[index] = false;
    //     this.uploadedFileNames[index] = '';
    //     const fileUrl = this.answer[index];
    //     this.answer[index] = '';
    //     this.formService.deleteFile(fileUrl).subscribe({
    //         next: () => {
    //             console.log('File deleted from backend');
    //         },
    //         error: (err) => {
    //             console.error('Error deleting file:', err);
    //         }
    //     });
    // }

    
    markAsTouched(index: number) {
        this.touchedFields[index] = true;
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

    validateCurrentSection(sectionIndex: number): boolean {
        let isValid = true;
        if (!this.validationErrors[sectionIndex]) this.validationErrors[sectionIndex] = {};
      
        const section = this.sections[sectionIndex];
        section.questions.forEach((question: any, questionIndex: number) => {
            if (question.required) {
                let answer = this.answer?.[sectionIndex]?.[questionIndex];
                const otherInput = this.otherInputValues?.[sectionIndex]?.[questionIndex];
                
                if(question.type === 'multipleChoice') {
                    answer = answer?.toString() ?? '';

                    if (!answer.trim() || (answer === 'Other' && (!otherInput || !otherInput.trim()))) {
                        isValid = false;
                        this.validationErrors[sectionIndex][questionIndex] = true;
                    }
                    else this.validationErrors[sectionIndex][questionIndex] = false;
                }
                
                else if (question.type === 'checkboxes') {
                    const isArray = Array.isArray(answer);
                    
                    const hasValidSelection = isArray && answer.length > 0 && answer.some((opt: any) => opt.toString().trim() !== '');
                    const hasOtherValid = isArray && answer.includes('Other') ? (otherInput && otherInput.trim()) : true;
            
                    if (!hasValidSelection || !hasOtherValid) {
                        isValid = false;
                        this.validationErrors[sectionIndex][questionIndex] = true;
                    }
                    else this.validationErrors[sectionIndex][questionIndex] = false;
                }

                else if (question.type === 'multipleChoiceGrid' || question.type === 'checkboxGrid') {
                    const rows = question.rows || [];
                    const isAnswerObject = answer && typeof answer === 'object' && !Array.isArray(answer);
            
                    const allRowsAnswered = isAnswerObject && rows.every((row: string) => {
                        const val = answer[row];

                        if (question.type === 'checkboxGrid') return Array.isArray(val) && val.length > 0;
                        else return val !== undefined && val !== null && val.toString().trim() !== ''; 
                    });
            
                    if (!allRowsAnswered) {
                        isValid = false;
                        this.validationErrors[sectionIndex][questionIndex] = true;
                    } else {
                        this.validationErrors[sectionIndex][questionIndex] = false;
                    }
                }
                else {
                    answer = answer?.toString() ?? '';

                    if (!answer.trim()) {
                        isValid = false;
                        this.validationErrors[sectionIndex][questionIndex] = true;
                    }
                    else this.validationErrors[sectionIndex][questionIndex] = false;
                }
                
            }
        });
      
        return isValid;
    }
      
    onSubmit() {
        console.log("Submit button clicked");
        console.log("current section index : ", this.currentSectionIndex);

        // --validate last section
        if(!this.validateCurrentSection(this.currentSectionIndex)){
            const section = this.sections[this.currentSectionIndex];
            section.questions.forEach((question: any, index: number) => {
                const ques = document.getElementById(`question-${this.currentSectionIndex}-${index}`);
                if(ques && this.validationErrors[this.currentSectionIndex][index]){
                    ques.scrollIntoView({behavior: 'smooth', block: 'center'});
                }
            });
            console.warn('Validation failed. Not submitting.');
            return; // don't proceed if validation fails
        }

        const mappedResponse = this.sections.map((section: any, sectionIndex: number) => {

            const responses = section.questions.map((question: any, questionIndex: number) => {
                let answer = this.answer?.[sectionIndex]?.[questionIndex];
                const otherText = this.otherInputValues?.[sectionIndex]?.[questionIndex];

                if (Array.isArray(answer) && otherText) {
                    answer = answer.map((ans: string) => ans === 'Other' ? otherText : ans);
                } else {
                    if (answer === 'Other' && otherText) {
                        answer = otherText;
                    }
                }
                
                return {
                    question: question.questionText,
                    answers: answer !== undefined && answer !== null
                        ? Array.isArray(answer)
                            ? answer
                            : typeof answer === 'object'
                                ? JSON.stringify(answer) // for grid answers
                                : answer.toString()
                    : ''
                };
            });
            
            return {
                section: section.sectionTitle,
                isAnonymous: this.anonymousToggle,
                responses
            };
          
            
        });

        this.responseService.submitResponse(this.formId, mappedResponse, false).subscribe({
            next: (res) => {
                console.log('Response submitted successfully', res),
                this.router.navigate(['/submit', this.loadedForm.title], { replaceUrl: true });
            },
            error: (err) => console.error('Submission error:', err)
        });
        
    }
}