// user-forms-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormService } from '../../services/form.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-forms-list',
  templateUrl: './user-forms-list.component.html',
  styleUrls: ['./user-forms-list.component.scss']
})
export class UserFormsListComponent implements OnInit {
  submittedForms: any[] = [];
  noSubmissions: boolean = false;

  constructor(
    private formService: FormService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSubmissions();
  }

  private loadSubmissions() {
    try {
      // Get all responses from localStorage
      const allResponses = JSON.parse(localStorage.getItem('responses') || '{}');
      
      // Get current user from JWT
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        this.router.navigate(['/login']);
        return;
      }

      // Convert responses object to array and filter by user
      this.submittedForms = Object.keys(allResponses).flatMap(formIndex => {
        return allResponses[formIndex]
          .filter((response: any) => response.userId === currentUser.username) // Using username as ID
          .map((response: any) => ({
            formId: formIndex,
            formTitle: this.getFormTitle(formIndex),
            submissionDate: response.timestamp,
            responseData: response
          }));
      });

      this.noSubmissions = this.submittedForms.length === 0;
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  }

  private getCurrentUser(): { username: string } | null {
    const token = this.authService.getToken();
    if (!token) return null;
    
    // Simple JWT decode (for demonstration - use proper JWT decoding in production)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { username: payload.sub };
  }

  private getFormTitle(formIndex: string): string {
    const forms = JSON.parse(localStorage.getItem('forms') || '[]');
    return forms[formIndex]?.title || 'Untitled Form';
  }

  viewResponse(formId: string, responseIndex: number) {
    this.router.navigate(['/form-response', formId, responseIndex]);
  }
}