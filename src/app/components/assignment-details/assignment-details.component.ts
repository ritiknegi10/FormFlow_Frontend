import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { ResponseService } from '../../services/response.service';

@Component({
  selector: 'app-assignment-details',
  templateUrl: './assignment-details.component.html',
  styleUrls: ['./assignment-details.component.scss']
})
export class AssignmentDetailsComponent implements OnInit {
  formId: number | null = null;
  assignedUsers: { email: string; hasSubmitted: boolean; assignedAt?: string }[] = [];
  assignmentTrend: any[] = [];
  loading = { users: false, chart: false };
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

    const formId = this.formId; // Store in local variable to ensure type is number
    this.loading.users = true;
    this.loading.chart = true;
    this.errorMessage = '';

    this.formService.getAssignedUsers(formId).subscribe({
      next: (users) => {
        const userEmails = users.map(user => ({
          email: user.email,
          assignedAt: user.assignedAt // Assuming assignedAt is provided
        }));

        this.responseService.getResponsesByFormId(formId).subscribe({
          next: (responses) => {
            this.assignedUsers = userEmails.map(user => ({
              email: user.email,
              assignedAt: user.assignedAt,
              hasSubmitted: responses.some((r: any) =>
                r.respondent?.email.toLowerCase() === user.email.toLowerCase()
              )
            }));
            this.processAssignmentTrend();
            this.loading.users = false;
            this.loading.chart = false;
          },
          error: (err) => {
            this.assignedUsers = userEmails.map(user => ({
              email: user.email,
              assignedAt: user.assignedAt,
              hasSubmitted: false
            }));
            this.processAssignmentTrend();
            this.loading.users = false;
            this.loading.chart = false;
            this.errorMessage = 'Failed to load response data';
          }
        });
      },
      error: (err) => {
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
}