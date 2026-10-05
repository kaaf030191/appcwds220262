import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const encargadoGuard: CanActivateFn = () => {
	const authService = inject(AuthService);
	const router = inject(Router);

	if(!authService.isAuthenticated()) {
		return router.createUrlTree(['/user/login'], { queryParams: { reason: 'unauthenticated' } });
	}

	if(!authService.isEncargado()) {
		return router.createUrlTree(['/'], { queryParams: { reason: 'forbidden' } });
	}

	return true;
};
