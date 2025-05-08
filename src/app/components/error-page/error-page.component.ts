import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent {
  ermsg!: number;
  errorTitle: string = '';
  errorDescription: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const msg = params.get('msg') || '1';
      this.ermsg = +msg;
      if(this.ermsg==403) {
        this.errorTitle = "Access Denied";
        this.errorDescription = "You are not authorized to access this form."
      }
      else if(this.ermsg==404) {
        this.errorTitle = "Form Not Found";
        this.errorDescription = "This form is currently not available."
      }
      else if(this.ermsg==409) {
        this.errorTitle = "Already Submitted";
        this.errorDescription = "You can submit this form only once."
      }
      else if(this.ermsg==410) {
        this.errorTitle = "Time Out!"
        this.errorDescription = "Your form was submitted automatically."
      }
      else {
        this.errorTitle = "Unexpected Error";
        this.errorDescription = "An unexpected error occured. Please try again later."
      }
    });
  }
}