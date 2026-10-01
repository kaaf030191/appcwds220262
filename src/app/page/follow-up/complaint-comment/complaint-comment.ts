import { ChangeDetectorRef, Component, ElementRef, inject, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Api } from '../../../api/api';
import { apicomplaintcommentgetbycode, apicomplaintcommentinsert, Apicomplaintcommentinsert$Params } from '../../../api/functions';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

@Component({
	selector: 'app-complaint-comment',
	imports: [
		FormsModule,
		ReactiveFormsModule,
		TextareaModule,
		ProgressSpinnerModule,
		TooltipModule,
		ButtonModule
],
	templateUrl: './complaint-comment.html',
	styleUrl: './complaint-comment.css',
})

export class ComplaintComment implements OnChanges {
	private changeDetectorRef = inject(ChangeDetectorRef);
	private elementRef = inject(ElementRef);
	private messageService = inject(MessageService);

	@Input() code: string = '';

	frmComplaintComment: FormGroup;

	frmComplaintCommentInitValue: any = {};

	listComplaintComment: any[] = [];

	listMessageComplaintComment: string[] = [];

	loadingComplaintComment: boolean = false;

	sendingComplaintComment: boolean = false;

	get descriptionComplaintCommentFb() { return this.frmComplaintComment.controls['description']; }

	constructor(
		private formBuilder: FormBuilder,
		private api: Api
	) {
		this.frmComplaintCommentInitValue = {
			'description': ''
		};

		this.frmComplaintComment = this.formBuilder.group({
			'description': [this.frmComplaintCommentInitValue.description, [Validators.required, Validators.maxLength(2000)]]
		});
	}

	ngOnChanges(): void {
		if(this.code == null || this.code.length != 7) {
			this.cleanComplaintComment();

			return;
		}

		this.getDataComplaintComment();
	}

	cleanComplaintComment(): void {
		this.listComplaintComment = [];
		this.listMessageComplaintComment = [];
		this.loadingComplaintComment = false;
		this.sendingComplaintComment = false;

		this.frmComplaintComment.reset(this.frmComplaintCommentInitValue);
	}

	getDataComplaintComment(scrollToBottom: boolean = false): void {
		this.loadingComplaintComment = true;

		this.changeDetectorRef.markForCheck();
		this.changeDetectorRef.detectChanges();

		this.api.invoke(apicomplaintcommentgetbycode, { code: this.code }).then((response: any) => {
			const apiResponseData = typeof response === 'string' ? JSON.parse(response) : response;

			this.listComplaintComment = apiResponseData.listComplaintComment;
			this.listMessageComplaintComment = apiResponseData.listMessage;

			this.loadingComplaintComment = false;

			this.changeDetectorRef.markForCheck();
			this.changeDetectorRef.detectChanges();

			if(scrollToBottom) {
				this.scrollToBottom();
			}
		}).catch((error: any) => {
			this.loadingComplaintComment = false;

			this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });

			this.changeDetectorRef.markForCheck();
			this.changeDetectorRef.detectChanges();
		});
	}

	private scrollToBottom(): void {
		let node: HTMLElement | null = this.elementRef.nativeElement;

		while(node != null) {
			const overflowY = getComputedStyle(node).overflowY;

			if((overflowY == 'auto' || overflowY == 'scroll') && node.scrollHeight > node.clientHeight) {
				node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });

				return;
			}

			node = node.parentElement;
		}

		window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
	}

	onKeyDownComplaintComment(event: Event): void {
		const keyboardEvent = event as KeyboardEvent;

		if(keyboardEvent.shiftKey) {
			return;
		}

		keyboardEvent.preventDefault();

		this.sendInsertComplaintComment();
	}

	sendInsertComplaintComment(): void {
		if(this.sendingComplaintComment) {
			return;
		}

		if(!this.frmComplaintComment.valid) {
			this.frmComplaintComment.markAllAsTouched();
			this.frmComplaintComment.markAsDirty();

			this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Escriba su comentario.' });

			return;
		}

		if(this.code == null || this.code.length != 7) {
			return;
		}

		const bodyParams: Apicomplaintcommentinsert$Params = {
			body: {
				code: this.code,
				description: this.descriptionComplaintCommentFb.value
			}
		};

		this.sendingComplaintComment = true;

		this.changeDetectorRef.markForCheck();
		this.changeDetectorRef.detectChanges();

		this.api.invoke(apicomplaintcommentinsert, bodyParams).then((response: any) => {
			const apiResponseData = typeof response === 'string' ? JSON.parse(response) : response;

			this.sendingComplaintComment = false;

			switch(apiResponseData.type) {
				case 'success':
					this.messageService.add({ severity: 'success', summary: 'Correcto', detail: apiResponseData.listMessage[0] });

					this.frmComplaintComment.reset(this.frmComplaintCommentInitValue);

					this.getDataComplaintComment(true);

					break;

				case 'warning':
					break;

				case 'error':
					this.messageService.add({ severity: 'error', summary: 'Error', detail: apiResponseData.listMessage[0] });

					break;

				case 'expcetion':
					break;
			}

			this.changeDetectorRef.markForCheck();
			this.changeDetectorRef.detectChanges();
		}).catch((error: any) => {
			this.sendingComplaintComment = false;

			this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });

			this.changeDetectorRef.markForCheck();
			this.changeDetectorRef.detectChanges();
		});
	}
}
