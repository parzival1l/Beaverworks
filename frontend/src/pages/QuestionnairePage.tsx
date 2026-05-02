import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '../components/ui/BackButton'
import { ProgressBar } from '../components/ui/ProgressBar'
import type { QuestionnaireAnswers } from '../types/charity'

type QuestionKey = keyof QuestionnaireAnswers

const questions: Array<{
  key: QuestionKey
  title: string
  options: string[]
}> = [
  {
    key: 'causes',
    title: 'What causes matter most to you?',
    options: [
      'Health & Wellbeing',
      'Education',
      'Environment',
      'Poverty & Housing',
      'Arts & Culture',
      'Animal Welfare',
      'International Aid',
      'Community Development',
    ],
  },
  {
    key: 'beneficiaries',
    title: 'Who do you want to help?',
    options: [
      'Children & Youth',
      'Seniors',
      'Families',
      'Indigenous communities',
      'Newcomers & refugees',
      'Everyone',
    ],
  },
  {
    key: 'geography',
    title: 'Where do you want your donation to have impact?',
    options: [
      'My neighbourhood (Montreal)',
      'Quebec',
      'Canada-wide',
      'International',
    ],
  },
  {
    key: 'givingStyle',
    title: 'How do you prefer to give?',
    options: [
      'One-time donation',
      'Monthly recurring',
      'As part of my tax strategy',
      'Employer matching',
    ],
  },
]

export function QuestionnairePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    causes: '',
    beneficiaries: '',
    geography: '',
    givingStyle: '',
  })

  const question = questions[step]
  const progress = ((step + 1) / questions.length) * 100

  function setAnswer(value: string) {
    setAnswers((previous) => ({ ...previous, [question.key]: value }))
  }

  function next() {
    if (!answers[question.key]) return
    if (step === questions.length - 1) {
      navigate('/dashboard?mode=filtered', { state: answers })
      return
    }
    setStep((previous) => previous + 1)
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-5 flex items-center justify-between">
        {step > 0 ? <BackButton label="Previous question" /> : <span />}
        <button
          type="button"
          className="text-sm font-semibold text-cherry"
          onClick={() => navigate('/dashboard?mode=all')}
        >
          Skip
        </button>
      </div>

      <ProgressBar value={progress} label={`Step ${step + 1} of 4`} />

      <motion.section
        key={question.key}
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -30, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-6 rounded-2xl border border-border bg-white p-6"
      >
        <h1 className="text-2xl">{question.title}</h1>
        <div className="mt-5 grid gap-3">
          {question.options.map((option) => {
            const active = answers[question.key] === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => setAnswer(option)}
                className={`rounded-xl border px-4 py-3 text-left text-sm ${
                  active
                    ? 'border-cherry bg-red-50 text-cherry'
                    : 'border-border hover:bg-cream'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={!answers[question.key]}
            onClick={next}
            className="rounded-lg bg-cherry px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === questions.length - 1 ? 'See my charities →' : 'Next'}
          </button>
        </div>
      </motion.section>
    </main>
  )
}
