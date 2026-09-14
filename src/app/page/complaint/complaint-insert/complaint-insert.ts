import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Api } from '../../../api/api';
import { apiofficegetall, apicomplaintinsert, Apicomplaintinsert$Params, apiprofessorgetall } from '../../../api/functions';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OptionMenuService } from '../../../observable/option-menu/option-menu.service';

@Component({
	selector: 'app-complaint-insert',
	imports: [
		FormsModule,
		ReactiveFormsModule,
		InputTextModule,
		TextareaModule,
		ButtonModule,
		FileUploadModule,
		SelectModule,
		DatePickerModule,
		RadioButtonModule
	],
	templateUrl: './complaint-insert.html',
	styleUrl: './complaint-insert.css',
})

export class ComplaintInsert implements OnInit {
	private confirmationService = inject(ConfirmationService);
	private messageService = inject(MessageService);
	private optionMenuService = inject(OptionMenuService);

	frmInsertComplaint: FormGroup;

	frmInsertComplaintInitValue: any = {};

	listOffice: any[] = [];
	listProfessor: any[] = [];

	fileQuantity: number = 0;
	fileRowList: any[] = [];
	listFile: any[] = [];

	get personFullNameFb() { return this.frmInsertComplaint.controls['personFullName']; }
	get officeFb() { return this.frmInsertComplaint.controls['office']; }
	get professorFb() { return this.frmInsertComplaint.controls['professor']; }
	get radioComplaintTypeFb() { return this.frmInsertComplaint.controls['radioComplaintType']; }
	get descriptionFb() { return this.frmInsertComplaint.controls['description']; }
	get issueDateFb() { return this.frmInsertComplaint.controls['issueDate']; }

	constructor(
		private formBuilder: FormBuilder,
		private api: Api
	) {
		this.frmInsertComplaintInitValue = {
			'personFullName': '',
			'office': '',
			'professor': '',
			'radioComplaintType': 'Estudiante',
			'description': '',
			'issueDate': ''
		};

		this.frmInsertComplaint = this.formBuilder.group({
			'personFullName': [this.frmInsertComplaintInitValue.personFullName, []],
			'office': [this.frmInsertComplaintInitValue.office, [Validators.required]],
			'professor': [this.frmInsertComplaintInitValue.professor, [Validators.required]],
			'radioComplaintType': [this.frmInsertComplaintInitValue.radioComplaintType, [Validators.required]],
			'description': [this.frmInsertComplaintInitValue.description, [Validators.required]],
			'issueDate': [this.frmInsertComplaintInitValue.issueDate, [Validators.required]]
		});
	}

	ngOnInit(): void {
		this.initialization();
	}

	private initialization(): void {
		this.optionMenuService.sendData("complaintinsert");

		this.api.invoke(apiofficegetall).then((response: any) => {
			const apiResponseData = typeof response === 'string' ? JSON.parse(response) : response;

			this.listOffice = apiResponseData.listOffice;
		});

		this.api.invoke(apiprofessorgetall).then((response: any) => {
			const apiResponseData = typeof response === 'string' ? JSON.parse(response) : response;

			this.listProfessor = apiResponseData.listProfessor;
		});
	}

	onChangeRadioComplaintType(): void {
		this.professorFb.setValue('');
	}

	addFile(): void {
		this.fileQuantity++;

		this.fileRowList.push({
			'id': 'file' + this.fileQuantity
		});
	}

	removeFile(element: any): void {
		let tempElement = JSON.parse(JSON.stringify(element));

		let positionTemp = this.fileRowList.indexOf(element);

		this.fileRowList.splice(positionTemp, 1);

		let indexTemp = 0;

		this.listFile.every((value) => {
			if(value.name == tempElement.id) {
				return false;
			}

			indexTemp++;

			return true;
		});

		this.listFile.splice(indexTemp, 1);
	}

	onFileSelect(event: any, name: string): void {
		const file: Blob = event.currentFiles ? event.currentFiles[0] : event.files[0];

		this.listFile.push({
			'name': name,
			'file': file
		});
	}

	sendInsertComplaint(event: Event): void {
		if(!this.frmInsertComplaint.valid) {
			this.frmInsertComplaint.markAllAsTouched();
			this.frmInsertComplaint.markAsDirty();

			this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete y corrija todos los datos faltantes.' });

			return;
		}

		this.confirmationService.confirm({
			target: event.target as EventTarget,
			message: 'Confirmar operación?',
			header: 'Confirmación',
			icon: 'pi pi-info-circle',
			rejectLabel: 'Cancel',
			rejectButtonProps: {
				label: 'Cancelar',
				severity: 'secondary',
				outlined: true
			},
			acceptButtonProps: {
				label: 'Aceptar',
				severity: 'primary'
			},
			accept: () => {
				let filesToSend: Blob[] = [];

				this.listFile.forEach((element: any) => {
					filesToSend.push(element.file);
				});

				const bodyParams: Apicomplaintinsert$Params = {
					body: {
						idOffice: this.officeFb.value.idOffice,
						idProfessor: this.radioComplaintTypeFb.value == 'Docente' ? this.professorFb.value : undefined,
						complaintFullName: this.radioComplaintTypeFb.value == 'Docente' ? (this.listProfessor.filter(x => x.idProfessor == this.professorFb.value)[0].firstName + ' ' + this.listProfessor.filter(x => x.idProfessor == this.professorFb.value)[0].surName) : this.professorFb.value,
						personFullName: this.personFullNameFb.value,
						description: this.descriptionFb.value,
						issueDate: new Intl.DateTimeFormat('fr-CA').format(this.issueDateFb.value),
						files: filesToSend
					}
				};

				this.api.invoke(apicomplaintinsert, bodyParams).then((response: any) => {
					const apiResponseData = typeof response === 'string' ? JSON.parse(response) : response;
					switch(apiResponseData.type) {
						case 'success':
							this.messageService.add({ severity: 'success', summary: 'Correcto', detail: apiResponseData.listMessage[0] });

							this.fileQuantity = 0;
							this.fileRowList = [];
							this.listFile = [];

							this.frmInsertComplaint.reset(this.frmInsertComplaintInitValue);

							break;
						
						case 'warning':
							break;

						case 'error':
							break;

						case 'expcetion':
							break;
					}
				}).catch((error: any) => {
					this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
				});
			},
			reject: () => {}
		});
	}
}