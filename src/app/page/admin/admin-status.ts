export const STATUS_OPTIONS = [
	{ label: 'Pendiente de revisión', value: 'Pendiente de revisión' },
	{ label: 'Visto', value: 'Visto' },
	{ label: 'En coordinación', value: 'En coordinación' },
	{ label: 'Rechazado', value: 'Rechazado' },
	{ label: 'Cerrado', value: 'Cerrado' }
];

export type StatusSeverity = 'warn' | 'info' | 'contrast' | 'danger' | 'success' | 'secondary';

export interface StatusTone {
	severity: StatusSeverity;
	cssVar: string;
	shortLabel: string;
}

/**
 * Un único lugar donde se decide cómo se ve cada estado.
 * Los totales del backend llegan con estos mismos nombres exactos.
 */
const TONES: Record<string, StatusTone> = {
	'Pendiente de revisión': { severity: 'warn', cssVar: 'status-pending', shortLabel: 'Pendientes' },
	'Visto': { severity: 'info', cssVar: 'status-seen', shortLabel: 'Vistas' },
	'En coordinación': { severity: 'contrast', cssVar: 'status-coordination', shortLabel: 'En coordinación' },
	'Rechazado': { severity: 'danger', cssVar: 'status-refused', shortLabel: 'Rechazadas' },
	'Cerrado': { severity: 'success', cssVar: 'status-close', shortLabel: 'Cerradas' }
};

const DEFAULT_TONE: StatusTone = {
	severity: 'secondary',
	cssVar: 'status-unknown',
	shortLabel: 'Otros'
};

export function toneOf(status: string): StatusTone {
	return TONES[status] ?? DEFAULT_TONE;
}

export function severityOf(status: string): StatusSeverity {
	return toneOf(status).severity;
}

/** Orden estable usado por el dashboard y por los tiles. */
export const STATUS_TILES: { key: string; label: string }[] = [
	{ key: 'totalPending', label: 'Pendientes' },
	{ key: 'totalSeen', label: 'Vistas' },
	{ key: 'totalCoordination', label: 'En coordinación' },
	{ key: 'totalRefused', label: 'Rechazadas' },
	{ key: 'totalClose', label: 'Cerradas' }
];