import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-preview',
  templateUrl: './form-preview.component.html',
  styleUrls: ['./form-preview.component.scss']
})
export class FormPreviewComponent implements OnInit {
    formPreviewData: any;
    sections: any[] = [];
    nextSectionData: { [key: number]: number } = {};
    nextClicked: boolean = false;
    currentSectionIndex!: number;
    dropdownOpen: boolean = false;
    selectedOption: string | null = null;

    ngOnInit(): void {
        this.currentSectionIndex=0;
        const data = sessionStorage.getItem('formPreviewData');

        if(data){
            this.formPreviewData = JSON.parse(data);
            this.sections = this.formPreviewData.sections;
            console.log(this.sections);
        }
        else{
            console.warn("No session data found");
        }

        this.sections.forEach((section, index) => {
            this.nextSectionData[index] = section.nextSection;
        });
        // console.log(this.nextSectionData);
        
    }

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
    
    getratingRange(question: any): number[]{
        const range: number[] = [];
        for(let i=1; i<=question.rating; i++)
            range.push(i)
        return range;
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
}
