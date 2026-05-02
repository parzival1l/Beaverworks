import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

const DEMO_EMAIL = 'demo@altru.ca'
const DEMO_PASSWORD = 'GiveWell2024'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem('altru_authed', 'true')
      navigate('/questionnaire')
      return
    }

    setError('Invalid email or password.')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <section className="w-full max-w-md rounded-2xl border border-divider bg-ivory-dark p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-3xl font-semibold text-trust">Altru</p>
          <p className="mt-1 text-sm text-charcoal-muted">
            Find your cause. Maximize your impact.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-charcoal"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-form bg-white px-3 py-2 text-charcoal focus:border-trust focus:outline-none focus:ring-2 focus:ring-trust/30"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-charcoal"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-form bg-white px-3 py-2 text-charcoal focus:border-trust focus:outline-none focus:ring-2 focus:ring-trust/30"
              required
            />
          </div>
          {error ? (
            <p className="rounded-lg bg-urgent-light px-3 py-2 text-sm text-urgent">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-give px-4 py-2 font-semibold text-white hover:bg-give-dark"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  )
}
