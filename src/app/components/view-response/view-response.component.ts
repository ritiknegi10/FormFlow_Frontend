import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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


  constructor(private route: ActivatedRoute, private formService: FormService, private responseService: ResponseService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.formId = Number(params.get('id')); 
      if (!isNaN(this.formId)) {
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
