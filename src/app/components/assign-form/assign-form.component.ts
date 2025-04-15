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
  assignedUsers: any[] = [];
  validEmails: string[] = [];
  invalidEmails: string[] = [];
  loading = { users: false, assign: false };
  errorMessage = '';
  successMessage = '';
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService,
    private responseService: ResponseService,
    private fb: FormBuilder
  ) {
    this.formId = +this.route.snapshot.paramMap.get('id')!;
    this.assignForm = this.fb.group({
      searchInput: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadAssignedUsers();
  }

  private loadAssignedUsers(): void {
    this.loading.users = true;
    this.formService.getAssignedUsers(this.formId).subscribe({
      next: (users) => {
        const userEmails = users.map(user => user.email);
        this.responseService.getResponsesByFormId(this.formId).subscribe({
          next: (responses) => {
            this.assignedUsers = userEmails.map(email => ({
              email,
              hasSubmitted: responses.some((r: any) => 
                r.respondent?.email.toLowerCase() === email.toLowerCase()
              )
            }));
            this.loading.users = false;
          },
          error: () => {
            this.assignedUsers = userEmails.map(email => ({ email, hasSubmitted: false }));
            this.loading.users = false;
          }
        });
      },
      error: (err) => {
        this.loading.users = false;
        this.errorMessage = 'Failed to load assigned users';
      }
    });
  }

processInput(): void {
    const input = this.assignForm.get('searchInput')?.value || '';
    const emails = input.split(',')
        .map((e: string) => e.trim())
        .filter((e: string) => e.length > 0);

    // Filter valid and invalid emails
    const newValid = emails.filter((e: string) => 
        this.emailPattern.test(e) && 
        !this.validEmails.includes(e) && 
        !this.assignedUsers.some(u => u.email === e)
    );
    
    const newInvalid = emails.filter((e: string) => 
        !this.emailPattern.test(e) ||
        this.assignedUsers.some(u => u.email === e)
    );

    this.validEmails = [...this.validEmails, ...newValid];
    this.invalidEmails = [...this.invalidEmails, ...newInvalid];
    
    this.assignForm.patchValue({ searchInput: '' });
}

  removeEmail(email: string): void {
    this.validEmails = this.validEmails.filter(e => e !== email);
  }

  onSubmit(): void {
    if (this.validEmails.length === 0) return;

    this.loading.assign = true;
    this.errorMessage = '';
    
    this.formService.assignUsersToForm(this.formId, this.validEmails).subscribe({
      next: () => {
        this.successMessage = `${this.validEmails.length} users assigned successfully!`;
        this.validEmails = [];
        this.invalidEmails = [];
        this.loadAssignedUsers();
      },
      error: (err) => {
        this.errorMessage = 'Failed to assign users. Please try again.';
        this.loading.assign = false;
      },
      complete: () => this.loading.assign = false
    });
  }

  cancel(): void {
    this.router.navigate(['/forms']);
  }
}