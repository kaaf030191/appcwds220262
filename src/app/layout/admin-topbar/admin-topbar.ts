import { Component, computed, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';

import { AuthService, ROLE_ENCARGADO } from '../../security/auth.service';

@Component({
	selector: 'app-admin-topbar',
	imports: [ButtonModule, AvatarModule, MenuModule],
	templateUrl: './admin-topbar.html',
	styleUrl: './admin-topbar.css'
})
export class AdminTopbar {
	private authService = inject(AuthService);
	private router = inject(Router);
	private messageService = inject(MessageService);

	readonly toggleNav = output<void>();
	readonly logoutRequest = output<void>();

	readonly user = this.authService.user;

	readonly initials = computed(() => {
		const user = this.user();

		if(!user) {
			return '?';
		}

		return `${user.firstName?.[0] ?? ''}${user.surName?.[0] ?? ''}`.toUpperCase();
	});

	/**
	 * `router.url` no es una señal: leerlo dentro de un computed no registra
	 * dependencia y el breadcrumb se congelaba en la primera ruta visitada.
	 * Se convierte la navegación en una señal para que el computed reaccione.
	 */
	private readonly currentUrl = toSignal(
		this.router.events.pipe(
			filter((event): event is NavigationEnd => event instanceof NavigationEnd),
			map(() => this.router.url)
		),
		{ initialValue: this.router.url }
	);

	readonly breadcrumb = computed(() => {
		const segments = this.currentUrl().split('/').filter(segment => segment.length > 0);

		const crumbs: { label: string; url?: string }[] = [{ label: 'Inicio' }];

		segments.forEach((segment, index) => {
			if(index === 0 && segment === 'admin') {
				crumbs.push({ label: 'Administración' });
				return;
			}

			crumbs.push({ label: this.humanize(segment), url: `/${segments.slice(0, index + 1).join('/')}` });
		});

		return crumbs;
	});

	readonly profileItems: MenuItem[] = [
		{
			label: 'Ver sitio público',
			icon: 'pi pi-external-link',
			command: () => this.goPublic()
		},
		{
			label: 'Cerrar sesión',
			icon: 'pi pi-sign-out',
			command: () => this.logout()
		}
	];

	readonly isEncargado = computed(() => this.user()?.role === ROLE_ENCARGADO);

	toggleMenu(event: Event): void {
		// El click se delega al p-menu: solo propagamos el evento original.
		event.stopPropagation();
	}

	notify(): void {
		this.messageService.add({ severity: 'info', summary: 'Sin novedades', detail: 'No hay notificaciones pendientes.', life: 3500 });
	}

	private goPublic(): void {
		this.router.navigate(['/']);
	}

	private logout(): void {
		this.logoutRequest.emit();
	}

	private humanize(segment: string): string {
		const labels: Record<string, string> = {
			'panel': 'Panel',
			'quejas': 'Quejas',
			'sugerencias': 'Sugerencias'
		};

		return labels[segment] ?? segment;
	}
}