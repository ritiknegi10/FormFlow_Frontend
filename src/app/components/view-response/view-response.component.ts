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
  selectedForm: any = null;  // Store selected form details
  responses: any[] = [];  // Store responses


  constructor(private route: ActivatedRoute, private formService: FormService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.formId = Number(params.get('id')); // Get form ID from route
      if (!isNaN(this.formId)) {
        this.loadFormData();
      }
    });
  }

  

  loadFormData() {
    if (this.formId !== null) {
      this.selectedForm = this.formService.getFormByIndex(this.formId); // Fetch form details correctly
      this.responses = this.formService.getResponsesByFormIndex(this.formId); // Fetch responses
    }
  }
}
