import { Component } from '@angular/core';
import { FormService } from 'src/app/services/form.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-template',
  templateUrl: './form-template.component.html',
  styleUrls: ['./form-template.component.scss']
})
export class FormTemplateComponent {
  templates: any[] = [];
  drafts: any[] = [];
  isLoading = true;


  constructor(private formService: FormService, private router: Router) {
    this.loadTemplates();
    this.loadDrafts();
  }

  loadTemplates() {
    this.formService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        this.isLoading = false;
      }
    });
  }

  loadDrafts() {
    this.formService.getDrafts().subscribe({
      next: (drafts) => {
        this.drafts = drafts;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        this.isLoading = false;
      }
    });
  }
  createNewForm() {
    this.router.navigate(['/create']);
  }

  openDraft(draftId: number) {
    this.router.navigate(['/create'], { 
      queryParams: { draftId: draftId } 
    });
  }
  
  useTemplate(templateId: number) {
    this.router.navigate(['/create'], { 
      queryParams: { templateId: templateId } 
    });
  }
    
}