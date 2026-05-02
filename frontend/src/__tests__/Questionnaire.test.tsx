import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Questionnaire } from '../components/Questionnaire';

const ALL_ANSWERS = [
  'Environment & Climate',
  'My local community',
  'Direct aid (food, shelter, medicine)',
  'Financial transparency & low overhead',
  'Just donate — keep it simple',
];

function answerThroughStep(upToStep: number) {
  for (let i = 0; i < upToStep; i++) {
    fireEvent.click(screen.getByText(ALL_ANSWERS[i]));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
  }
}

describe('Questionnaire', () => {
  it('renders the first question text', () => {
    render(<Questionnaire onSubmit={vi.fn()} />);
    expect(screen.getByText(/Which cause area resonates/i)).toBeInTheDocument();
  });

  it('renders all options for the first question', () => {
    render(<Questionnaire onSubmit={vi.fn()} />);
    expect(screen.getByText('Environment & Climate')).toBeInTheDocument();
    expect(screen.getByText('Animal Welfare')).toBeInTheDocument();
  });

  it('shows "Question 1 of 5" progress label', () => {
    render(<Questionnaire onSubmit={vi.fn()} />);
    expect(screen.getByText(/1 of 5/i)).toBeInTheDocument();
  });

  it('Next button is disabled before an answer is selected', () => {
    render(<Questionnaire onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('Next button becomes enabled after selecting an answer', () => {
    render(<Questionnaire onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText('Environment & Climate'));
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
  });

  it('advances to the second question after clicking Next', () => {
    render(<Questionnaire onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText('Environment & Climate'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText(/Where would you like your impact/i)).toBeInTheDocument();
  });

  it('shows "Question 2 of 5" after advancing', () => {
    render(<Questionnaire onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText('Environment & Climate'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText(/2 of 5/i)).toBeInTheDocument();
  });

  it('shows a Back button on questions after the first', () => {
    render(<Questionnaire onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText('Environment & Climate'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('going Back returns to the previous question', () => {
    render(<Questionnaire onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByText('Environment & Climate'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText(/Which cause area resonates/i)).toBeInTheDocument();
  });

  it('shows "Submit" instead of "Next" on the last question', () => {
    render(<Questionnaire onSubmit={vi.fn()} />);
    answerThroughStep(4);
    fireEvent.click(screen.getByText(ALL_ANSWERS[4]));
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  it('calls onSubmit with all 5 answers when the form is completed', () => {
    const onSubmit = vi.fn();
    render(<Questionnaire onSubmit={onSubmit} />);
    answerThroughStep(4);
    fireEvent.click(screen.getByText(ALL_ANSWERS[4]));
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledWith({
      q1: 'Environment & Climate',
      q2: 'My local community',
      q3: 'Direct aid (food, shelter, medicine)',
      q4: 'Financial transparency & low overhead',
      q5: 'Just donate — keep it simple',
    });
  });
});
