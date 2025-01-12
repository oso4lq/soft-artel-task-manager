// app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './shared/components/auth/login/login.component';
import { RegisterComponent } from './shared/components/auth/register/register.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/main', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'main', component: MainPageComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '' }
];
