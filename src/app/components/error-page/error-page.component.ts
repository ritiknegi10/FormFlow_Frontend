import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent {
  ermsg!:number;
  formTitle: string = '';
  description:string='';

  constructor(private route: ActivatedRoute) {}
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const msg = params.get('msg') || '1';
      this.ermsg= +msg;
      if(this.ermsg==403){
        this.formTitle="Acess Denied";
        this.description="You are not assigned to this form!!"
      }
      else if(this.ermsg==404){
        this.formTitle="Form Not Found";
        this.description="This form is currently not available"
      }
      else if(this.ermsg==409){
        this.formTitle="Already Subimtted";
        this.description="You can only submit form once."
      }
      else if(this.ermsg==410){
        this.formTitle="Timed Out!!"
        this.description="Your form is submitted automatically."
      }
      else{
        this.formTitle="Unexpected Error";
        this.description="An unexpected error occured. Please try again later. "
      }
    });
  }
}