/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_OAUTH_URL: string;
  readonly VITE_LINKEDIN_OAUTH_URL: string;
  readonly VITE_GOOGLE_OAUTH_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
