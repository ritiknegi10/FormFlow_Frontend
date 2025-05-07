import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators  } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-preview',
  templateUrl: './form-preview.component.html',
  styleUrls: ['./form-preview.component.scss']
})
export class FormPreviewComponent implements OnInit {

    formPreviewData: any;
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

    submitClicked = false;
    isSubmitting = false;
    nextClicked= false;

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.currentSectionIndex = 0;
        const data = sessionStorage.getItem('formPreviewData');

        if(data) {
            this.formPreviewData = JSON.parse(data);
            console.log(this.formPreviewData);

            this.sections = this.formPreviewData.sections;

            this.sections.forEach((section: any, sIdx: number) => {
                this.nextSectionData[sIdx] = section.nextSection;
                this.answer[sIdx] = {};
                this.otherInputValues[sIdx] = {};

                section.questions.forEach((question: any, qIdx: number) => {
                    this.answer[sIdx][qIdx] = this.getAnswerValueType(question.type);
                });
                if (!this.validationErrors[sIdx]) this.validationErrors[sIdx] = {};
            });
   
        }
        else {
            console.warn("No session data found");
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
            if (result.isConfirmed) {
                this.clearForm(formRef);
            }
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

    validateCurrentSection(sectionIndex: number): boolean {
        let isValid = true;
        this.validationErrors = {}; 
      
        const section = this.sections[sectionIndex];
      
        section.questions.forEach((question: any, questionIndex: number) => {
            if (question.required) {
                if (!this.validationErrors[sectionIndex]) this.validationErrors[sectionIndex] = {};
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
}
