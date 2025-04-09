import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})

export class FaqComponent implements OnInit{
  faqs = [
    {
      question: 'Can I view my submitted responses?',
      answer: 'Yes! All responses are available in real-time through your form dashboard. You can filter, export, or analyze responses directly in FormFlow.',
      tips: 'Use our response tracking feature to get notified of new submissions',
      isOpen: false
    },
    {
      question: 'Is my form data secure?',
      answer: 'All form data is encrypted both in transit and at rest. We comply with GDPR regulations and offer two-factor authentication for account security.',
      tips: 'Enable 2FA in your account settings for added security',
      isOpen: false
    },
    {
      question: 'Can I see my form versions?',
      answer: 'Absolutely! FormFlow automatically maintains version history. Access previous versions from the form editor and restore any previous state with one click.',
      tips: 'Create manual version snapshots before major changes',
      isOpen: false
    },
    {
      question: 'Can I edit my form after creating it?',
      answer: 'Yes, forms can be edited anytime. Changes autosave as you work. Note: Published forms will update immediately unless you create a new version.',
      tips: 'Duplicate forms to experiment with changes safely',
      isOpen: false
    },
    {
      question: 'How do I export response data?',
      answer: 'Responses can be exported in CSV, Excel, or JSON formats. Set up automatic exports to cloud storage or use our API for real-time data access.',
      tips: 'Use our Google Sheets integration for automatic syncing',
      isOpen: false
    }
  ];

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  toggleFAQ(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}