import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const anonymousGuard: CanActivateFn = () => {
	const authService = inject(AuthService);
	const router = inject(Router);

	return authService.isAuthenticated()
		? router.createUrlTree([authService.isEncargado() ? '/admin/panel' : '/'])
		: true;
};
