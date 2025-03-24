import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  faqs = [
    {
      question: 'How secure is my form data?',
      answer: 'We use enterprise-grade AES-256 encryption for data at rest and TLS 1.3 for data in transit. All data is stored in GDPR-compliant servers with regular third-party security audits.',
      isOpen: false
    },
    {
      question: 'Can I collaborate with my team?',
      answer: 'Yes! FormFlow offers real-time collaboration with role-based access control, version history tracking, and comments. Share forms with team members and control their access levels.',
      isOpen: false
    },
    {
      question: 'What integration options are available?',
      answer: 'We support direct integrations with Google Sheets, Zapier, and REST API. Export data in CSV, JSON, or Excel formats. Webhooks available for real-time notifications.',
      isOpen: false
    },
    {
      question: 'How does pricing work?',
      answer: 'We offer a free tier for basic usage. Paid plans start at $29/month with volume discounts available. You can upgrade, downgrade, or cancel anytime.',
      isOpen: false
    },
    {
      question: 'Is there mobile support?',
      answer: 'Yes! FormFlow is fully responsive and works on all devices. We also offer dedicated iOS and Android apps for form creation and response tracking.',
      isOpen: false
    }
  ];

  toggleFAQ(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}