import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LoginPage } from '../pages/LoginPage'

describe('LoginPage', () => {
  it('renders form, rejects wrong password, accepts correct credentials', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/questionnaire" element={<p>Questionnaire</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Altru')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'demo@altru.ca' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'bad-password' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'GiveWell2024' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Questionnaire')).toBeInTheDocument()
  })
})
