/**
 * Production environment configuration.
 * Targeted for Render hosting and remote production builds.
 *
 * Points directly to the live BenchZero Mock API hosted on the VPS via HTTPS,
 * with SSL encryption, CORS preflights, and PM2 persistence.
 */
export const environment = {
  production: true,
  // Live secure BenchZero Mock API endpoint on VPS
  apiUrl: 'https://wall-street.cloud/zero-bench/api',
  appVersion: '1.0.0',
};
