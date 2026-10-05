import { Component, ChangeDetectorRef, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';

import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { AdminTopbar } from '../admin-topbar/admin-topbar';
import { AuthService } from '../../security/auth.service';

@Component({
	selector: 'app-admin-layout',
	imports: [RouterOutlet, AdminSidebar, AdminTopbar],
	templateUrl: './admin-layout.html',
	styleUrl: './admin-layout.css'
})
export class AdminLayout {
	private authService = inject(AuthService);
	private router = inject(Router);
	private messageService = inject(MessageService);
	private changeDetectorRef = inject(ChangeDetectorRef);

	readonly mobileNavVisible = signal(false);

	toggleNav(): void {
		this.mobileNavVisible.update(open => !open);
	}

	closeMobileNav(): void {
		this.mobileNavVisible.set(false);
	}

	logout(): void {
		this.authService.clear();

		this.messageService.add({
			severity: 'info',
			summary: 'Correcto',
			detail: 'Sesión cerrada correctamente.',
			life: 4000
		});

		this.closeMobileNav();
		this.router.navigate(['/user/login']);

		this.changeDetectorRef.markForCheck();
		this.changeDetectorRef.detectChanges();
	}
}