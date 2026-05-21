/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DANIEL_WEBHOOK_URL: string;
  readonly VITE_ONBOARDING_WEBHOOK_URL: string;
  readonly VITE_ANALYSIS_WEBHOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
