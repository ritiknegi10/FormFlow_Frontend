import { Component } from '@angular/core';

@Component({
  selector: 'app-form-analytics',
  templateUrl: './form-analytics.component.html',
  styleUrls: ['./form-analytics.component.scss']
})
export class FormAnalyticsComponent {
  responses = ['Response 1', 'Response 2']; // Example responses

  questions = [
    {
      text: 'Responses',
      responses: this.responses
    }
  ];

}
