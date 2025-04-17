import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit{
    formData = {
        name: '',
        email: '',
        message: ''
    };

    ngOnInit() {
        window.scrollTo(0, 0);
    }

    onSubmit() {
        console.log('Form submitted:', this.formData);
    }
}