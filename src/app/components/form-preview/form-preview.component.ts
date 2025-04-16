import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-preview',
  templateUrl: './form-preview.component.html',
  styleUrls: ['./form-preview.component.scss']
})
export class FormPreviewComponent implements OnInit {
    formPreviewData: any;
    sections: any[]=[];

    ngOnInit(): void {
        const data = sessionStorage.getItem('formPreviewData');

        if(data){
            this.formPreviewData = JSON.parse(data);
            this.sections = this.formPreviewData.sections;
            console.log(this.sections);
        }
        else{
            console.warn("No session data found");
        }
    }
}
