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
  noForms: boolean = false;
  submitSuccess: boolean = false;
  constructor(private formService: FormService, private router: Router) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    if (localStorage.getItem("formSaved") === "true") {
      this.submitSuccess = true;
      console.log("form saved");
      localStorage.removeItem("formSaved");

      setTimeout(() => {
          this.submitSuccess = false;
      }, 5000);
    }
    this.formService.getForms().subscribe(forms => {
      this.forms = forms;
      this.noForms = !this.forms.length;
      console.log(forms);
    }); 
  }
  
  goToAnalytics(index: number) {
    this.router.navigate(['/form-analytics', index]);
  }
  
  deleteForm(id: number) {
    this.formService.deleteForm(id);
    window.location.reload();
    if(!this.forms.length) this.noForms = true;
  }

  copyLink(index: number) {   
    const baseUrl = window.location.origin; 
    const shareableLink = `${baseUrl}/sharelink/${index}`; 
    navigator.clipboard.writeText(shareableLink).then(() => {
      alert('Sharable link copied to clipboard!');
    });
  }

  confirmDeleteForm(index: number) {
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
        this.deleteForm(index);
        Swal.fire('Deleted!', 'The form has been deleted.', 'success');
      }
    });
  }
  

}
