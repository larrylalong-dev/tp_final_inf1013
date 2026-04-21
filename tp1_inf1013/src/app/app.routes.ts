import { Routes } from '@angular/router';

import { authGuard } from './auth.guard';
import { AdDetailsComponent } from './pages/ad-details/ad-details.component';
import { AdFormComponent } from './pages/ad-form/ad-form.component';
import { AdsListComponent } from './pages/ads-list/ads-list.component';
import { LoginComponent } from './pages/login/login.component';
import { MyAdsComponent } from './pages/my-ads/my-ads.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
	{ path: '', component: AdsListComponent },
	{ path: 'ads/:id', component: AdDetailsComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
	{ path: 'my-ads', component: MyAdsComponent, canActivate: [authGuard] },
	{ path: 'my-ads/new', component: AdFormComponent, canActivate: [authGuard] },
	{ path: 'my-ads/:id/edit', component: AdFormComponent, canActivate: [authGuard] },
	{ path: '**', component: PageNotFoundComponent }
];
