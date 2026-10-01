import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { OptionMenuService } from '../../../observable/option-menu/option-menu.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { Api } from '../../../api/api';
import { RadioButtonModule } from 'primeng/radiobutton';
import { apicomplaintgetbycode, apisuggestiongetbycode } from '../../../api/functions';
import { MessageService } from 'primeng/api';
import { NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ComplaintComment } from '../complaint-comment/complaint-comment';

@Component({
	selector: 'app-follow-up-view',
	imports: [
		FormsModule,
		ReactiveFormsModule,
		InputTextModule,
		InputMaskModule,
		RadioButtonModule,
		ButtonModule,
		NgClass,
		ComplaintComment
],
	templateUrl: './view.html',
	styleUrl: './view.css',
})

export class FollowUpView implements OnInit {
	private changeDetectorRef = inject(ChangeDetectorRef);
	private optionMenuService = inject(OptionMenuService);
	private messageService = inject(MessageService);

	frmFollowUp: FormGroup;

	frmFollowUpInitValue: any = {};

	dataReponse: any = {};

	get codeFb() { return this.frmFollowUp.controls['code']; }
	get typeFb() { return this.frmFollowUp.controls['type']; }
	get codeValue() { return this.codeFb.value.replaceAll('_', ''); }

	constructor(
		private formBuilder: FormBuilder,
		private api: Api
	) {
		this.frmFollowUpInitValue = {
			'code': '',
			'type': 'suggestion'
		};

		this.frmFollowUp = this.formBuilder.group({
			'code': [this.frmFollowUpInitValue.code, []],
			'type': [this.frmFollowUpInitValue.type, []]
		});
	}

	ngOnInit(): void {
		this.optionMenuService.sendData('followup');
	}

	onChangeType(): void {
		this.getDataSuggestionComplaint();
	}

	getDataSuggestionComplaint(): void {
		this.dataReponse = null;

		let codeValue = this.codeValue;

		if(codeValue.length == 7 && this.typeFb.value == 'suggestion') {
			this.api.invoke(apisuggestiongetbycode, { code: codeValue }).then((response: any) => {
				const apiResponseData = typeof response === 'string' ? JSON.parse(response) : response;

				switch(apiResponseData.type) {
					case 'success':
						this.dataReponse = apiResponseData;

						break;

					case 'warning':
						break;

					case 'error':
						break;

					case 'expcetion':
						break;
				}

				this.changeDetectorRef.markForCheck();
				this.changeDetectorRef.detectChanges();
			}).catch((error: any) => {
				this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
			});
		}

		if(codeValue.length == 7 && this.typeFb.value == 'complaint') {
			this.api.invoke(apicomplaintgetbycode, { code: codeValue }).then((response: any) => {
				const apiResponseData = typeof response === 'string' ? JSON.parse(response) : response;

				switch(apiResponseData.type) {
					case 'success':
						this.dataReponse = apiResponseData;

						break;

					case 'warning':
						break;

					case 'error':
						break;

					case 'expcetion':
						break;
				}

				this.changeDetectorRef.markForCheck();
				this.changeDetectorRef.detectChanges();
			}).catch((error: any) => {
				this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
			});
		}
	}

	showTimeLine(): boolean {
		return this.dataReponse != null && this.dataReponse.status != null && this.codeValue.length == 7
	}

	showComplaintComment(): boolean {
		return this.typeFb.value == 'complaint' && this.showTimeLine();
	}
}
