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
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userEmail = this.authService.getCurrentUserEmail();
    this.loadAssignedForms();
  }

  loadAssignedForms(): void {
    this.loading = true;
    this.formService.getAssignedForms().subscribe({
      next: (forms) => {
        this.forms = forms.map(form => ({
          ...form,
          hasSubmitted: form.hasSubmitted || false
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load assigned forms. Please try again later.';
        this.loading = false;
      }
    });
  }

  openForm(formId: number): void {
    this.router.navigate([`/sharelink/${formId}`]);
  }

  viewResponse(formId: number): void {
    this.router.navigate([`/view-responses/my-responses/${formId}`]);
  }
}