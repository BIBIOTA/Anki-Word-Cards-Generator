/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANKI_URL: string
  readonly VITE_OPENAI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
