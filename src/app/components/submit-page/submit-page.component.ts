import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';


@Component({
  selector: 'app-submit-page',
  templateUrl: './submit-page.component.html',
  styleUrls: ['./submit-page.component.scss']
})
export class SubmitPageComponent {
  formTitle: string = '';
  msg:string='';
  constructor(private route: ActivatedRoute, private formService: FormService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const title = params.get('title');
      this.formTitle = title ? title : 'Untitled Form';
    });
    if(this.formService.timestamp){
      this.msg="(Your responses were automatically submitted as the time limit was reached.)";
      this.formService.timestamp=false;
    }
  }
  

}
