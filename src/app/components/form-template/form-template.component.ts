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
        console.log(this.drafts);
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        this.isLoading = false;
      }
    });
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
  // useTemplate(template: any) {
  //   if (!template?.formSchema) {
  //     console.error('Invalid template structure:', template);
  //     alert('Corrupted template format. Please contact support.');
  //     return;
  //   }
  
  //   this.router.navigate(['/create'], {
  //     state: {
  //       templateData: {
  //         title: template.title + ' (Copy)',
  //         description: template.description,
  //         // Handle both stringified and parsed schemas
  //         formSchema: typeof template.formSchema === 'string' 
  //                   ? JSON.parse(template.formSchema)
  //                   : template.formSchema
  //       }
  //     }
  //   });
  // }
  


  createNewForm() {
    this.router.navigate(['/create'])
}
}