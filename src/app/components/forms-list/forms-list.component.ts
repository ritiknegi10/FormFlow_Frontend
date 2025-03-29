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
  noForms: boolean = false;

  constructor(private formService: FormService, private router: Router) {}

  ngOnInit() {
    this.formService.getForms().subscribe(forms => {
      this.forms = forms;
      this.noForms = this.forms.length === 0;
      console.log(forms);
    }); 
  }
  
  
  goToAnalytics(index: number) {
    this.router.navigate(['/form-analytics', index]);
  }
  
  deleteForm(id: number) {
    this.formService.deleteForm(id);
    window.location.reload();
    if(!this.forms.length) this.noForms = true;
  }

  copyLink(index: number) {   
    const baseUrl = window.location.origin; 
    const shareableLink = `${baseUrl}/sharelink/${index}`; 
    navigator.clipboard.writeText(shareableLink).then(() => {
      alert('Sharable link copied to clipboard!');
    });
  }
  
}
