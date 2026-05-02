import '@testing-library/jest-dom'

/** In-memory Storage — avoids probing Node's experimental `window.localStorage` (invalid `--localstorage-file`). */
function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(String(key)) ?? null,
    setItem: (key: string, value: string) => store.set(String(key), String(value)),
    removeItem: (key: string) => store.delete(String(key)),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
  } as Storage
}

Object.defineProperty(window, 'localStorage', {
  value: createMemoryStorage(),
  configurable: true,
  writable: true,
})
