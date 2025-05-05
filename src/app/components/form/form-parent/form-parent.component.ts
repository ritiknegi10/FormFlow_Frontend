import { Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormHeroComponent } from '../form-hero/form-hero.component';
import { FormNavbarComponent } from '../form-navbar/form-navbar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-parent',
  templateUrl: './form-parent.component.html',
  styleUrls: ['./form-parent.component.scss']
})
export class FormParentComponent implements OnInit {

    formTitle = 'Untitled Form';
    formIdAfterSave: number | null = null;

    constructor(private router: Router) { }

    ngOnInit() {
        window.scrollTo(0, 0);
    }

    @ViewChild(FormHeroComponent) formHero!: FormHeroComponent;
    @ViewChild(FormNavbarComponent) navbar!: FormNavbarComponent;

    updateFormTitle(newTitle: string) {
        this.formTitle = newTitle;
    }

    callOnSubmitMethod(shouldNavigate: boolean) {
        this.formHero.onSubmit(false, shouldNavigate);
    }

    handleSaveAsTemplate(shouldNavigate: boolean) {
        this.formHero.onSubmit(true, shouldNavigate);
    }
    
    handleSaveDraft(shouldNavigate: boolean) {
        this.formHero.saveDraft(shouldNavigate);
    }
    handleUpdateDraft() {
        this.formHero.updateDraft();
    }

    handlePreviewClick() {
        const formData = this.formHero.getFormData();
        sessionStorage.setItem('formPreviewData', JSON.stringify(formData));
    }

    
    getSavedFormId(formId: number) {
        this.formIdAfterSave = formId;
        
        if (this.navbar.actionAfterSave === 'copy') {
            this.handleCopyLink(formId);
        } else if (this.navbar.actionAfterSave === 'assign') {
            this.handleAssignForm(formId);
        }
    
        this.navbar.actionAfterSave = null;
    }

    handleCopyLink(formId: number) {
        const baseUrl = window.location.origin; 
        const shareableLink = `${baseUrl}/sharelink/${formId}`; 
        navigator.clipboard.writeText(shareableLink).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Link Copied!',
                text: 'You can now share the form link easily.',
                confirmButtonColor: '#4CAF50',
                timer: 2000, 
            });
        });
    }

    handleAssignForm(formId: number) {
        this.router.navigate(['/forms', formId, 'assigning']);
    }

    
}
