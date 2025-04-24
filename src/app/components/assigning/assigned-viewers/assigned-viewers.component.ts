import { Component, OnInit } from '@angular/core';
import { FormService } from '../../../services/form.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-assigned-viewers',
  templateUrl: './assigned-viewers.component.html',
  styleUrls: ['./assigned-viewers.component.css']
})
export class AssignedViewersComponent implements OnInit {
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
    this.loadViewableForms();
  }

  loadViewableForms(): void {
    this.loading = true;
    this.formService.getViewableForms().subscribe({
      next: (forms) => {
        this.forms = forms;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load viewable forms. Please try again later.';
        this.loading = false;
      }
    });
  }

  viewResponses(formId: number): void {
    this.router.navigate([`/view-responses/${formId}`]);
  }
}