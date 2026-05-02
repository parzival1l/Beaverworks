/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_QUESTIONNAIRE_SUBMIT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
