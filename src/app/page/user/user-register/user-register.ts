import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';

import { Api } from '../../../api/api';
import { apiuserregister, Apiuserregister$Params } from '../../../api/functions';
import { AuthShell } from '../../../layout/auth-shell/auth-shell';

@Component({
	selector: 'app-user-register',
	imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, IconFieldModule, InputIconModule, RouterLink, AuthShell],
	templateUrl: './user-register.html',
	styleUrl: './user-register.css'
})
export class UserRegister {
	private formBuilder = inject(FormBuilder);
	private api = inject(Api);
	private messageService = inject(MessageService);
	private router = inject(Router);
	private changeDetectorRef = inject(ChangeDetectorRef);

	sending: boolean = false;

	frmRegister: FormGroup;

	get firstNameFb() { return this.frmRegister.controls['firstName']; }
	get surNameFb() { return this.frmRegister.controls['surName']; }
	get emailFb() { return this.frmRegister.controls['email']; }
	get passwordFb() { return this.frmRegister.controls['password']; }

	showError(control: AbstractControl, error: string): boolean {
		return (control.touched || control.dirty) && control.hasError(error);
	}

	constructor() {
		this.frmRegister = this.formBuilder.group({
			'firstName': ['', [Validators.required]],
			'surName': ['', [Validators.required]],
			'email': ['', [Validators.required, Validators.email]],
			'password': ['', [Validators.required, Validators.minLength(6)]]
		});
	}

	sendRegister(): void {
		if(!this.frmRegister.valid) {
			this.frmRegister.markAllAsTouched();
			this.frmRegister.markAsDirty();

			this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete y corrija todos los datos faltantes.' });

			return;
		}

		this.sending = true;
		this.changeDetectorRef.detectChanges();

		const params: Apiuserregister$Params = {
			body: {
				firstName: this.firstNameFb.value,
				surName: this.surNameFb.value,
				email: this.emailFb.value,
				password: this.passwordFb.value
			}
		};

		this.api.invoke(apiuserregister, params).then((response: any) => {
			const apiResponseData = typeof response === 'string' ? JSON.parse(response) : response;

			this.sending = false;

			if(apiResponseData.type === 'success') {
				this.messageService.add({ severity: 'success', summary: 'Correcto', detail: apiResponseData.listMessage[0] });

				this.router.navigate(['/user/login'], { queryParams: { registered: '1' } });
			} else if(apiResponseData.type === 'error' || apiResponseData.type === 'warning') {
				const detail = Array.isArray(apiResponseData.listMessage) && apiResponseData.listMessage.length
					? apiResponseData.listMessage.join(' ')
					: 'No se pudo completar el registro.';

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
