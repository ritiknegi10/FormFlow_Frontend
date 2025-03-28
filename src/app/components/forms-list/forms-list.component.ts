import { Component, OnInit } from '@angular/core';
import { FormService } from '../../services/form.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss']
})
export class FormsListComponent implements OnInit {
  forms: any[] = [];

  constructor(private formService: FormService, private router: Router) {}

  ngOnInit() {
    this.formService.forms$.subscribe(forms => {
      this.forms = forms;
    });
    
  }
  
  goToAnalytics(index: number) {
    this.router.navigate(['/form-analytics', index]);
  }
  

  
  deleteForm(index: number) {
    this.formService.deleteForm(index);
  }

  confirmDeleteForm(formId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteForm(formId);
        Swal.fire('Deleted!', 'The form has been deleted.', 'success');
      }
    });
  }
  

}
