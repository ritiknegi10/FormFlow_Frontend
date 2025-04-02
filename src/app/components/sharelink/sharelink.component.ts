import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { ResponseService } from 'src/app/services/response.service';
import Swal from 'sweetalert2';


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
  parsedFormSchema: any = { fields: [] };
  submitClicked: boolean=false;
  touchedFields: boolean[] = [];


  constructor(private route: ActivatedRoute, private formService: FormService, private router: Router, private responseService: ResponseService) { }


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

  updateCheckbox(index: number, option: string, event: any) {
    if (!this.answers[index]) {
      this.answers[index] = []; 
    }
    if (event.target.checked) {
      
      this.answers[index].push(option);
    } else {
      
      this.answers[index] = this.answers[index].filter((item: string) => item !== option);
    }
  }
  


  // Handle ratings
  ratingValue = 0;
  ratingStars(n: number): Array<number> { 
    // console.log("in ratingStars function");
    // console.log(n);
    return Array(n); 
  }
  updateRatingValue(n: number) {
    console.log(n);
    this.ratingValue = n;
  }

  markAsTouched(index: number) {
    this.touchedFields[index] = true;
  }

  submitForm() {
    this.submitClicked=true;
    const missingAnswers = this.formData.formSchema.fields.some((question: any, index: number) => {
      return question.required && (this.answers[index] === null || this.answers[index] === '' || 
        (Array.isArray(this.answers[index]) && this.answers[index].length === 0));
    });
  
    if (missingAnswers) {
      return;
    }

  
    console.log(this.answers)
    const mappedResponse = this.formData.formSchema.fields.reduce((acc: Record<string, any>, field: any, index: number) => {
      const answer = this.answers[index];
      if (answer !== null && answer !== undefined) {
        acc[field.label] = Array.isArray(answer) ? answer : answer.toString(); // Keep arrays, convert others to strings
      }
      return acc;
    }, {});

    Swal.fire({
      icon: 'success',
      title: 'Form Submitted!',
      text: 'Your responses have been recorded successfully.',
      confirmButtonColor: '#4CAF50', // Green color
    });    
    this.router.navigate(['/submit', this.formData.title]);
  }
  

}
