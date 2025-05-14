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
  forms: any[] = []; // Forms assigned to respond
  viewableForms: any[] = []; // Forms where the user has view access
  loading = true;
  error: string | null = null;
  userEmail: string | null = null;
  deadlinePassed: { [formId: number] : boolean } = {};
  showAssigned = true;
  showViewable = false;

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
        this.checkDeadlineValidity(this.forms);
        this.viewableForms = data.viewable;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load forms. Please try again later.';
        this.loading = false;
      }
    });
  }

  checkDeadlineValidity(forms: any) {
    const now = new Date();
    this.deadlinePassed = {}; 

    forms.forEach((form: any) => {
      if(form.deadline) {
        const formDeadline = new Date(form.deadline);
        const isPassed = formDeadline < now;
        this.deadlinePassed[form.id] = isPassed;
      }
      else this.deadlinePassed[form.id] = false;
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