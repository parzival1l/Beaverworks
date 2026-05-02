import { useState } from 'react';
import { QUESTIONS, QuestionnaireAnswers } from '../types/questionnaire';
import './Questionnaire.css';

interface Props {
  onSubmit: (answers: QuestionnaireAnswers) => void;
}

export function Questionnaire({ onSubmit }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});

  const question = QUESTIONS[currentStep];
  const selected = answers[question.id];
  const isLast = currentStep === QUESTIONS.length - 1;
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  };

  const handleNext = () => {
    const updatedAnswers = { ...answers, [question.id]: selected! };
    if (isLast) {
      onSubmit(updatedAnswers);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  return (
    <div className="questionnaire">
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <p className="step-label">Question {currentStep + 1} of {QUESTIONS.length}</p>
      <h2 className="question-text">{question.text}</h2>

      <div className="options">
        {question.options.map((option) => (
          <button
            key={option}
            className={`option${selected === option ? ' selected' : ''}`}
            onClick={() => handleSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="nav-buttons">
        {currentStep > 0 && (
          <button className="btn-back" onClick={handleBack}>
            Back
          </button>
        )}
        <button className="btn-next" onClick={handleNext} disabled={!selected}>
          {isLast ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
}
