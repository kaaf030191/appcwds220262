import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideApiConfiguration } from './api/api-configuration';
import { environment } from './environments/environments';
import { providePrimeNG } from 'primeng/config';

import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { ConfirmationService, MessageService } from 'primeng/api';

const MyCustomPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{slate.50}',
            100: '{slate.100}',
            200: '{slate.200}',
            300: '{slate.300}',
            400: '{slate.400}',
            500: '{slate.900}',
            600: '{slate.800}',
            700: '{slate.700}',
            800: '{slate.600}',
            900: '{slate.500}',
            950: '{slate.400}'
        }
    }
});

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(routes),
		provideHttpClient(),
		provideApiConfiguration(environment.urlBase),
		providePrimeNG({
            theme: {
                preset: MyCustomPreset,
				options: {
					darkModeSelector: '.my-app-dark'
				}
            }
        }),
		MessageService,
        ConfirmationService
	]
};