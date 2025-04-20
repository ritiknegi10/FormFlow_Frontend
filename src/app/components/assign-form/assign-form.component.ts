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



// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { FormService } from '../../services/form.service';
// import { ResponseService } from '../../services/response.service';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { AuthService } from '../../services/auth.service';
// import { forkJoin, of } from 'rxjs';
// import { catchError, switchMap } from 'rxjs/operators';

// @Component({
//   selector: 'app-assign-form',
//   templateUrl: './assign-form.component.html',
//   styleUrls: ['./assign-form.component.css']
// })
// export class AssignFormComponent implements OnInit {
//   formId: number;
//   assignForm: FormGroup;
//   assignedUsers: any[] = [];
//   validEmails: string[] = [];
//   invalidEmails: string[] = [];
//   nonExistentEmails: string[] = [];
//   duplicateEmails: string[] = [];
//   loading = { users: false, assign: false, checking: false };
//   errorMessage = '';
//   successMessage = '';
//   emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private formService: FormService,
//     private responseService: ResponseService,
//     private authService: AuthService,
//     private fb: FormBuilder
//   ) {
//     this.formId = +this.route.snapshot.paramMap.get('id')!;
//     this.assignForm = this.fb.group({
//       searchInput: ['', [Validators.required]]
//     });
//   }

//   ngOnInit(): void {
//     this.loadAssignedUsers();
//   }

//   private loadAssignedUsers(): void {
//     this.loading.users = true;
//     this.formService.getAssignedUsers(this.formId).subscribe({
//       next: (users) => {
//         const userEmails = users.map(user => user.email);
//         this.responseService.getResponsesByFormId(this.formId).subscribe({
//           next: (responses) => {
//             this.assignedUsers = userEmails.map(email => ({
//               email,
//               hasSubmitted: responses.some((r: any) => 
//                 r.respondent?.email.toLowerCase() === email.toLowerCase()
//               )
//             }));
//             this.loading.users = false;
//           },
//           error: () => {
//             this.assignedUsers = userEmails.map(email => ({ email, hasSubmitted: false }));
//             this.loading.users = false;
//           }
//         });
//       },
//       error: (err) => {
//         this.loading.users = false;
//         this.errorMessage = 'Failed to load assigned users';
//       }
//     });
//   }

//   async processInput(): Promise<void> {
//     this.resetErrors();
//     const input = this.assignForm.get('searchInput')?.value || '';
//     const rawEmails = input.split(',').map((e: string) => e.trim()).filter((e: string) => e.length > 0);

//     // Step 1: Validate email formats
//     const { validFormatEmails, invalidFormatEmails } = this.separateByFormat(rawEmails);
//     this.invalidEmails = invalidFormatEmails;

//     // Step 2: Check for duplicates
//     const { uniqueEmails, duplicateEmails } = this.filterDuplicates(validFormatEmails);
//     this.duplicateEmails = duplicateEmails;

//     if (uniqueEmails.length === 0) {
//       this.assignForm.patchValue({ searchInput: '' });
//       return;
//     }

//     // Step 3: Check email existence
//     try {
//       this.loading.checking = true;
//       const { existingEmails, nonExistentEmails } = await this.checkEmailExistence(uniqueEmails);
//       this.nonExistentEmails = nonExistentEmails;

//       // Step 4: Final validation
//       const finalValid = existingEmails.filter(email => 
//         !this.validEmails.includes(email) &&
//         !this.assignedUsers.some(u => u.email === email)
//       );
      
//       const finalDuplicates = existingEmails.filter(email => 
//         this.validEmails.includes(email) ||
//         this.assignedUsers.some(u => u.email === email)
//       );

//       this.validEmails = [...this.validEmails, ...finalValid];
//       this.duplicateEmails = [...this.duplicateEmails, ...finalDuplicates];
//     } catch (error) {
//       this.errorMessage = 'Error verifying emails. Please try again.';
//     } finally {
//       this.loading.checking = false;
//       this.assignForm.patchValue({ searchInput: '' });
//     }
//   }

//   private separateByFormat(emails: string[]): { 
//     validFormatEmails: string[], 
//     invalidFormatEmails: string[] 
//   } {
//     return emails.reduce((acc: { validFormatEmails: string[], invalidFormatEmails: string[] }, email: string) => {
//       this.emailPattern.test(email) ? 
//         acc.validFormatEmails.push(email) : 
//         acc.invalidFormatEmails.push(email);
//       return acc;
//     }, { validFormatEmails: [], invalidFormatEmails: [] });
//   }    

//   private filterDuplicates(emails: string[]): { 
//     uniqueEmails: string[], 
//     duplicateEmails: string[] 
//   } {
//     const seen = new Set<string>();
//     const duplicates: string[] = [];
//     const unique = emails.filter(email => {
//       const isDuplicate = seen.has(email) || 
//         this.validEmails.includes(email) ||
//         this.assignedUsers.some(u => u.email === email);
      
//       if (isDuplicate) duplicates.push(email);
//       else seen.add(email);
      
//       return !isDuplicate;
//     });
//     return { uniqueEmails: unique, duplicateEmails: duplicates };
//   }

//   private checkEmailExistence(emails: string[]): Promise<{ 
//     existingEmails: string[], 
//     nonExistentEmails: string[] 
//   }> {
//     return forkJoin(
//       emails.map(email => 
//         this.authService.checkUserByEmail(email).pipe(
//           switchMap(exists => of({ email, exists })),
//           catchError(() => of({ email, exists: false }))
//         )
//       )
//     ).toPromise()
//     .then(results => results!.reduce((acc: { existingEmails: string[], nonExistentEmails: string[] }, { email, exists }) => {
//       exists ? acc.existingEmails.push(email) : acc.nonExistentEmails.push(email);
//       return acc;
//     }, { existingEmails: [], nonExistentEmails: [] }));
//   }    

//   removeEmail(email: string): void {
//     this.validEmails = this.validEmails.filter(e => e !== email);
//   }

//   onSubmit(): void {
//     if (this.validEmails.length === 0) return;

//     this.loading.assign = true;
//     this.errorMessage = '';
    
//     this.formService.assignUsersToForm(this.formId, this.validEmails).subscribe({
//       next: () => {
//         this.successMessage = `${this.validEmails.length} users assigned successfully!`;
//         this.validEmails = [];
//         this.loadAssignedUsers();
//       },
//       error: (err) => {
//         this.errorMessage = 'Failed to assign users. Please try again.';
//         this.loading.assign = false;
//       },
//       complete: () => this.loading.assign = false
//     });
//   }

//   private resetErrors(): void {
//     this.invalidEmails = [];
//     this.nonExistentEmails = [];
//     this.duplicateEmails = [];
//     this.errorMessage = '';
//     this.successMessage = '';
//   }

//   cancel(): void {
//     this.router.navigate(['/forms']);
//   }
// }