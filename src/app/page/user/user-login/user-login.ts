import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';

import { Api } from '../../../api/api';
import { apiuserlogin, Apiuserlogin$Params } from '../../../api/functions';
import { AuthService } from '../../../security/auth.service';
import { AuthShell } from '../../../layout/auth-shell/auth-shell';

@Component({
	selector: 'app-user-login',
	imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, IconFieldModule, InputIconModule, RouterLink, AuthShell],
	templateUrl: './user-login.html',
	styleUrl: './user-login.css'
})
export class UserLogin implements OnInit {
	private formBuilder = inject(FormBuilder);
	private api = inject(Api);
	private authService = inject(AuthService);
	private messageService = inject(MessageService);
	private router = inject(Router);
	private activatedRoute = inject(ActivatedRoute);
	private changeDetectorRef = inject(ChangeDetectorRef);

	sending: boolean = false;

	frmLogin: FormGroup;

	get emailFb() { return this.frmLogin.controls['email']; }
	get passwordFb() { return this.frmLogin.controls['password']; }

	showError(control: AbstractControl, error: string): boolean {
		return (control.touched || control.dirty) && control.hasError(error);
	}

	constructor() {
		this.frmLogin = this.formBuilder.group({
			'email': ['', [Validators.required, Validators.email]],
			'password': ['', [Validators.required]]
		});
	}

	ngOnInit(): void {
		this.activatedRoute.queryParamMap.subscribe(params => {
			const reason = params.get('reason');
			const messages: Record<string, string> = {
				unauthenticated: 'Debe iniciar sesión para ingresar al panel administrativo.',
				forbidden: 'Su cuenta no cuenta con permisos para acceder a esa sección.',
				expired: 'Su sesión expiró, por favor inicie sesión nuevamente.'
			};

			if(reason && messages[reason]) {
				this.messageService.add({ severity: 'warn', summary: 'Acceso restringido', detail: messages[reason] });
			}
		});
	}

	sendLogin(): void {
		if(!this.frmLogin.valid) {
			this.frmLogin.markAllAsTouched();
			this.frmLogin.markAsDirty();

			this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete y corrija todos los datos faltantes.' });

			return;
		}

		this.sending = true;
		this.changeDetectorRef.detectChanges();

		const params: Apiuserlogin$Params = {
			body: {
				email: this.emailFb.value,
				password: this.passwordFb.value
			}
		};

		this.api.invoke(apiuserlogin, params).then((response: any) => {
			const apiResponseData = typeof response === 'string' ? JSON.parse(response) : response;

			this.sending = false;

			if(apiResponseData.type === 'success') {
				this.authService.store(apiResponseData.token, {
					idUser: apiResponseData.idUser,
					firstName: apiResponseData.firstName,
					surName: apiResponseData.surName,
					email: apiResponseData.email,
					role: apiResponseData.role
				});

				this.messageService.add({ severity: 'success', summary: 'Correcto', detail: apiResponseData.listMessage[0] });

				this.router.navigate([this.authService.isEncargado() ? '/admin/panel' : '/']);
			} else if(apiResponseData.type === 'error' || apiResponseData.type === 'warning') {
				const detail = Array.isArray(apiResponseData.listMessage) && apiResponseData.listMessage.length
					? apiResponseData.listMessage.join(' ')
					: 'Las credenciales ingresadas son incorrectas.';

				this.messageService.add({ severity: 'error', summary: 'Error', detail });
			} else {
				this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
			}

			this.changeDetectorRef.markForCheck();
			this.changeDetectorRef.detectChanges();
		}).catch(() => {
			this.sending = false;

			this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'No se pudo conectar con el servidor.' });

			this.changeDetectorRef.markForCheck();
			this.changeDetectorRef.detectChanges();
		});
	}
}
