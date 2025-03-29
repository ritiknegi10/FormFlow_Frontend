import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-view-response',
  templateUrl: './view-response.component.html',
  styleUrls: ['./view-response.component.scss']
})
export class ViewResponseComponent implements OnInit {
  formId: number | null = null;
  selectedForm: any = null;  
  responses: any[] = [];  


  constructor(private route: ActivatedRoute, private formService: FormService) {}

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
      this.selectedForm = this.formService.getFormById(this.formId); 
      this.responses = this.formService.getResponsesByFormIndex(this.formId); 
    }
  }
}
