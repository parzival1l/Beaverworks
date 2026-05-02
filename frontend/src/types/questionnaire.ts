export interface Question {
  id: string;
  text: string;
  options: string[];
}

export type QuestionnaireAnswers = Record<string, string>;

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Which cause area resonates with you most?',
    options: [
      'Environment & Climate',
      'Education & Youth',
      'Health & Medical Research',
      'Hunger & Poverty Relief',
      'Animal Welfare',
    ],
  },
  {
    id: 'q2',
    text: 'Where would you like your impact to be felt?',
    options: [
      'My local community',
      'Nationally (within the US)',
      'Internationally / globally',
      'Wherever the need is greatest',
    ],
  },
  {
    id: 'q3',
    text: 'How do you prefer your donation to create change?',
    options: [
      'Direct aid (food, shelter, medicine)',
      'Research & innovation',
      'Advocacy & policy change',
      'Education & awareness programs',
    ],
  },
  {
    id: 'q4',
    text: 'What matters most when choosing a charity?',
    options: [
      'Financial transparency & low overhead',
      'Proven track record & results',
      'Alignment with my personal values',
      'Endorsement by trusted sources',
    ],
  },
  {
    id: 'q5',
    text: 'How involved would you like to be beyond donating?',
    options: [
      'Just donate — keep it simple',
      'Volunteer opportunities',
      'Stay informed with updates',
      'Actively campaign or fundraise',
    ],
  },
];
