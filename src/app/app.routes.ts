import { Routes } from '@angular/router';
import { SuggestionInsert } from './page/suggestion/suggestion-insert/suggestion-insert';
import { ComplaintInsert } from './page/complaint/complaint-insert/complaint-insert';
import { Home } from './page/home/home';
import { FollowUpView } from './page/follow-up/view/view';

export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'suggestion/insert', component: SuggestionInsert },
	{ path: 'complaint/insert', component: ComplaintInsert },
	{ path: 'follow-up/view', component: FollowUpView }
];