import { Component, OnInit } from '@angular/core';
import { FormService } from '../../services/form.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-assigned-forms',
  templateUrl: './assigned-forms.component.html',
  styleUrls: ['./assigned-forms.component.css']
})
export class AssignedFormsComponent implements OnInit {
  forms: any[] = [];
  loading = true;
  error: string | null = null;
  userEmail: string | null = null;

  constructor(
    private formService: FormService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userEmail = this.authService.getCurrentUserEmail();
    this.loadForms();
  }

  loadForms() {
    this.loading = true;
    this.error = null;
    
    this.formService.getAssignedForms().subscribe({
      next: (forms) => {
        this.forms = forms.map(form => ({
          ...form,
          deadline: form.deadline ? new Date(form.deadline) : null,
          createdAt: new Date(form.createdAt),
          responseCount: form.responseCount || 0
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load forms. Please try again later.';
        this.loading = false;
        console.error('Error loading forms:', err);
      }
    });
  }

  submitForm(formId: number) {
    this.router.navigate(['/submit', formId]);
  }

  formatDate(date: any): string {
    return date ? new Date(date).toLocaleDateString() : 'No deadline';
  }
}