import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-preview',
  templateUrl: './form-preview.component.html',
  styleUrls: ['./form-preview.component.scss']
})
export class FormPreviewComponent implements OnInit {
    formPreviewData: any;
    sections: any[]=[];
    nextSectionData: { [key: number]: number }={};
    currentSectionIndex!: number;

    ngOnInit(): void {
        this.currentSectionIndex=0;
        const data = sessionStorage.getItem('formPreviewData');

        if(data){
            this.formPreviewData = JSON.parse(data);
            this.sections = this.formPreviewData.sections;
            // console.log(this.sections);
        }
        else{
            console.warn("No session data found");
        }

        this.sections.forEach((section, index) => {
            this.nextSectionData[index] = section.nextSection;
        });
        // console.log(this.nextSectionData);
        
    }

    gotoNextSection(){
        this.currentSectionIndex = this.nextSectionData[this.currentSectionIndex];
    }

    onAnswerSelected(event: Event, question: any){
        const selectedOption = (event.target as HTMLInputElement).value;

        // if(!question.get('sectionBasedonAnswer')?.value) return;
        if(!question.sectionBasedonAnswer) return;

        const options = question.options;
        // console.log(typeof(options));
        // console.log("Options  : ", options);

        for(let i=0; i<options.length; i++){
            const option = options.at(i);
            // console.log("options label : ", option.label);
            const label = option.label

            if(label === selectedOption){
                const gotoSectionIndex = option.goToSection;
                this.nextSectionData[this.currentSectionIndex] = gotoSectionIndex;
                break;
            }
        }
    }
}
