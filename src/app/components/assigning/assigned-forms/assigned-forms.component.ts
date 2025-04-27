import { Component, OnInit } from '@angular/core';
import { FormService } from '../../../services/form.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-assigned-forms',
  templateUrl: './assigned-forms.component.html',
  styleUrls: ['./assigned-forms.component.css']
})
export class AssignedFormsComponent implements OnInit {
  forms: any[] = []; // Forms assigned to respond
  viewableForms: any[] = []; // Forms where the user has view access
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
    this.loadForms();
  }

  loadForms(): void {
    this.loading = true;
    forkJoin({
      assigned: this.formService.getAssignedForms(),
      viewable: this.formService.getViewableForms()
    }).subscribe({
      next: (data) => {
        this.forms = data.assigned.map(form => ({
          ...form,
          hasSubmitted: form.hasSubmitted || false
        }));
        this.viewableForms = data.viewable;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load forms. Please try again later.';
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

  viewAllResponses(formId: number): void {
    this.router.navigate([`/view-responses/${formId}`]);
  }
}