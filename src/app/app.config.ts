// app.config.ts

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
// import { tasksReducer } from './core/store/tasks/tasks.reducer';
// import { TasksEffects } from './core/store/tasks/tasks.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    // default
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),

    // Firestore Database & Auth
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),

    // NgRx
    provideStore({
      // tasks: tasksReducer,
      // auth: authReducer,
    }),
    provideEffects([
      // TasksEffects
    ]),
  ]
};
