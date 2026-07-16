/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

interface ImportMetaEnv {
	readonly VITE_API_URL?: string
	readonly VITE_API_BASE_URL?: string
	readonly VITE_GOOGLE_CLIENT_ID?: string
	readonly VITE_ENABLE_ASSESSMENT_GUARD?: string
	readonly VITE_RESUME_APP_URL?: string
	readonly VITE_CODEQUEST_CONNECTOR_URL?: string
	readonly VITE_CONNECTOR_TOKEN?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}