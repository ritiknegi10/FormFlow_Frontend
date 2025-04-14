// src/app/components/assign-form/assign-form.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { ResponseService } from '../../services/response.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-assign-form',
  templateUrl: './assign-form.component.html',
  styleUrls: ['./assign-form.component.css']
})
export class AssignFormComponent implements OnInit {
  formId: number;
  assignForm: FormGroup;
  submitSuccess: boolean = false;
  errorMessage: string = '';
  assignedUsers: { email: string; hasSubmitted: boolean }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService,
    private responseService: ResponseService,
    private fb: FormBuilder
  ) {
    this.formId = +this.route.snapshot.paramMap.get('id')!;
    this.assignForm = this.fb.group({
      emails: ['', [Validators.required, Validators.pattern(/^\S+@\S+\.\S+(,\S+@\S+\.\S+)*$/)]]
    });
  }

  ngOnInit(): void {
    this.loadAssignedUsers();
  }

  loadAssignedUsers(): void {
    this.formService.getAssignedUsers(this.formId).subscribe({
      next: (users) => {
        const userEmails = users.map((user: any) => user.email);
        this.responseService.getResponsesByFormId(this.formId).subscribe({
          next: (responses) => {
            this.assignedUsers = userEmails.map((email: string) => ({
              email,
              hasSubmitted: responses.some((response: any) => response.respondent?.email === email)
            }));
          },
          error: (err) => {
            console.error('Error fetching responses:', err);
            this.assignedUsers = userEmails.map((email: string) => ({ email, hasSubmitted: false }));
          }
        });
      },
      error: (err) => {
        console.error('Error fetching assigned users:', err);
        this.assignedUsers = [];
      }
    });
  }

  onSubmit(): void {
    if (this.assignForm.valid) {
      const emails = this.assignForm.value.emails.split(',').map((email: string) => email.trim());
      this.formService.assignUsersToForm(this.formId, emails).subscribe({
        next: () => {
          this.submitSuccess = true;
          this.errorMessage = '';
          this.assignForm.reset();
          this.loadAssignedUsers();
          setTimeout(() => {
            this.submitSuccess = false;
            this.router.navigate(['/forms']);
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to assign users. Please check the email addresses.';
          console.error('Assignment error:', err);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/forms']);
  }
}