import { Component, OnInit } from '@angular/core';
   import { ActivatedRoute, Router } from '@angular/router';
   import { FormService } from '../../services/form.service';
   import { ResponseService } from '../../services/response.service';
   import { ScaleType } from '@swimlane/ngx-charts';
import Swal from 'sweetalert2';

   @Component({
     selector: 'app-assignment-details',
     templateUrl: './assignment-details.component.html',
     styleUrls: ['./assignment-details.component.scss']
   })
   export class AssignmentDetailsComponent implements OnInit {
     formId: number | null = null;
     assignedUsers: { email: string; hasSubmitted: boolean; assignedAt?: string; isSending?: boolean }[] = [];
     assignmentTrend: any[] = [];
     loading = { users: false,   chart: false,reminders: false };
     errorMessage = '';
     chartColorScheme = {
       name: 'cool',
       selectable: true,
       group: ScaleType.Ordinal,
       domain: ['#4f46e5', '#7c3aed', '#db2777']
     };

     constructor(
       private route: ActivatedRoute,
       private formService: FormService,
       private responseService: ResponseService,
       private router: Router
     ) {}

     ngOnInit(): void {
       this.route.paramMap.subscribe(params => {
         this.formId = Number(params.get('id'));
         if (this.formId && !isNaN(this.formId)) {
           this.loadAssignedUsers();
         } else {
           this.errorMessage = 'Invalid form ID';
         }
       });
     }

     private loadAssignedUsers(): void {
       if (!this.formId) return;

       const formId = this.formId;
       this.loading.users = true;
       this.loading.chart = true;
       this.errorMessage = '';

       this.formService.getAssignedUsers(formId).subscribe({
         next: (users) => {
          this.assignedUsers = users.map(user => ({
             email: user.email,
             assignedAt: user.assignedAt,
             hasSubmitted: !!user.submitted
           }));
           this.processAssignmentTrend();
           this.loading.users = false;
           this.loading.chart = false; 
         },
         error: (err) => {
           console.error('Users Error:', err);
           this.loading.users = false;
           this.loading.chart = false;
           this.errorMessage = 'Failed to load assigned users';
         }
       });
     }

     private processAssignmentTrend(): void {
       const trendMap: { [date: string]: number } = {};

       this.assignedUsers.forEach(user => {
         if (user.assignedAt) {
           const date = new Date(user.assignedAt).toLocaleDateString();
           trendMap[date] = (trendMap[date] || 0) + 1;
         }
       });

       const trendArray = Object.keys(trendMap).map(date => ({
         name: date,
         value: trendMap[date]
       }));

       this.assignmentTrend = [
         {
           name: 'Assignments',
           series: trendArray
         }
       ];
     }

     cancel(): void {
       this.router.navigate(['/forms']);
     }

     sendUserReminder(userEmail: string): void {
  if (!this.formId) return;

  const user = this.assignedUsers.find(u => u.email === userEmail);
  if (!user) return;

  user.isSending = true;

  this.formService.sendReminder(this.formId).subscribe({
    next: (response) => {
      user.isSending = false;
      Swal.fire({
        icon: 'success',
        title: 'Reminder Sent!',
        text: `Reminder email sent to ${userEmail}`,
        timer: 2000,
        showConfirmButton: false
      });
    },
    error: (err) => {
      user.isSending = false;
      Swal.fire({
        icon: 'error',
        title: 'Failed to Send',
        text: `Could not send reminder to ${userEmail}`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  });
}

sendReminders(): void {
  if (!this.formId) return;

  this.loading.reminders = true;
  
  this.formService.sendReminder(this.formId).subscribe({
    next: (response) => {
      Swal.fire({
        icon: 'success',
        title: 'Reminders Sent!',
        text: response,
        timer: 3000,
        showConfirmButton: false
      });
      this.loading.reminders = false;
    },
    error: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Send',
        text: 'Could not send reminders. Please try again later.',
        timer: 3000,
        showConfirmButton: false
      });
      this.loading.reminders = false;
    }
  });
}
   }