import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-assigned-viewers',
  templateUrl: './assigned-viewers.component.html',
  styleUrls: ['./assigned-viewers.component.css']
})
export class AssignedViewersComponent implements OnInit {
  formId!: number;
  viewers: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private formService: FormService
  ) { }

  ngOnInit(): void {
    this.formId = +this.route.snapshot.paramMap.get('id')!;
    this.loadViewers();
  }

  loadViewers(): void {
    this.formService.getAssignedViewers(this.formId).subscribe({
      next: (viewers) => {
        this.viewers = viewers;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}