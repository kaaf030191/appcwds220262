import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

import { Api } from '../../../api/api';
import { apiadmincomplaintgetall, apiadminsuggestiongetall } from '../../../api/functions';
import { AuthService } from '../../../security/auth.service';
import { OptionMenuService } from '../../../observable/option-menu/option-menu.service';
import { STATUS_TILES } from '../admin-status';

/** Los totales llegan del backend con estos mismos nombres (ver STATUS_TILES). */
type SectionTotals = {
	totalPending: number;
	totalSeen: number;
	totalCoordination: number;
	totalRefused: number;
	totalClose: number;
	total: number;
};

const EMPTY_TOTALS: SectionTotals = {
	totalPending: 0,
	totalSeen: 0,
	totalCoordination: 0,
	totalRefused: 0,
	totalClose: 0,
	total: 0
};

const TONE_CLASSES = ['status-pending', 'status-seen', 'status-coordination', 'status-refused', 'status-close'];
const TONE_ICONS = ['pi pi-clock', 'pi pi-eye', 'pi pi-share-alt', 'pi pi-times-circle', 'pi pi-check-circle'];

@Component({
	selector: 'app-admin-dashboard',
	imports: [RouterLink, ButtonModule, SkeletonModule],
	templateUrl: './admin-dashboard.html',
	styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
	private api = inject(Api);
	private authService = inject(AuthService);
	private messageService = inject(MessageService);
	private optionMenuService = inject(OptionMenuService);
	private changeDetectorRef = inject(ChangeDetectorRef);

	readonly user = this.authService.user;
	readonly tiles = STATUS_TILES;

	readonly loading = signal(true);
	readonly complaintTotals = signal<SectionTotals>({ ...EMPTY_TOTALS });
	readonly suggestionTotals = signal<SectionTotals>({ ...EMPTY_TOTALS });

	ngOnInit(): void {
		this.optionMenuService.sendData('adminpanel');

		this.getData();
	}

	getData(): void {
		this.loading.set(true);

		Promise.all([
			this.api.invoke(apiadmincomplaintgetall, { body: { status: '' } }),
			this.api.invoke(apiadminsuggestiongetall, { body: { status: '' } })
		]).then(([complaintResponse, suggestionResponse]) => {
			const complaintData = this.parse(complaintResponse);
			const suggestionData = this.parse(suggestionResponse);

			if(complaintData?.type === 'success') {
				this.complaintTotals.set(this.mapTotals(complaintData));
			}

			if(suggestionData?.type === 'success') {
				this.suggestionTotals.set(this.mapTotals(suggestionData));
			}

			this.finish();
		}).catch(() => {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'No se pudo conectar con el servidor.'
			});

			this.finish();
		});
	}

	/** Nombre de la clase de color, derivado del índice del tile. */
	toneFor(index: number): string {
		return TONE_CLASSES[index] ?? 'status-unknown';
	}

	iconFor(index: number): string {
		return TONE_ICONS[index] ?? 'pi pi-circle';
	}

	valueOf(totals: SectionTotals, key: string): number {
		return totals[key as keyof SectionTotals] ?? 0;
	}

	totalOf(totals: SectionTotals): number {
		return totals.total;
	}

	private finish(): void {
		this.loading.set(false);

		this.changeDetectorRef.markForCheck();
		this.changeDetectorRef.detectChanges();
	}

	private parse(response: any): any {
		try {
			return typeof response === 'string' ? JSON.parse(response) : response;
		} catch {
			return null;
		}
	}

	private mapTotals(data: any): SectionTotals {
		return {
			totalPending: data.totalPending ?? 0,
			totalSeen: data.totalSeen ?? 0,
			totalCoordination: data.totalCoordination ?? 0,
			totalRefused: data.totalRefused ?? 0,
			totalClose: data.totalClose ?? 0,
			total: data.listData?.length ?? 0
		};
	}
}