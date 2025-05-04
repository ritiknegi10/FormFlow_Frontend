import { Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { FormHeroComponent } from '../form-hero/form-hero.component';

@Component({
  selector: 'app-form-parent',
  templateUrl: './form-parent.component.html',
  styleUrls: ['./form-parent.component.scss']
})
export class FormParentComponent implements OnInit 
{
    formTitle = 'Untitled Form';

    ngOnInit() {
        window.scrollTo(0, 0);
    }

    @ViewChild(FormHeroComponent) formHero!: FormHeroComponent;
    
    updateFormTitle(newTitle: string) {
        this.formTitle = newTitle;
    }

    callOnSubmitMethod() {
        this.formHero.onSubmit();
    }

    handleSaveAsTemplate() {
        this.formHero.onSubmit(true);
    }
    
    handleSaveDraft() {
        this.formHero.saveDraft();
    }

    handlePreviewClick() {
        const formData = this.formHero.getFormData();
        sessionStorage.setItem('formPreviewData', JSON.stringify(formData));
    }
}
