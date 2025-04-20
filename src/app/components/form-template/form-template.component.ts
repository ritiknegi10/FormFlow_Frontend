import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/services/form.service';

@Component({
  selector: 'app-form-template',
  templateUrl: './form-template.component.html',
  styleUrls: ['./form-template.component.scss']
})
export class FormTemplateComponent implements OnInit {
  templates: any[] = [];
  isLoading = true;

  constructor( private formService: FormService, 
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params['newTemplate']) {
          this.loadTemplates();
      }
    });
    this.loadTemplates();
  }


  loadTemplates() {
    this.formService.getTemplates().subscribe({
      next: (templates: any[]) => {
        this.templates = templates;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading templates:', err);
        this.isLoading = false;
      }
    });
  }


  useTemplate(templateId: number) {
    this.router.navigate(['/create'], { 
      queryParams: { templateId: templateId } 
    });
  }


  createNewForm() {
    this.router.navigate(['/create'])
}
}