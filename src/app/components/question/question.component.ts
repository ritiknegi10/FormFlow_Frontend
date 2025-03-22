import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Question } from 'src/app/models/question.model';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})

export class QuestionComponent {
    @Input() question!: Question;
    @Output() remove = new EventEmitter<number>();
    @Output() duplicate = new EventEmitter<number>();
  
    addOption() {
      if (!this.question.options) {
        this.question.options = [];
      }
      this.question.options.push(`Option ${this.question.options.length + 1}`);
    }
  
    removeOption(index: number) {
      if (this.question.options) {
        this.question.options.splice(index, 1);
      }
    }
  
    onRemove() {
      this.remove.emit(this.question.id);
    }
    onDuplicate() {
      this.duplicate.emit(this.question.id);
    }
  }