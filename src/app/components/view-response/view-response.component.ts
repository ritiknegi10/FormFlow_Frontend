import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { ResponseService } from 'src/app/services/response.service';

@Component({
  selector: 'app-view-response',
  templateUrl: './view-response.component.html',
  styleUrls: ['./view-response.component.scss']
})
export class ViewResponseComponent implements OnInit {
  formId: number | null = null;
  selectedForm: any = null;  
  responses: any[] = [];  
  submissionTrend: any[] = [];
  questionResponseData: any = {};

  constructor(private route: ActivatedRoute, private formService: FormService, private responseService: ResponseService, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.formId = Number(params.get('id')); 
      const currentUrl = this.router.url;
      if (currentUrl.includes('my-responses')){
        this.loadFormDataSubmissions()
      }else{
        this.loadFormData();
      }
    });
  }

  loadFormData() {
    if (this.formId !== null) {
      this.formService.getFormById(this.formId).subscribe(form => {
        this.selectedForm = form;
      });
  
      this.responseService.getResponsesByFormId(this.formId).subscribe(responses => {
        this.responses = responses;
      });
    }
  }

  loadFormDataSubmissions(){
    if (this.formId !== null) {
      this.formService.getFormById(this.formId).subscribe(form => {
        this.selectedForm = form;
      });
  
      this.responseService.getResponsesByFormIdandUser(this.formId).subscribe(responses => {
        this.responses = responses;
        console.log(responses)
      });
    }
  }
  getKeys(response: any): string[] {
    try {
      return Object.keys(JSON.parse(response.responseData));
    } catch (error) {
      console.error("Error parsing responseData:", error);
      return [];
    }
  }
  
  getValue(response: any, key: string): string {
    try {
      return JSON.parse(response.responseData)[key] || "N/A";
    } catch (error) {
      console.error("Error parsing responseData:", error);
      return "N/A";
    }
  }
}