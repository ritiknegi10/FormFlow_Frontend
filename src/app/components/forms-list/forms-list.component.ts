import { Component, OnInit } from '@angular/core';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss']
})
export class FormsListComponent implements OnInit {
  forms: any[] = [];

  constructor(private formService: FormService) {}

  ngOnInit() {
    this.formService.forms$.subscribe(forms => {
      this.forms = forms;
    });
  }

  deleteForm(index: number) {
    this.formService.deleteForm(index);
  }
}
