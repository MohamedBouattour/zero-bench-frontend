import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, catchError, throwError } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';
import { SKIP_LOADING } from '../models/loading.model';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const toastService = inject(ToastService);
  const skipLoading = req.context.get(SKIP_LOADING);

  if (!skipLoading) {
    loadingService.show();
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Display global error toast for network disruptions or server-side 5xx errors
      if (error.status === 0) {
        toastService.error('Unable to connect to the server. Please check your network or mock server.', {
          title: 'Network Error',
        });
      } else if (error.status >= 500) {
        toastService.error(error.statusText || 'Internal server error occurred.', {
          title: `Server Error (${error.status})`,
        });
      }
      return throwError(() => error);
    }),
    finalize(() => {
      if (!skipLoading) {
        loadingService.hide();
      }
    })
  );
};
