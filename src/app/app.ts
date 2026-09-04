import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Api } from './api/api';
import { apiindexindex } from './api/functions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('appcwds220262');

  tempData: any = {};

  constructor(
    private api: Api
  ) {}

  ngOnInit(): void {
    this.api.invoke(apiindexindex, {}).then((response: any) => {
      let data = typeof response == 'string' ? JSON.parse(response) : response;

      this.tempData = data;
    });
  }
}
