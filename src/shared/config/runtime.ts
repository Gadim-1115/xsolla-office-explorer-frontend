export interface RuntimeConfig {
  VITE_API_BASE_URL?: string
  VITE_LMS_APP_URL?: string
  VITE_LMS_API_URL?: string
}

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfig
  }
}

export function runtimeEnv(key: keyof RuntimeConfig): string {
  const runtimeValue = window.__APP_CONFIG__?.[key]?.trim()
  if (runtimeValue) return runtimeValue
  return (import.meta.env[key] as string | undefined)?.trim() ?? ''
}
