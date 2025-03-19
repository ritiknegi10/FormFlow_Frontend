
import { Component } from '@angular/core';

@Component({
  selector: 'app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss']
})
export class FormsListComponent {
  forms = [
    { title: 'Customer Survey', responses: 45 },
    { title: 'Employee Feedback', responses: 23 },
    { title: 'Product Research', responses: 89 }
  ];
}