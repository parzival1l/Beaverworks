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
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <section className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-3xl font-semibold text-cherry">Altru</p>
          <p className="mt-1 text-sm text-text-secondary">
            Find your cause. Maximize your impact.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-cherry px-4 py-2 font-semibold text-white hover:bg-cherry-dark"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  )
}
