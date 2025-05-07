import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { ResponseService } from '../../services/response.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assignment-details',
  templateUrl: './assignment-details.component.html',
  styleUrls: ['./assignment-details.component.scss']
})
export class AssignmentDetailsComponent implements OnInit {
  formId: number | null = null;
  assignedUsers: { username: string; email: string; hasSubmitted: boolean; assignedAt?: string; isSending?: boolean }[] = [];
  filteredUsers: { username: string; email: string; hasSubmitted: boolean; assignedAt?: string; isSending?: boolean }[] = [];
  searchQuery: string = '';
  loading = { users: false, reminders: false };
  errorMessage = '';

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
    this.errorMessage = '';

    this.formService.getAssignedUsers(formId).subscribe({
      next: (users) => {
        console.log('Assigned Users:', users); // Debug log
        this

.assignedUsers = users.map(user => ({
          username: user.username || 'Unknown', // Fallback if username is missing
          email: user.email,
          assignedAt: user.assignedAt,
          hasSubmitted: !!user.submitted
        }));
        this.filteredUsers = [...this.assignedUsers];
        this.loading.users = false;
      },
      error: (err) => {
        console.error('Users Error:', err);
        this.loading.users = false;
        this.errorMessage = 'Failed to load assigned users';
      }
    });
  }

  filterUsers(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredUsers = [...this.assignedUsers];
      return;
    }

    this.filteredUsers = this.assignedUsers.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
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