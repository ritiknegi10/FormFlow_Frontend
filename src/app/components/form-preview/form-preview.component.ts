import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators  } from '@angular/forms';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-preview',
  templateUrl: './form-preview.component.html',
  styleUrls: ['./form-preview.component.scss']
})
export class FormPreviewComponent implements OnInit {

    form!: FormGroup;
    formPreviewData: any;
    sections: any[] = [];
    nextSectionData: { [key: number]: number } = {};
    nextClicked: boolean = false;
    currentSectionIndex!: number;
    dropdownOpen: boolean[] = [];
    selectedOption: string | null = null;

    constructor(private fb: FormBuilder) {}

    ngOnInit(): void {
        this.currentSectionIndex = 0;
        const data = sessionStorage.getItem('formPreviewData');

        if(data) {
            this.initializeForm(data);
            console.log('Form initialized:', this.formPreviewData);

            // this.formPreviewData = JSON.parse(data);

            // this.form = this.fb.group({
            //     sections: this.fb.array(this.formPreviewData.sections.map((section: any) =>
            //         this.fb.group({
            //             sectionTitle: section.sectionTitle,
            //             sectionDescription: section.sectionDescription,
            //             nextSection: section.nextSection,
            //             questions: this.fb.array(section.questions.map((question: any) =>
            //                 this.fb.group({
            //                 questionText: question.questionText,
            //                 questionDescription: question.questionDescription,
            //                 type: question.type,
            //                 required: question.required,
            //                 options: this.fb.control(question.options || []),
            //                 rows: this.fb.control(question.rows || []),
            //                 columns: this.fb.control(question.columns || []),
            //                 rating: this.fb.control(question.rating || null),
            //                 linearScale: this.fb.control(question.linearScale || null),
            //                 answer: this.createAnswerControl(question)
            //                 })
            //             )),
            //         }),

            //     )),
            // });

            // console.log(this.formPreviewData);
            // this.sections = this.formPreviewData.sections;
            // console.log(this.sections);

            
        }
        else {
            console.warn("No session data found");
        }

        // this.sections.forEach((section, index) => {
        //     this.nextSectionData[index] = section.nextSection;
        // });
        
    }

    initializeForm(data: any) {
        this.formPreviewData = JSON.parse(data);
        this.form = this.fb.group({
            sections: this.fb.array(this.formPreviewData.sections.map((section: any) =>
                this.createSectionGroup(section)
            )),
        });
        this.sections = this.formPreviewData.sections;

        this.sections.forEach((section: any, index: number) => {
            this.nextSectionData[index] = index + 1; // Default to next section
        });
    }

    createSectionGroup(section: any): FormGroup {
        return this.fb.group({
          sectionTitle: [section.sectionTitle],
          sectionDescription: [section.sectionDescription],
          nextSection: [section.nextSection],
          questions: this.fb.array(section.questions.map((question: any) => 
            this.createQuestionGroup(question))
          )
        });
    }

    createQuestionGroup(question: any): FormGroup {
        return this.fb.group({
            questionText: [question.questionText],
            questionDescription: [question.questionDescription],
            type: [question.type],
            required: [question.required || false],
            options: [question.options || []],
            rows: [question.rows || []],
            columns: [question.columns || []],
            rating: [question.rating || null],
            linearScale: [question.linearScale || null],
            answer: this.createAnswerControl(question)
        });
    }

    createAnswerControl(question: any) {
        switch (question.type) {
            case 'checkboxes':
                const checkboxControls = question.options.map(() => new FormControl(false));
                return this.fb.array(checkboxControls);
            
            case 'multipleChoiceGrid':
            case 'checkboxGrid':
                return this.fb.group(
                    (question.rows || []).reduce((acc: any, row: string) => {
                        acc[row] = new FormControl(question.type === 'multipleChoiceGrid' ? '' : []);
                        return acc;
                    }, {})
                );
            
            case 'rating':
            case 'linearScale':
                return new FormControl(null);
            
            case 'multipleChoice':
                // For radio buttons, default to first option if required
                return new FormControl('');
            
            case 'dropdown':
                return new FormControl('');
            
            default:
                // For text, paragraph, date, time, etc.
                return new FormControl('', question.required ? Validators.required : null);
        }
    }

