import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { ResponseService } from '../../services/response.service';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';

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
   
   
    ratingValues: number[] = [];
    dropdownOpen: boolean[] = [];


    invalidtype: boolean[][] = [];
invalidsize: boolean[][] = [];
uploadedFiles: boolean[][] = [];
uploadedFileNames: string[][] = [];

    submitClicked = false;
    isSubmitting = false;
    nextClicked= false;

   
    formSchema: any;
   
    isFormLoaded: boolean = false;
    responses: { [sectionIndex: number]: { [questionIndex: number]: any } } = {};
    hoverRating: number = 0;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private formService: FormService,
        private router: Router,
        private responseService: ResponseService
    ) {
        this.loadedForm = this.fb.group({
            title: 'Untitled Form',
            description: '',
            sections: this.fb.array([])
        });
    }

    ngOnInit() {
        this.formId = Number(this.route.snapshot.paramMap.get('id'));
        this.currentSectionIndex = 0;

        this.formService.checkFormAccess(this.formId).subscribe({
            next: (response: string) => {
                if (response === "Access granted") {
                    console.log('Access granted! Proceeding with form submission.');
                }
            },
            error: (error) => {  
                if (error.status === 404) this.router.navigate(['/error', 404]);
                else if (error.status === 403) this.router.navigate(['/error', 403]);
                else if (error.status === 409) this.router.navigate(['/error', 409]);
                else if (error.status === 410) this.onSubmit();
            }
        });

        if (this.formId) {
            this.formService.getFormById(this.formId).subscribe({
                next: (form) => {
                    this.loadedForm.patchValue({
                        title: form.title,
                        description: form.description,
                    });

                    this.formSchema = typeof form.formSchema === 'string' 
                        ? JSON.parse(form.formSchema) 
                        : form.formSchema;
                    this.sections = this.formSchema.sections;

                    // Initialize arrays for file handling
                    this.uploadedFiles = this.sections.map(section =>
                        section.questions.map(() => false)
                    );
                    this.uploadedFileNames = this.sections.map(section =>
                        section.questions.map(() => '')
                    );
                    this.invalidsize = this.sections.map(section =>
                        section.questions.map(() => false)
                    );
                    this.invalidtype = this.sections.map(section =>
                        section.questions.map(() => false)
                    );

                    // Initialize responses structure
                    this.sections.forEach((section, sIdx) => {
                        this.nextSectionData[sIdx] = section.nextSection;
                        this.responses[sIdx] = {};
                        this.answer[sIdx] = {};
                        this.otherInputValues[sIdx] = {};

                        section.questions.forEach((question: any, qIdx: number) => {
                            // Initialize responses based on question type
                            if (question.type === 'checkboxes') {
                                this.responses[sIdx][qIdx] = {};
                                question.options.forEach((option: any) => {
                                    this.responses[sIdx][qIdx][option.label] = false;
                                });
                            } 
                            else if (question.type === 'multipleChoiceGrid' || question.type === 'checkboxGrid') {
                                this.responses[sIdx][qIdx] = {};
                                if (question.type === 'checkboxGrid') {
                                    question.rows.forEach((row: any) => {
                                        this.responses[sIdx][qIdx][row] = {};
                                        question.columns.forEach((column: any) => {
                                            this.responses[sIdx][qIdx][row][column] = false;
                                        });
                                    });
                                }
                            } 
                            else {
                                this.responses[sIdx][qIdx] = '';
                            }

                            // Initialize answer structure
                            this.answer[sIdx][qIdx] = this.getAnswerValueType(question.type);
                        });
                    });

                    this.isFormLoaded = true;
                },
                error: (err) => {
                    console.error('Failed to load form data:', err);
                }
            });
        }
    }

    // Helper methods
    getAnswerValueType(questionType: string): any {
        switch (questionType) {
            case 'shortText':
            case 'paragraph':
            case 'multipleChoice':
            case 'dropdown':
            case 'date':
            case 'time':
                return '';
            case 'checkboxes':
                return [];
            case 'multipleChoiceGrid':
            case 'checkboxGrid':
                return {};
            case 'linearScale':
            case 'rating':
                return null;
            case 'file':
                return null;
            default:
                return null;
        }
    }

    // Section navigation
    gotoNextSection(sIdx: number = this.currentSectionIndex) {
        if (this.validateCurrentSection(this.currentSectionIndex)) {
            this.sectionHistory.push(this.currentSectionIndex);
            this.currentSectionIndex = this.nextSectionData[this.currentSectionIndex];
            window.scroll(0, 0);
            this.nextClicked = true;
        } else {
            const section = this.sections[this.currentSectionIndex];
            section.questions.forEach((question: any, questionIndex: number) => {
                const ques = document.getElementById(`question-${this.currentSectionIndex}-${questionIndex}`);
                if (ques && this.validationErrors[this.currentSectionIndex][questionIndex]) {
                    ques.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    }

    gotoPreviousSection() {
        if (this.sectionHistory.length > 0) {
            this.currentSectionIndex = this.sectionHistory.pop()!;
            window.scroll(0, 0);
        }
    }

    // Validation
    validateCurrentSection(sectionIndex: number): boolean {
        let isValid = true;
        this.validationErrors[sectionIndex] = {};

        const section = this.sections[sectionIndex];
        section.questions.forEach((question: any, questionIndex: number) => {
            if (question.required) {
                let answer = this.answer[sectionIndex][questionIndex];
                const otherInput = this.otherInputValues[sectionIndex]?.[questionIndex];

                // Handle different question types
                if (question.type === 'multipleChoice') {
                    if (!answer || (answer === 'Other' && !otherInput?.trim())) {
                        isValid = false;
                        this.validationErrors[sectionIndex][questionIndex] = true;
                    }
                } 
                else if (question.type === 'checkboxes') {
                    const hasValidSelection = answer.length > 0;
                    const hasOtherValid = answer.includes('Other') ? !!otherInput?.trim() : true;
                    if (!hasValidSelection || !hasOtherValid) {
                        isValid = false;
                        this.validationErrors[sectionIndex][questionIndex] = true;
                    }
                } 
                else if (question.type === 'multipleChoiceGrid' || question.type === 'checkboxGrid') {
                    const rows = question.rows || [];
                    const allRowsAnswered = rows.every((row: string) => {
                        const val = answer[row];
                        if (question.type === 'checkboxGrid') return Array.isArray(val) && val.length > 0;
                        return !!val;
                    });
                    if (!allRowsAnswered) {
                        isValid = false;
                        this.validationErrors[sectionIndex][questionIndex] = true;
                    }
                } 
                else {
                    if (!answer?.toString().trim()) {
                        isValid = false;
                        this.validationErrors[sectionIndex][questionIndex] = true;
                    }
                }
            }
        });

        return isValid;
    }

    // File handling
    onFileSelected(event: Event, sectionIndex: number, qIdx: number): void {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            this.invalidtype[sectionIndex][qIdx] = true;
            input.value = '';
            return;
        }

        if (file.size > maxSize) {
            this.invalidsize[sectionIndex][qIdx] = true;
            input.value = '';
            return;
        }

        this.invalidtype[sectionIndex][qIdx] = false;
        this.invalidsize[sectionIndex][qIdx] = false;

        this.uploadedFileNames[sectionIndex][qIdx] = file.name;
        this.uploadedFiles[sectionIndex][qIdx] = true;

        this.formService.uploadFile(file).subscribe({
            next: (fileUrl: string) => {
                this.responses[sectionIndex][qIdx] = fileUrl;
            },
            error: (err) => {
                console.error('File upload failed:', err);
                this.uploadedFiles[sectionIndex][qIdx] = false;
            }
        });
    }

    onDeleteFile(sectionIndex: number, qIdx: number): void {
        const fileUrl = this.responses[sectionIndex]?.[qIdx];
        if (fileUrl) {
            this.formService.deleteFile(fileUrl).subscribe({
                next: () => {
                    this.uploadedFiles[sectionIndex][qIdx] = false;
                    this.uploadedFileNames[sectionIndex][qIdx] = '';
                    this.responses[sectionIndex][qIdx] = '';
                },
                error: (err) => console.error('Error deleting file:', err)
            });
        }
    }

    // Question type handlers
    setRating(rate: number, qIdx: number) {
        this.responses[this.currentSectionIndex][qIdx] = rate;
    }

    clearRating(qIdx: number) {
        this.responses[this.currentSectionIndex][qIdx] = 0;
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
        const inputText = event.target.value;
        const checkInput = document.getElementById(checkInputId) as HTMLInputElement;
        if (checkInput) checkInput.checked = true;

        this.otherInputValues[sIdx][qIdx] = inputText;
        if (Array.isArray(this.answer[sIdx][qIdx])) {
            if (!this.answer[sIdx][qIdx].includes('Other')) {
                this.answer[sIdx][qIdx].push('Other');
            }
        } else {
            this.answer[sIdx][qIdx] = 'Other';
        }
    }

    // Form submission
    onSubmit() {
        this.submitClicked = true;
        if (!this.validateCurrentSection(this.currentSectionIndex)) return;

        const mappedResponse = this.sections.map((section: any, sIdx: number) => {
            const questions = section.questions.map((question: any, qidx: number) => {
                let response = this.responses[sIdx][qidx];
                
                // Handle "Other" responses
                if (this.otherInputValues[sIdx]?.[qidx]) {
                    if (Array.isArray(response)) {
                        response = response.map((item: string) => 
                            item === 'Other' ? this.otherInputValues[sIdx][qidx] : item
                        );
                    } else if (response === 'Other') {
                        response = this.otherInputValues[sIdx][qidx];
                    }
                }

                return {
                    questiontext: question.questionText,
                    response
                };
            });
            return {
                section: section.sectionTitle,
                index: sIdx,
                questions
            };
        });

        this.responseService.submitResponse(this.formId, JSON.stringify(mappedResponse)).subscribe({
            next: (res) => {
                this.router.navigate(['/submit', this.loadedForm.get('title')?.value], { replaceUrl: true });
            },
            error: (err) => {
                console.error('Submission error:', err);
                this.router.navigate(['/error', err.status]);
            }
        });
    }

    // UI helpers
    getRatingRange(question: any): number[] {
        return Array.from({ length: question.rating }, (_, i) => i + 1);
    }

    getScaleRange(question: any): number[] {
        return Array.from({ length: question.endValue - question.startValue + 1 }, 
            (_, i) => i + question.startValue);
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
                formRef.resetForm();
                this.responses = {};
                this.answer = {};
                this.otherInputValues = {};
            }
        });
    }
}