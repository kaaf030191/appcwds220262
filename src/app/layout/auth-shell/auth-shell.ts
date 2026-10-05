import { Component, input } from '@angular/core';

@Component({
	selector: 'app-auth-shell',
	templateUrl: './auth-shell.html',
	styleUrl: './auth-shell.css'
})
export class AuthShell {
	readonly eyebrow = input<string>('EPIIS');
	readonly title = input<string>('');
	readonly subtitle = input<string>('');
}