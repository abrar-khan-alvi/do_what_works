/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_DANIEL_WEBHOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
