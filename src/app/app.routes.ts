import { Routes } from '@angular/router';
import { encargadoGuard } from './security/auth.guard';
import { anonymousGuard } from './security/anonymous.guard';

export const routes: Routes = [
	{
		// Shell público: topbar + contenido centrado. Envuelve todas las rutas de público/estudiante.
		path: '',
		loadComponent: () => import('./layout/public-layout/public-layout').then(m => m.PublicLayout),
		children: [
			{
				path: '',
				pathMatch: 'full',
				loadComponent: () => import('./page/home/home').then(m => m.Home)
			},
			{
				path: 'suggestion/insert',
				loadComponent: () => import('./page/suggestion/suggestion-insert/suggestion-insert').then(m => m.SuggestionInsert)
			},
			{
				path: 'complaint/insert',
				loadComponent: () => import('./page/complaint/complaint-insert/complaint-insert').then(m => m.ComplaintInsert)
			},
			{
				path: 'follow-up/view',
				loadComponent: () => import('./page/follow-up/view/view').then(m => m.FollowUpView)
			},
			{
				path: 'user/login',
				canActivate: [anonymousGuard],
				loadComponent: () => import('./page/user/user-login/user-login').then(m => m.UserLogin)
			},
			{
				path: 'user/register',
				canActivate: [anonymousGuard],
				loadComponent: () => import('./page/user/user-register/user-register').then(m => m.UserRegister)
			}
		]
	},
	{
		// Layout tipo AdminLTE: aside + topbar propios, exclusivo del Encargado.
		// Es una rama sister: no hereda el shell público.
		path: 'admin',
		canActivate: [encargadoGuard],
		loadComponent: () => import('./layout/admin-layout/admin-layout').then(m => m.AdminLayout),
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'panel'
			},
			{
				path: 'panel',
				loadComponent: () => import('./page/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
			},
			{
				path: 'quejas',
				loadComponent: () => import('./page/admin/admin-list/admin-list').then(m => m.AdminList),
				data: { section: 'complaint' }
			},
			{
				path: 'sugerencias',
				loadComponent: () => import('./page/admin/admin-list/admin-list').then(m => m.AdminList),
				data: { section: 'suggestion' }
			}
		]
	},
	{
		path: '**',
		redirectTo: ''
	}
];