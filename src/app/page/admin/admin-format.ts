/**
 * Helpers puros de presentación, compartidos por la tabla y el modal de detalle.
 * Viven fuera de los componentes porque los dos necesitan el mismo formato.
 */

export function personLabel(row: any): string {
	return row?.personFullName?.trim() ? row.personFullName : 'Anónimo';
}

export function officeLabel(row: any): string {
	return row?.officeName?.trim() ? row.officeName : 'Sin oficina';
}

/** "2026-09-29 18:44:45.0" -> "29/09/2026 18:44" */
export function formatDate(value?: string | null): string {
	if(!value?.trim()) {
		return '—';
	}

	const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);

	if(!match) {
		return value;
	}

	const [, year, month, day, hour, minute] = match;

	return `${day}/${month}/${year} ${hour}:${minute}`;
}