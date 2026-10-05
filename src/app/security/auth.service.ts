import { Injectable, signal } from '@angular/core';

export interface AuthenticatedUser {
	idUser: string;
	firstName: string;
	surName: string;
	email: string;
	role: string;
}

export const ROLE_ENCARGADO = 'Encargado';
export const ROLE_ESTUDIANTE = 'Estudiantes';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private readonly tokenKey = 'unamba.token';
	private readonly userKey = 'unamba.user';

	readonly token = signal<string | null>(localStorage.getItem(this.tokenKey));
	readonly user = signal<AuthenticatedUser | null>(this.readUser());

	isAuthenticated(): boolean {
		return !!this.token() && !!this.user();
	}

	isEncargado(): boolean {
		return this.user()?.role === ROLE_ENCARGADO;
	}

	store(token: string, user: AuthenticatedUser): void {
		localStorage.setItem(this.tokenKey, token);
		localStorage.setItem(this.userKey, JSON.stringify(user));

		this.token.set(token);
		this.user.set(user);
	}

	clear(): void {
		localStorage.removeItem(this.tokenKey);
		localStorage.removeItem(this.userKey);

		this.token.set(null);
		this.user.set(null);
	}

	fullName(): string {
		const user = this.user();

		return user ? `${user.firstName} ${user.surName}`.trim() : '';
	}

	private readUser(): AuthenticatedUser | null {
		const raw = localStorage.getItem(this.userKey);

		if(!raw) {
			return null;
		}

		try {
			return JSON.parse(raw) as AuthenticatedUser;
		} catch {
			localStorage.removeItem(this.userKey);

			return null;
		}
	}
}
