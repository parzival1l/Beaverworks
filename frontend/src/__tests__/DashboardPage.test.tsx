import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../components/tax/TaxOptimizer', () => ({
  TaxOptimizer: () => null,
}))

import { DashboardPage } from '../pages/DashboardPage'
import { mockCharities } from '../data/mockCharities'
import type { QuestionnaireAnswers } from '../types/charity'

const ANSWERS: QuestionnaireAnswers = {
  causes: 'Environment',
  beneficiaries: 'Children & Youth',
  geography: 'Quebec',
  givingStyle: 'One-time donation',
}

function renderDashboard(mode: 'filtered' | 'all') {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/dashboard',
          search: `?mode=${mode}`,
          state: mode === 'filtered' ? ANSWERS : undefined,
        },
      ]}
    >
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the full mockCharities list in mode=all without firing search', () => {
    renderDashboard('all')
    expect(globalThis.fetch).not.toHaveBeenCalled()
    for (const c of mockCharities.slice(0, 3)) {
      expect(screen.getByText(c.organizationName)).toBeInTheDocument()
    }
  })

  it('mode=filtered fires /api/search and renders the rationale + score', async () => {
    const charity = mockCharities[0]
    ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          queryId: 'q-1',
          results: [
            {
              charity,
              score: 0.83,
              rationale: 'Funds mental health support clinics in Montreal.',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    renderDashboard('filtered')

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    })
    const [url, init] = (
      globalThis.fetch as unknown as ReturnType<typeof vi.fn>
    ).mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/search')
    expect(JSON.parse(init.body as string).answers).toEqual(ANSWERS)

    expect(
      await screen.findByTestId(`charity-rationale-${charity.id}`),
    ).toHaveTextContent(/Funds mental health support clinics/)
    expect(screen.getByText('83% match')).toBeInTheDocument()
  })

  it('falls back to keyword filter when /api/search fails', async () => {
    ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'boom' }), { status: 502 }),
    )

    renderDashboard('filtered')

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    })
    expect(screen.queryByRole('alert')).toBeNull()
    // Fallback uses `filterMockCharitiesByAnswers` which matches at least one
    // Quebec-tagged charity in the seed data.
    await waitFor(() => {
      expect(screen.getAllByText(/Quebec|Montreal/).length).toBeGreaterThan(0)
    })
  })
})
