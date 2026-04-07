import { API_CONFIG } from './config';

export function assertBackendConfig(): void {
  if (import.meta.env.PROD && API_CONFIG.useMock) {
    const msg =
      '[S3M] Production build is running with mock backend. Set VITE_USE_MOCK_BACKEND=false and provide VITE_API_BASE_URL.';
    console.error(msg);
    // Don't throw — render an error state in the UI instead
  }

  if (import.meta.env.PROD && !API_CONFIG.baseUrl) {
    console.error('[S3M] VITE_API_BASE_URL is not set for production build.');
  }
}
