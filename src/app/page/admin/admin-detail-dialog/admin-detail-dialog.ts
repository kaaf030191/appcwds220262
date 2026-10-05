import { Component, input, output } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';

import { severityOf } from '../admin-status';
import { formatDate, officeLabel, personLabel } from '../admin-format';

export type DetailSection = 'complaint' | 'suggestion';

/**
 * Modal de detalle. La descripción no vive en la tabla: se lee acá, junto al
 * resto de campos y, en el caso de las quejas, los comentarios.
 */
@Component({
	selector: 'app-admin-detail-dialog',
	imports: [DialogModule, TagModule, SkeletonModule],
	templateUrl: './admin-detail-dialog.html',
	styleUrl: './admin-detail-dialog.css'
})
export class AdminDetailDialog {
	readonly visible = input.required<boolean>();
	readonly visibleChange = output<boolean>();

	readonly section = input<DetailSection>('complaint');
	readonly row = input<any>(null);
	readonly comments = input<any[]>([]);
	readonly commentsLoading = input(false);

	readonly personLabel = personLabel;
	readonly officeLabel = officeLabel;
	readonly formatDate = formatDate;

	get isComplaint(): boolean {
		return this.section() === 'complaint';
	}

	get title(): string {
		return this.isComplaint ? 'Detalle de la queja' : 'Detalle de la sugerencia';
	}

	severityOf(status: string) {
		return severityOf(status);
	}

	trackByComment(_: number, comment: any): string {
		return comment.idComplaintcomment ?? String(_);
	}

	close(): void {
		this.visibleChange.emit(false);
	}
}