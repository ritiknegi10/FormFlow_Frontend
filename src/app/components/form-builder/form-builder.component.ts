import { Component } from '@angular/core';
import { Question } from 'src/app/models/question.model';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent {
    formTitle = 'Untitled form';
    formDescription = 'Form description';
    questions: Question[] = [];
    questionIdCounter = 1;

    addQuestion() {
        const newQuestion: Question = {
        id: this.questionIdCounter++,
        text: 'Question text',
        type: 'multipleChoice',
        options: ['Option 1'],
        required: false,
        };
        this.questions.push(newQuestion);
    }

    removeQuestion(id: number) {
        this.questions = this.questions.filter((q) => q.id !== id);
    }

    duplicateQuestion(id: number) {
        const index = this.questions.findIndex(question => question.id === id);
        if (index == -1) return; 
        const questionToDuplicate = this.questions[index];
        console.log(questionToDuplicate);
    
        const duplicatedQuestion: Question = {
        ...questionToDuplicate, 
        id: this.questionIdCounter++, 
        options: questionToDuplicate.options ? [...questionToDuplicate.options] : [], 
        };
    
        this.questions.splice(id + 1, 0, duplicatedQuestion); 
    }
}
