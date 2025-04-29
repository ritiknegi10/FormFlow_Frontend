// assigning.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assigning',
  templateUrl: './assigning.component.html',
  styleUrls: ['./assigning.component.css']
})
export class AssigningComponent implements OnInit {
  formId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.formId = +this.route.snapshot.paramMap.get('id')!;
  }

  navigateBack(): void {
    this.router.navigate(['/forms']);
  }
}