    // get sections(): FormArray {
    //     return this.form.get('sections') as FormArray;
    //   }
    
      getQuestions(sectionIndex: number): FormArray {
        return this.sections.at(sectionIndex).get('questions') as FormArray;
      }
    
      getCheckboxOptions(question: FormGroup): FormArray {
        return question.get('answer') as FormArray;
      }
    
      getGridRows(question: FormGroup): FormGroup {
        return question.get('answer') as FormGroup;
    }

    // createAnswerControl(question: any) {

    //     // FormArray for checkboxes
    //     if(question.type === 'checkboxes') {
    //         return this.fb.array(question.options.map((option: any) => new FormControl(false)));
    //     }

    //     // FormGroup for grids
    //     else if(question.type === 'multipleChoiceGrid' || question.type === 'checkboxGrid') {
    //         return this.fb.group((question.rows || []).reduce((acc: any, row: string) => {
    //                 acc[row] = new FormControl(''); 
    //                 return acc;
    //             }, {}
    //         ));
    //     }

    //     // FormControl (null initially) for rating and linear scale
    //     else if (question.type === 'rating' || question.type === 'linearScale') {
    //         return new FormControl(null);
    //     }

    //     // FormControl (empty string initially) for the rest 
    //     else {
    //         return new FormControl('');
    //     }

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

    toggleCheckbox(label: string, question: any) {
        if (!question.answer) question.answer = [];
        const idx = question.answer.indexOf(label);
        if (idx === -1) {
          question.answer.push(label);
        } else {
          question.answer.splice(idx, 1);
        }
    }

    onCheckboxChange(event: any, answerArray: FormArray) {
        const value = event.target.value;
        if (event.target.checked) {
            answerArray.push(new FormControl(value));
        } else {
            const index = answerArray.controls.findIndex(x => x.value === value);
            if (index >= 0) {
                answerArray.removeAt(index);
            }
        }
    }

    selectMultipleChoiceGrid(question: any, row: string, column: string) {
        if(!question.answer) question.answer = [];
        question.answer[row] = column;
    }
    
    getRatingRange(question: any): number[]{
        const range: number[] = [];
        for(let i=1; i<=question.rating; i++)
            range.push(i)
        return range;
    }

    setRatingValue(question: any, value: number) {
        question.answer = value;
    }
    getScaleRange(question: any): number[]{
        const range: number[] = [];
        for(let i=question.startValue; i<=question.endValue; i++)
            range.push(i);
        return range;
    }
    
    onAnswerSelected(option: any, question: any) {
        // console.log("answer selected");
        // const selectedOption = (event.target as HTMLInputElement).value;

        // if(!question.sectionBasedonAnswer) return;

        // const options = question.options;

        // for(let i=0; i<options.length; i++){
        //     const option = options.at(i);
        //     const label = option.label

        //     if(label === selectedOption){
        //         const gotoSectionIndex = option.goToSection;
        //         this.nextSectionData[this.currentSectionIndex] = gotoSectionIndex;
        //         break;
        //     }
        // }

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
        // Swal.fire({
        //     title: 'Are you sure?',
        //     text: 'This will erase all answers from your form, and cannot be undone',
        //     icon: 'warning',
        //     showCancelButton: true,
        //     confirmButtonColor: '#d33',
        //     cancelButtonColor: '#3085d6',
        //     confirmButtonText: 'Yes, clear form',
        // }).then((result) => {
        //     if (result.isConfirmed) {
        //         this.clearForm(formRef);
        //     }
        // });

        console.log(this.sections);
    }

    clearForm(formRef: any) {
        formRef.resetForm();
    }
}
