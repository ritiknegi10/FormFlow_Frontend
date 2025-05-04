// assign-form.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../services/form.service';
import { ResponseService } from '../../../services/response.service';
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
    isPublic = false;
    allowAnonymous: boolean = false;
    searchQuery = '';
    selectedUsers = new Set<string>();

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
        this.formId = +this.route.snapshot.paramMap.get('id')!;
        this.loadInitialVisibility();
    }

  

  get filteredUsers() {
    return this.assignedUsers.filter(user =>
      user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  
  toggleUserSelection(email: string) {
    this.selectedUsers.has(email) ?
      this.selectedUsers.delete(email) :
      this.selectedUsers.add(email);
  }

  
  
// Add these to the component class
get isAllSelected(): boolean {
  return this.assignedUsers.length > 0 && 
         this.assignedUsers.every(user => this.selectedUsers.has(user.email));
}

toggleAllSelection(): void {
  if (this.isAllSelected) {
      this.selectedUsers.clear();
  } else {
      this.assignedUsers.forEach(user => this.selectedUsers.add(user.email));
  }
}

// Update the existing removeSelectedUsers method
async removeSelectedUsers() {
  try {
      this.loading.users = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const emails = Array.from(this.selectedUsers);
      await this.formService.removeAssignedUsers(this.formId, emails).toPromise();
      
      this.selectedUsers.clear();
      await this.loadAssignedUsers();
      this.successMessage = `${emails.length} users removed successfully`;
      
      setTimeout(() => this.successMessage = '', 3000);
  } catch (error: any) {
      console.error('Removal error:', error);
      this.errorMessage = error.error || 'Error removing users';
      setTimeout(() => this.errorMessage = '', 5000);
  } finally {
      this.loading.users = false;
  }
}

// Update the loadAssignedUsers method to clear selections
private loadAssignedUsers(): Promise<void> {
  return new Promise((resolve) => {
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
                      this.selectedUsers.clear();
                      this.loading.users = false;
                      resolve();
                  },
                  error: () => {
                      this.assignedUsers = userEmails.map(email => ({ email, hasSubmitted: false }));
                      this.selectedUsers.clear();
                      this.loading.users = false;
                      resolve();
                  }
              });
          },
          error: (err) => {
              this.loading.users = false;
              this.errorMessage = 'Failed to load assigned users';
              resolve();
          }
      });
  });
}
  
  async removeSingleUser(email: string) {
    try {
      this.loading.users = true;
      await this.formService.removeAssignedUsers(
        this.formId, 
        [email]
      ).toPromise();
      
      this.selectedUsers.delete(email);
      this.loadAssignedUsers(); // Refresh the list
      this.successMessage = 'User removed successfully';
    } catch (error) {
      this.errorMessage = 'Error removing user';
    } finally {
      this.loading.users = false;
    }
  }

  // private loadInitialVisibility() {
  //   this.formService.getFormById(this.formId).subscribe({
  //     next: (form) => {
  //       this.isPublic = form.isPublic; 
  //     },
  //     error: (err) => {
  //       this.errorMessage = 'Failed to load form settings';
  //     }
  //   });
  // }

 // Update the onVisibilityChange method
onVisibilityChange() {
  // Check if trying to make public with assigned users
  if (this.isPublic && this.assignedUsers.length > 0) {
    this.errorMessage = 'Please remove all assigned users before making the form public';
    this.isPublic = false; // Reset toggle state
    setTimeout(() => this.errorMessage = '', 5000);
    return;
  }

  this.formService.updateVisibility(this.formId, this.isPublic).subscribe({
    next: (res) => {
      this.successMessage = res;
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (err) => {
      this.errorMessage = 'Failed to update visibility';
      this.isPublic = !this.isPublic; // Revert on error
      setTimeout(() => this.errorMessage = '', 5000);
    }
  });
}

// Update the loadInitialVisibility method
private loadInitialVisibility() {
  this.formService.getFormById(this.formId).subscribe({
    next: (form) => {
      this.isPublic = form.isPublic;
      // Add warning if public with existing users
      if (this.isPublic && this.assignedUsers.length > 0) {
        this.errorMessage = 'Warning: Form is public but has assigned users';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    },
    error: (err) => {
      this.errorMessage = 'Failed to load form settings';
    }
  });
}

// Update the component class
attemptVisibilityChange() {
  const newPublicState = !this.isPublic;
  if (newPublicState) {
      if (this.assignedUsers.length > 0) {
          this.errorMessage = 'Remove all assigned users before making the form public';
          setTimeout(() => this.errorMessage = '', 5000);
          return;
      }
      this.formService.updateVisibility(this.formId, true).subscribe({
          next: (res) => {
              this.isPublic = true;
              this.successMessage = res;
              setTimeout(() => this.successMessage = '', 3000);
          },
          error: (err) => {
              this.errorMessage = 'Failed to update visibility';
              setTimeout(() => this.errorMessage = '', 5000);
          }
      });
  } else {
      this.formService.updateVisibility(this.formId, false).subscribe({
          next: (res) => {
              this.isPublic = false;
              this.successMessage = res;
              setTimeout(() => this.successMessage = '', 3000);
          },
          error: (err) => {
              this.errorMessage = 'Failed to update visibility';
              setTimeout(() => this.errorMessage = '', 5000);
          }
      });
  }
}

toggleAnonymous() {
  const newAllowAnonymous = !this.allowAnonymous;
  this.formService.updateFormAnonymous(this.formId, newAllowAnonymous).subscribe({
      next: (res) => {
          this.allowAnonymous = newAllowAnonymous;
          this.successMessage = res;
          setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
          this.errorMessage = 'Failed to update anonymous setting';
          setTimeout(() => this.errorMessage = '', 5000);
      }
  });
}


  // private loadAssignedUsers(): void {
  //   this.loading.users = true;
  //   this.formService.getAssignedUsers(this.formId).subscribe({
  //     next: (users) => {
  //       const userEmails = users.map(user => user.email);
  //       this.responseService.getResponsesByFormId(this.formId).subscribe({
  //         next: (responses) => {
  //           this.assignedUsers = userEmails.map(email => ({
  //             email,
  //             hasSubmitted: responses.some((r: any) => 
  //               r.respondent?.email.toLowerCase() === email.toLowerCase()
  //             )
  //           }));
  //           this.loading.users = false;
  //         },
  //         error: () => {
  //           this.assignedUsers = userEmails.map(email => ({ email, hasSubmitted: false }));
  //           this.loading.users = false;
  //         }
  //       });
  //     },
  //     error: (err) => {
  //       this.loading.users = false;
  //       this.errorMessage = 'Failed to load assigned users';
  //     }
  //   });
  // }

  processInput(): void {
    const input = this.assignForm.get('searchInput')?.value || '';
    const emails = input.split(',')
        .map((e: string) => e.trim())
        .filter((e: string) => e.length > 0);
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
    this.successMessage = '';
    this.formService.assignUsersToForm(this.formId, this.validEmails).subscribe({
        next: (response) => {
            this.successMessage = `${this.validEmails.length} users assigned successfully!`;
            this.validEmails = [];
            this.invalidEmails = [];
            this.loadAssignedUsers();
            setTimeout(() => {
                this.successMessage = '';
            }, 3000);
        },
        error: (err) => {
            console.error('Assignment error:', err);
            this.errorMessage = err.error || 'Failed to assign users. Please try again.';
            setTimeout(() => {
                this.errorMessage = '';
            }, 5000);
        },
        complete: () => {
            this.loading.assign = false;
            this.assignForm.reset();
        }
    });
}

  cancel(): void {
    this.router.navigate(['/forms']);
  }
}

