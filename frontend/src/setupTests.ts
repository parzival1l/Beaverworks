import '@testing-library/jest-dom'

if (typeof window.localStorage?.setItem !== 'function') {
  const store = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    },
    writable: true,
  })
}
