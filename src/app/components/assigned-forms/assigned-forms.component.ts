// src/app/components/assigned-forms/assigned-forms.component.ts
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
  noForms: boolean = false;
  userEmail: string | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private formService: FormService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userEmail = this.authService.getCurrentUserEmail();
    if (this.userEmail) {
      this.loadAssignedForms();
    } else {
      this.errorMessage = 'Please log in to view assigned forms.';
      this.noForms = true;
    }
  }

  loadAssignedForms(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.formService.getAssignedForms(this.userEmail!).subscribe({
      next: (forms) => {
        this.forms = forms;
        this.noForms = forms.length === 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching assigned forms:', err);
        this.noForms = true;
        this.errorMessage = 'Failed to load assigned forms. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  submitForm(formId: number): void {
    this.router.navigate(['/submit', formId]);
  }
}