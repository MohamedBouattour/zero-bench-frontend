import { HttpErrorResponse } from '@angular/common/http';
import { toErrorMessage } from './error.util';

describe('toErrorMessage', () => {
  it('prefers the API error message', () => {
    const err = new HttpErrorResponse({ status: 400, error: { error: 'TJM must be between 100 and 3000' } });
    expect(toErrorMessage(err, 'fallback')).toBe('TJM must be between 100 and 3000');
  });

  it('reports network failures explicitly', () => {
    expect(toErrorMessage(new HttpErrorResponse({ status: 0 }), 'fallback')).toBe('Unable to reach the server');
  });

  it('falls back for HTTP errors without a message', () => {
    expect(toErrorMessage(new HttpErrorResponse({ status: 500, error: 'boom' }), 'fallback')).toBe('fallback');
  });

  it('uses runtime error messages', () => {
    expect(toErrorMessage(new Error('bad state'), 'fallback')).toBe('bad state');
    expect(toErrorMessage('???', 'fallback')).toBe('fallback');
  });
});
