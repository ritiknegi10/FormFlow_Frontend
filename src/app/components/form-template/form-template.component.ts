import { Component } from '@angular/core';
import { FormService } from 'src/app/services/form.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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

  confirmDelete(id: number, draftOrTemplate: string) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it',
      }).then((result) => {
        if (result.isConfirmed) {
          if(draftOrTemplate === 'draft') this.deleteDraft(id);
          else if (draftOrTemplate === 'template') this.deleteTemplate(id);

          Swal.fire('Deleted!', `The ${draftOrTemplate} has been deleted.`, 'success')
          //*RELOAD PAGE AFTER CLICKING OK - TO UPDATE FORM-LIST */
            .then((deletionResult) => {
                if(deletionResult.isConfirmed)
                  window.location.reload();
          });
        }
      });
  }

  deleteTemplate(templateId: number) {
    this.formService.deleteTemplate(templateId).subscribe({
      next: () => console.log("Template deleted successfully"),
      error: (err) => console.log("Error deleting template", err)
    })
  }
  
  deleteDraft(draftId: number) {
    this.formService.deleteDraft(draftId).subscribe({
      next: () => console.log("Draft deleted successfully"),
      error: (err) => console.log("Error deleting draft", err)
    })
  }
   
}