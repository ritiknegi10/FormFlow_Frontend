import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-assign-viewers',
  templateUrl: './assign-viewers.component.html',
  styleUrls: ['./assign-viewers.component.css']
})
export class AssignViewersComponent implements OnInit {
  formId: number;
  assignForm: FormGroup;
  assignedViewers: any[] = [];
  validEmails: string[] = [];
  invalidEmails: string[] = [];
  loading = { viewers: false, assign: false };
  errorMessage = '';
  successMessage = '';
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  searchQuery = '';
  selectedViewers = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService,
    private fb: FormBuilder
  ) {
    this.formId = +this.route.snapshot.paramMap.get('id')!;
    this.assignForm = this.fb.group({
      searchInput: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadAssignedViewers();
  }

  get filteredViewers() {
    return this.assignedViewers.filter(viewer =>
      viewer.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  toggleViewerSelection(email: string) {
    this.selectedViewers.has(email) ?
      this.selectedViewers.delete(email) :
      this.selectedViewers.add(email);
  }

  async removeSelectedViewers() {
    try {
      this.loading.viewers = true;
      await this.formService.removeViewersFromForm(
        this.formId,
        Array.from(this.selectedViewers)
      ).toPromise();

      this.selectedViewers.clear();
      this.loadAssignedViewers(); // Refresh the list
      this.successMessage = 'Selected viewers removed successfully';
    } catch (error) {
      this.errorMessage = 'Error removing viewers';
    } finally {
      this.loading.viewers = false;
    }
  }

  async removeSingleViewer(email: string) {
    try {
      this.loading.viewers = true;
      await this.formService.removeViewersFromForm(
        this.formId,
        [email]
      ).toPromise();

      this.selectedViewers.delete(email);
      this.loadAssignedViewers(); 
      this.successMessage = 'Viewer removed successfully';
    } catch (error) {
      this.errorMessage = 'Error removing viewer';
    } finally {
      this.loading.viewers = false;
    }
  }

  private loadAssignedViewers(): void {
    this.loading.viewers = true;
    this.formService.getAssignedViewers(this.formId).subscribe({
      next: (viewers) => {
        this.assignedViewers = viewers;
        this.loading.viewers = false;
      },
      error: (err) => {
        this.loading.viewers = false;
        this.errorMessage = 'Failed to load assigned viewers';
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
      !this.assignedViewers.some(v => v.email === e)
    );

    const newInvalid = emails.filter((e: string) =>
      !this.emailPattern.test(e) ||
      this.assignedViewers.some(v => v.email === e)
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

    this.formService.assignViewersToForm(this.formId, this.validEmails).subscribe({
      next: () => {
        this.successMessage = `${this.validEmails.length} viewers assigned successfully!`;
        this.validEmails = [];
        this.invalidEmails = [];
        this.loadAssignedViewers();
      },
      error: (err) => {
        this.errorMessage = 'Failed to assign viewers. Please try again.';
        this.loading.assign = false;
      },
      complete: () => this.loading.assign = false
    });
  }

  cancel(): void {
    this.router.navigate(['/forms']);
  }
}