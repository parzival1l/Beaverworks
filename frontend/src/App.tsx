import { useState } from 'react';
import { Questionnaire } from './components/Questionnaire';
import { QuestionnaireAnswers } from './types/questionnaire';

type AppState = 'questionnaire' | 'loading' | 'submitted' | 'error';

function App() {
  const [state, setState] = useState<AppState>('questionnaire');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (answers: QuestionnaireAnswers) => {
    setState('loading');
    try {
      const res = await fetch('/api/questionnaire/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // userId will be injected here once the auth feature is integrated
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setState('submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  };

  if (state === 'loading') {
    return (
      <div className="app">
        <div className="result-card">
          <p className="loading-text">Finding your match…</p>
        </div>
      </div>
    );
  }

  if (state === 'submitted') {
    return (
      <div className="app">
        <div className="result-card">
          <div className="result-icon">✓</div>
          <h1>Thank you!</h1>
          <p>Your preferences have been saved. We'll find charities that align with your values.</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="app">
        <div className="result-card error">
          <h1>Something went wrong</h1>
          <p>{error}</p>
          <button onClick={() => setState('questionnaire')}>Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Find Your Cause</h1>
        <p>Answer 5 quick questions and we'll match you with charities that fit your values.</p>
      </header>
      <Questionnaire onSubmit={handleSubmit} />
    </div>
  );
}

export default App;
