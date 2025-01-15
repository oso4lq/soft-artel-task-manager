// app.routes.ts

import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AuthGuard } from './core/guards/auth.guard';

// canActivate: [AuthGuard]
export const routes: Routes = [
    { path: '', redirectTo: '/main', pathMatch: 'full' },
    { path: 'main', component: MainPageComponent },
    { path: '**', redirectTo: '' }
];
