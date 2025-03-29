import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';


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
  formGroup!: FormGroup;

  constructor(
    private route: ActivatedRoute, 
    private formService: FormService, 
    private router: Router,
    private fb: FormBuilder ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const formIndex = params.get('id');  
      if (formIndex !== null) {
<<<<<<< Updated upstream
        this.formData = this.formService.getFormByIndex(Number(formIndex));
        this.answers = new Array(this.formData.questions.length).fill(null);
      }
    });
  }
  
=======
        this.formData = this.formService.getFormById(Number(formIndex));
        this.initializeForm();
      }
    });
  }

  onCheckboxChange(event: any, controlName: string) {
    const selectedOptions = this.formGroup.get(controlName)?.value || [];
    
    if (event.target.checked) {
      selectedOptions.push(event.target.value);
    } else {
      const index = selectedOptions.indexOf(event.target.value);
      if (index > -1) {
        selectedOptions.splice(index, 1);
      }
    }
    
    this.formGroup.get(controlName)?.setValue(selectedOptions);
  }
  

  initializeForm() {
    const formControls: any = {};
    
    this.formData.questions.forEach((question: any) => {
      if (question.type === 'multipleChoice' || question.type === 'dropdown') {
        formControls[question.questionText] = new FormControl('');
      } else if (question.type === 'checkboxes') {
        formControls[question.questionText] = new FormControl([]);
      } else {
        formControls[question.questionText] = new FormControl('');
      }
    });
    
    this.formGroup = this.fb.group(formControls);
  }


  // Handle ratings
  ratingValue = 0;
  ratingStars(n: number): Array<number> { 
    return Array(n); 
  }
  updateRatingValue(n: number) {
    this.ratingValue = n;
  }

>>>>>>> Stashed changes
  submitForm() {
    alert("The form is submitted successfully!!");
    this.router.navigate(['/submit', this.formData.title]);
  }

}
