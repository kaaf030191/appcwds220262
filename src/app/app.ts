import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OptionMenuService } from './observable/option-menu/option-menu.service';
import { delay } from 'rxjs';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [
		CommonModule,
		RouterOutlet,
		RouterModule,
		ButtonModule,
		DrawerModule,
		MenuModule,
		AvatarModule,
		ToastModule,
		ConfirmDialogModule
	],
	templateUrl: './app.html',
	styleUrls: ['./app.css']
})
export class App implements OnInit {
	private changeDetectorRef = inject(ChangeDetectorRef);
	private messageService = inject(MessageService);
	private optionMenuService = inject(OptionMenuService);

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

	logout(): void {
		this.messageService.add({ severity: 'info', summary: 'Correcto!', detail: 'Sesión cerrada correctamente.', life: 5000 });
	}
}