/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CALENDAR_API_KEY: string
  readonly VITE_GOOGLE_CALENDAR_ID: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_BACKEND_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 