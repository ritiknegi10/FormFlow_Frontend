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
        this.formService.getFormById(Number(formIndex)).subscribe(form => {
          this.formData = form; 
          this.formData.formSchema = JSON.parse(this.formData.formSchema); // Parse formSchema if it's a JSON string
          this.answers = new Array(this.formData.formSchema.fields.length).fill(null);
          console.log("Fetched Form Data:", this.formData);
        });
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
