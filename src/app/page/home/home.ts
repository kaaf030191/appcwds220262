import { Component, inject, OnInit } from '@angular/core';
import { OptionMenuService } from '../../observable/option-menu/option-menu.service';

@Component({
	selector: 'app-home',
	imports: [],
	templateUrl: './home.html',
	styleUrl: './home.css',
})

export class Home implements OnInit {
	private optionMenuService = inject(OptionMenuService);

	ngOnInit(): void {
		this.optionMenuService.sendData('');
	}
}