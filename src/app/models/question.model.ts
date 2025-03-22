// question.model.ts
export interface Question {
    id: number;
    text: string;
    type: 'shortText' | 'paragraph' | 'multipleChoice' | 'checkboxes' | 'dropdown'; 
    options?: string[]; // For multiple choice, checkboxes, dropdown
    required: boolean;
}