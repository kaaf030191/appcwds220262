import { Component, computed, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

import { AuthService } from '../../security/auth.service';

interface AdminNavItem {
	label: string;
	icon: string;
	route: string;
	exact?: boolean;
}

interface AdminNavGroup {
	header: string;
	items: AdminNavItem[];
}

@Component({
	selector: 'app-admin-sidebar',
	imports: [RouterLink, AvatarModule, TooltipModule],
	templateUrl: './admin-sidebar.html',
	styleUrl: './admin-sidebar.css'
})
export class AdminSidebar {
	private authService = inject(AuthService);
	private router = inject(Router);

	readonly navigate = output<void>();

	readonly user = this.authService.user;

	readonly initials = computed(() => {
		const user = this.user();

		if(!user) {
			return '?';
		}

		return `${user.firstName?.[0] ?? ''}${user.surName?.[0] ?? ''}`.toUpperCase();
	});

	readonly groups: AdminNavGroup[] = [
		{
			header: 'Principal',
			items: [
				{ label: 'Panel', icon: 'pi pi-th-large', route: '/admin/panel', exact: true },
				{ label: 'Quejas', icon: 'pi pi-inbox', route: '/admin/quejas' },
				{ label: 'Sugerencias', icon: 'pi pi-lightbulb', route: '/admin/sugerencias' }
			]
		}
	];

	/** `router.url` no es señal; sin esto el resaltado dependería del ciclo de CD. */
	private readonly currentUrl = toSignal(
		this.router.events.pipe(
			filter((event): event is NavigationEnd => event instanceof NavigationEnd),
			map(() => this.router.url)
		),
		{ initialValue: this.router.url }
	);

	isActive(item: AdminNavItem): boolean {
		const url = this.currentUrl();

		if(item.exact) {
			return url === item.route;
		}

		return url.startsWith(item.route);
	}

	onItemClick(): void {
		this.navigate.emit();
	}
}