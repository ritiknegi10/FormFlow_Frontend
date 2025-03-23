import { Component, OnInit } from '@angular/core';
import { FormService } from '../../services/form.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss']
})
export class FormsListComponent implements OnInit {
  forms: any[] = [];

  constructor(private formService: FormService, private router: Router) {}

  ngOnInit() {
    this.formService.forms$.subscribe(forms => {
      this.forms = forms;
    });
    
  }
  
  goToAnalytics(index: number) {
    this.router.navigate(['/form-analytics', index]);
  }
  

  
  deleteForm(index: number) {
    this.formService.deleteForm(index);
  }
}
