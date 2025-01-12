// src/app/core/store/auth/auth.effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, map, catchError, of, tap } from 'rxjs';
import * as AuthActions from './auth.actions';
import { IndexedDbService } from '../../services/indexed-db.service';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthEffects {

    loadAuthFromIndexedDb$;
    setAuthUser$;
    saveAuthToIndexedDb$;

    constructor(
        private actions$: Actions,
        private store: Store,
        private authService: AuthService,
        private indexedDbService: IndexedDbService,
    ) {
        // Load user from the IndexedDB
        this.loadAuthFromIndexedDb$ = createEffect(() =>
            this.actions$.pipe(
                ofType(AuthActions.loadAuthFromIndexedDb),
                switchMap(() =>
                    this.indexedDbService.getAuthUser().then(
                        (user) => AuthActions.loadAuthFromIndexedDbSuccess({ user }),
                        (error) => AuthActions.loadAuthFromIndexedDbFailure({ error })
                    )
                )
            )
        );

        // When received the real Firebase User, transform it to the userData object
        this.setAuthUser$ = createEffect(() =>
            this.authService.user$.pipe(
                tap((user) => {
                    // Create flat userData object
                    const userData = user
                        ? {
                            uid: user.uid,
                            email: user.email,
                            isAnonymous: user.isAnonymous,
                        }
                        : null;

                    // Dispatch setAuthUser({ user: userData }) instead of default
                    this.store.dispatch(AuthActions.setAuthUser({ user: userData }));

                    // Save to the IndexedDB only userData
                    this.store.dispatch(AuthActions.saveAuthToIndexedDb({ user: userData }));
                }),
                map(() => ({ type: '[Auth] Noop' }))
            )
        );

        // Save user to the IndexedDB
        this.saveAuthToIndexedDb$ = createEffect(() =>
            this.actions$.pipe(
                ofType(AuthActions.saveAuthToIndexedDb),
                switchMap(({ user }) =>
                    this.indexedDbService.saveAuthUser(user).then(
                        () => AuthActions.saveAuthToIndexedDbSuccess(),
                        (error) => AuthActions.saveAuthToIndexedDbFailure({ error })
                    )
                )
            )
        );
    }
}