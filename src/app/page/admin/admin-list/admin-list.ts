import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { Api } from '../../../api/api';
import {
	apiadmincomplaintgetall,
	apiadmincomplaintupdatestatus,
	apiadminsuggestiongetall,
	apiadminsuggestionupdatestatus,
	apicomplaintcommentgetbycode
} from '../../../api/functions';
import { OptionMenuService } from '../../../observable/option-menu/option-menu.service';
import { STATUS_OPTIONS, StatusSeverity, toneOf } from '../admin-status';
import { AdminDetailDialog } from '../admin-detail-dialog/admin-detail-dialog';
import { formatDate, officeLabel, personLabel } from '../admin-format';

type Section = 'complaint' | 'suggestion';

@Component({
	selector: 'app-admin-list',
	imports: [
		NgClass,
		FormsModule,
		ButtonModule,
		SelectModule,
		TableModule,
TagModule,
		TooltipModule,
		AdminDetailDialog
	],
	templateUrl: './admin-list.html',
	styleUrl: './admin-list.css'
})
export class AdminList implements OnInit {
	private api = inject(Api);
	private route = inject(ActivatedRoute);
	private messageService = inject(MessageService);
	private optionMenuService = inject(OptionMenuService);
	private changeDetectorRef = inject(ChangeDetectorRef);

readonly statusOptions = STATUS_OPTIONS;
	readonly statusSteps = STATUS_OPTIONS;

	readonly personLabel = personLabel;
	readonly officeLabel = officeLabel;
	readonly formatDate = formatDate;

	readonly section = signal<Section>('complaint');
	readonly loading = signal(true);
	readonly rows = signal<any[]>([]);

	/** Código de la fila que se está actualizando, para bloquear el timeline mientras corre. */
	readonly updatingCode = signal('');

	readonly detailsVisible = signal(false);
	readonly detailsRow = signal<any>(null);
	readonly commentsLoading = signal(false);
	readonly comments = signal<any[]>([]);

	filterStatus: any = null;

	ngOnInit(): void {
		this.optionMenuService.sendData('adminpanel');

		this.route.data.subscribe(data => {
			const next = (data['section'] ?? 'complaint') as Section;

			if(next !== this.section()) {
				this.filterStatus = null;
				this.rows.set([]);
			}

			this.section.set(next);
			this.getData();
		});
	}

	get title(): string {
		return this.section() === 'complaint' ? 'Quejas' : 'Sugerencias';
	}

	get subtitle(): string {
		return this.section() === 'complaint'
			? 'Revisa, comenta y actualiza el estado de cada queja registrada.'
			: 'Revisa y actualiza el estado de cada sugerencia enviada.';
	}

	get emptyLabel(): string {
		return this.section() === 'complaint'
			? 'No hay quejas que coincidan con el filtro seleccionado.'
			: 'No hay sugerencias que coincidan con el filtro seleccionado.';
	}

	get hasFilter(): boolean {
		return !!this.filterStatus;
	}

/** Clase de color del estado, para pintar el nodo activo del timeline. */
	toneClassOf(status: string): string {
		return toneOf(status).cssVar;
	}

	/** Posición del estado dentro del recorrido. -1 si el backend devuelve algo desconocido. */
	stepIndex(status: string): number {
		return this.statusSteps.findIndex(step => step.value === status);
	}

	isBusy(row: any): boolean {
		return this.updatingCode() === this.trackByCode(0, row);
	}

	getData(): void {
		this.loading.set(true);

		// p-select con optionValue="value" entrega el string directamente en ngModel
		const status = this.filterStatus || '';

		if(this.section() === 'complaint') {
			this.api.invoke(apiadmincomplaintgetall, { body: { status } }).then(response => {
				this.applyList(this.parse(response), 'No se pudieron obtener las quejas.');
			}).catch(() => this.onError('No se pudo conectar con el servidor.'));

			return;
		}

		this.api.invoke(apiadminsuggestiongetall, { body: { status } }).then(response => {
			this.applyList(this.parse(response), 'No se pudieron obtener las sugerencias.');
		}).catch(() => this.onError('No se pudo conectar con el servidor.'));
	}

	clearFilter(): void {
		this.filterStatus = null;
		this.getData();
	}

	/** El timeline de la celda dispara el cambio de estado en el sitio, sin abrir nada más. */
	onUpdateStatus(row: any, status: string): void {
		if(!status || status === row.status || this.updatingCode()) {
			return;
		}

		this.updatingCode.set(this.trackByCode(0, row));

		const request = this.section() === 'complaint'
			? this.api.invoke(apiadmincomplaintupdatestatus, { body: { idParent: row.idComplaint, status } })
			: this.api.invoke(apiadminsuggestionupdatestatus, { body: { idParent: row.idSuggestion, status } });

		request.then(response => {
			this.applyStatus(this.parse(response), row, status);
		}).catch(() => this.onError('No se pudo conectar con el servidor.'));
	}

	/** "Ver detalles": la descripción y el resto del registro salen del modal, no de la tabla. */
	openDetails(row: any): void {
		this.detailsRow.set(row);
		this.detailsVisible.set(true);
		this.comments.set([]);

		if(this.section() !== 'complaint') {
			return;
		}

		this.commentsLoading.set(true);

		this.api.invoke(apicomplaintcommentgetbycode, { code: row.code }).then(response => {
			const data = this.parse(response);

			this.comments.set(data?.listComplaintComment ?? []);
			this.commentsLoading.set(false);

			this.changeDetectorRef.markForCheck();
			this.changeDetectorRef.detectChanges();
		}).catch(() => {
			this.commentsLoading.set(false);
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'No se pudieron obtener los comentarios.'
			});
		});
	}

trackByCode(_: number, row: any): string {
		return row.code ?? row.idSuggestion ?? row.idComplaint;
	}

	private applyList(data: any, fallback: string): void {
		if(data?.type === 'success') {
			this.rows.set(data.listData ?? []);
		} else {
			this.rows.set([]);
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: (data?.listMessage ?? [fallback]).join(' ')
			});
		}

		this.loading.set(false);

		this.changeDetectorRef.markForCheck();
		this.changeDetectorRef.detectChanges();
	}

	private applyStatus(data: any, row: any, requested: string): void {
		this.updatingCode.set('');

		if(data?.type === 'success') {
			row.status = data.status ?? requested;

			// El diálogo puede estar abierto con la misma fila: se refleja el cambio al instante.
			if(this.detailsRow()?.code === row.code) {
				this.detailsRow.set({ ...this.detailsRow(), status: row.status });
			}

			this.messageService.add({
				severity: 'success',
				summary: 'Correcto',
				detail: data.listMessage?.[0] ?? 'Estado actualizado.'
			});

			this.getData();
		} else {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: (data?.listMessage ?? ['No se pudo actualizar.']).join(' ')
			});

			this.changeDetectorRef.markForCheck();
			this.changeDetectorRef.detectChanges();
		}
	}

	private onError(detail: string): void {
		this.loading.set(false);
		this.updatingCode.set('');

		this.messageService.add({ severity: 'error', summary: 'Error', detail });

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
}