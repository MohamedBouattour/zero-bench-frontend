/**
 * Development environment configuration.
 *
 * An empty string delegates relative `/api/*` paths to Angular dev proxy (proxy.conf.json)
 * which forwards requests to http://localhost:3001.
 */
export const environment = {
  production: false,
  // Relative URL delegates to local proxy.conf.json -> http://localhost:3001
  apiUrl: '',
  appVersion: '1.0.0-dev',
};
