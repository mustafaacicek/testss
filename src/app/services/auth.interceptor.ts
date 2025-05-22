import { Injectable, inject } from '@angular/core';
import { 
  HttpRequest, 
  HttpHandlerFn, 
  HttpEvent, 
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Shared state for the interceptor
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

// Helper function to add token to request
const addToken = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
};

// HTTP Interceptor function
export const AuthInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    request = addToken(request, token);
  }

  return next(request).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Handle 401 error (refresh token)
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          const refreshToken = authService.getRefreshToken();
          
          if (refreshToken) {
            return authService.refreshToken({ refreshToken }).pipe(
              switchMap((token) => {
                isRefreshing = false;
                refreshTokenSubject.next(token.accessToken);
                return next(addToken(request, token.accessToken));
              }),
              catchError((err) => {
                isRefreshing = false;
                authService.logout();
                return throwError(() => err);
              })
            );
          }
        }

        return refreshTokenSubject.pipe(
          filter(token => token != null),
          take(1),
          switchMap(jwt => {
            return next(addToken(request, jwt as string));
          })
        );
      }
      return throwError(() => error);
    })
  );
};
