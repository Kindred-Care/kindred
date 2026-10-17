/**
 * Runtime configuration. Only EXPO_PUBLIC_ values are bundled into the app, so nothing secret may
 * ever be configured this way (.env.example documents every variable).
 */
export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:5080',
} as const;
