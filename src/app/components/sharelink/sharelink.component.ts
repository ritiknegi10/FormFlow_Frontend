import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-sharelink',
  templateUrl: './sharelink.component.html',
  styleUrls: ['./sharelink.component.scss']
})
export class SharelinkComponent implements OnInit{
  formId: number | null = null;
  formData: any;
  formIndex!: number;
  answers: any[] = [];
  


  constructor(private route: ActivatedRoute, private formService: FormService, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const formIndex = params.get('id');  
      if (formIndex !== null) {
        this.formData = this.formService.getFormByIndex(Number(formIndex));
        this.answers = new Array(this.formData.questions.length).fill(null);
      }
    });
  }

  // Handle ratings
  ratingValue = 0;
  ratingStars(n: number): Array<number> { 
    return Array(n); 
  }
  updateRatingValue(n: number) {
    this.ratingValue = n;
  }

  submitForm() {
    alert("The form is submitted successfully!!");
    this.router.navigate(['/submit', this.formData.title]);
  }

}
