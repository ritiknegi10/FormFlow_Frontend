import { Component, OnInit } from '@angular/core';
import { FormService } from '../../../services/form.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assigned-forms',
  templateUrl: './assigned-forms.component.html',
  styleUrls: ['./assigned-forms.component.css']
})
export class AssignedFormsComponent implements OnInit {
  forms: any[] = []; 
  viewableForms: any[] = []; 
  activeAssignedForms: any[] = []; 
  expiredAssignedForms: any[] = [];
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


//         const now = new Date();
// this.activeAssignedForms = data.assigned.filter(form => 
//   !form.deadline || new Date(form.deadline) > now
// );
// this.expiredAssignedForms = data.assigned.filter(form => 
//   form.deadline && new Date(form.deadline) <= now
// );
        const now = new Date();
        this.activeAssignedForms = data.assigned.filter(form => 
          !form.deadline || new Date(form.deadline) > now
        ).map(form => ({
          ...form,
          hasSubmitted: form.hasSubmitted || false,
          expired: false
        }));

        this.expiredAssignedForms = data.assigned.filter(form => 
          form.deadline && new Date(form.deadline) <= now
        ).map(form => ({
          ...form,
          hasSubmitted: form.hasSubmitted || false,
          expired: true
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

  sendReminder(formId: number) {
    const form = this.forms.find(f => f.id === formId);
    if (!form) return;
  
    form.isSendingReminder = true;
    
    this.formService.sendReminder(formId).subscribe({
      next: (response) => {
        form.isSendingReminder = false;
        Swal.fire({
          icon: 'success',
          title: 'Reminders Sent',
          text: response,
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err: any) => {
        form.isSendingReminder = false;
        Swal.fire({
          icon: 'error',
          title: 'Failed to Send',
          text: 'Could not send reminders. Please try again later.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }
}