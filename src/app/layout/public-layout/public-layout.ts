import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem, MessageService } from 'primeng/api';
import { delay } from 'rxjs';

import { OptionMenuService } from '../../observable/option-menu/option-menu.service';
import { AuthService, ROLE_ENCARGADO } from '../../security/auth.service';

@Component({
	selector: 'app-public-layout',
	imports: [NgClass, RouterOutlet, RouterLink, ButtonModule, MenuModule, AvatarModule],
	templateUrl: './public-layout.html',
	styleUrl: './public-layout.css'
})
export class PublicLayout implements OnInit {
	private changeDetectorRef = inject(ChangeDetectorRef);
	private messageService = inject(MessageService);
	private optionMenuService = inject(OptionMenuService);
	private authService = inject(AuthService);
	private router = inject(Router);

	readonly authUser = this.authService.user;

	menuOptions: any[] = [
		{
			id: '',
			route: '',
			icon: 'home',
			text: 'Inicio',
			active: false
		},
		{
			id: 'suggestioninsert',
			route: '/suggestion/insert',
			icon: 'bookmark',
			text: 'Sugerencias',
			active: false
		},
		{
			id: 'complaintinsert',
			route: '/complaint/insert',
			icon: 'shield',
			text: 'Quejas',
			active: false
		},
		{
			id: 'followup',
			route: '/follow-up/view',
			icon: 'book',
			text: 'Seguimiento',
			active: false
		},
	];

	profileItems: MenuItem[] = [
		{ label: 'Mi Perfil', icon: 'pi pi-user' },
		{ label: 'Ajustes', icon: 'pi pi-sliders-h' },
		{ separator: true },
		{ label: 'Cerrar Sesión', icon: 'pi pi-sign-out', command: () => this.logout() }
	];

	ngOnInit(): void {
		this.optionMenuService.data$().pipe(delay(0)).subscribe({
			next: (response: any) => {
				this.menuOptions.map(x => x.active = false);

				this.menuOptions.every((element: any) => {
					if(element.id == response) {
						element.active = true;

						return false;
					}

					return true;
				});

				this.changeDetectorRef.markForCheck();
				this.changeDetectorRef.detectChanges();
			}
		});
	}

	get visibleMenuOptions(): any[] {
		if(this.authUser()?.role === ROLE_ENCARGADO) {
			return [
				...this.menuOptions,
				{
					id: 'adminpanel',
					route: '/admin/panel',
					icon: 'shield',
					text: 'Panel Administrativo',
					active: false
				}
			];
		}

		return this.menuOptions;
	}

	logout(): void {
		this.authService.clear();

		this.messageService.add({ severity: 'info', summary: 'Correcto!', detail: 'Sesión cerrada correctamente.', life: 5000 });

		this.router.navigate(['/user/login']);

		this.changeDetectorRef.markForCheck();
		this.changeDetectorRef.detectChanges();
	}
}