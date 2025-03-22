import { Component } from '@angular/core';

@Component({
  selector: 'app-form-analytics',
  templateUrl: './form-analytics.component.html',
  styleUrls: ['./form-analytics.component.scss']
})
export class FormAnalyticsComponent {
  responses = ['Response 1', 'Response 2','Response 3', 'Response 4','Response 5', 'Response 6']; // Example responses

  questions = [
    {
      text: 'Responses',
      responses: this.responses
    }
  ];
  viewResponse(response: string, index: number) {
    alert(`Response #${index + 1}: ${response}`);
  }

}
