import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	const token = authService.token();

	const requestWithToken = token
		? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
		: request;

	return next(requestWithToken).pipe(
		catchError((error: HttpErrorResponse) => {
			if(error.status === 401 && authService.isAuthenticated()) {
				authService.clear();

				router.navigate(['/user/login'], { queryParams: { reason: 'expired' } });
			} else if(error.status === 403) {
				router.navigate(['/user/login'], { queryParams: { reason: 'forbidden' } });
			}

			return throwError(() => error);
		})
	);
};
