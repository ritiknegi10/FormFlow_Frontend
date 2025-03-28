import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-form-analytics',
  templateUrl: './form-analytics.component.html',
  styleUrls: ['./form-analytics.component.scss']
})
export class FormAnalyticsComponent implements OnInit {
  formId: number | null = null;
  responses: any[] = [];

  constructor(private route: ActivatedRoute, private formService: FormService, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.formId = Number(params.get('id')); 
      if (!isNaN(this.formId)) {
        this.loadResponses();
      }
    });
  }

  loadResponses() {
    if (this.formId !== null) {
      this.responses = this.formService.getResponsesByFormIndex(this.formId);
    }
  }

  viewResponses() {
    if (this.formId !== null) {
      console.log("Navigating to View Responses with Form ID:", this.formId);
      this.router.navigate(['/view-responses', this.formId]);
    }
  }

  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.responses);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');
    XLSX.writeFile(workbook, `form_${this.formId}_responses.xlsx`);
  }

  exportToPDF() {
    const doc = new jsPDF();
    doc.text(`Form ${this.formId} Responses`, 10, 10);
    autoTable(doc, {
      head: [Object.keys(this.responses[0] || {})],
      body: this.responses.map(res => Object.values(res)),
    });
    doc.save(`form_${this.formId}_responses.pdf`);
  }
}