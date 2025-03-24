import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-form-analytics',
  templateUrl: './form-analytics.component.html',
  styleUrls: ['./form-analytics.component.scss']
})
export class FormAnalyticsComponent implements OnInit {
  formId: number | null = null;
  responses: any[] = [];

  constructor(private route: ActivatedRoute, private formService: FormService, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.formId = Number(params.get('id')); 
      if (!isNaN(this.formId)) {
        this.loadResponses();
      }
    });
  }

  loadResponses() {
    if (this.formId !== null) {
      this.responses = this.formService.getResponsesByFormIndex(this.formId);
    }
  }

  viewResponses() {
    if (this.formId !== null) {
      console.log("Navigating to View Responses with Form ID:", this.formId);
      this.router.navigate(['/view-responses', this.formId]);
    }
  }
}