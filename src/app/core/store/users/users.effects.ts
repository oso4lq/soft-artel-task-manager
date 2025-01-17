// src/app/core/store/users/users.effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as UsersActions from './users.actions';
import { switchMap, map, catchError, of, tap } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { IndexedDbService } from '../../services/indexed-db.service';
import { UsersFirebaseService } from '../../services/users-firebase.service';
import { UserData } from '../../../shared/models/users.model';

@Injectable()
export class UsersEffects {

    loadUsers$;
    saveUsersAfterLoad$;
    saveUsersToIndexedDb$;
    loadUsersFromIndexedDb$;

    constructor(
        private actions$: Actions,
        private usersService: UsersService,
        private indexedDbService: IndexedDbService,
        private usersFirebaseService: UsersFirebaseService,
    ) {
        // Load from Firestore
        this.loadUsers$ = createEffect(() =>
            this.actions$.pipe(
                ofType(UsersActions.loadUsers),
                switchMap(() =>
                    this.usersFirebaseService.getUsers().pipe(
                        map((users: UserData[]) => {
                            return UsersActions.loadUsersSuccess({ users });
                        }),
                        catchError((error) => of(UsersActions.loadUsersFailure({ error })))
                    )
                )
            )
        );

        // If loaded from Firestore, then save to IndexedDB
        this.saveUsersAfterLoad$ = createEffect(() =>
            this.actions$.pipe(
                ofType(UsersActions.loadUsersSuccess),
                map(({ users }) => UsersActions.saveUsersToIndexedDb({ users }))
            )
        );

        // Save to IndexedDB
        this.saveUsersToIndexedDb$ = createEffect(() =>
            this.actions$.pipe(
                ofType(UsersActions.saveUsersToIndexedDb),
                switchMap(({ users }) =>
                    this.indexedDbService.bulkPutUsers(users).then(
                        () => UsersActions.saveUsersToIndexedDbSuccess(),
                        (error) => UsersActions.saveUsersToIndexedDbFailure({ error })
                    )
                )
            )
        );

        // Load from IndexedDB (offline cache)
        this.loadUsersFromIndexedDb$ = createEffect(() =>
            this.actions$.pipe(
                ofType(UsersActions.loadUsersFromIndexedDb),
                switchMap(() =>
                    this.indexedDbService.getAllUsers().then(
                        (users) => UsersActions.loadUsersFromIndexedDbSuccess({ users }),
                        (error) => UsersActions.loadUsersFromIndexedDbFailure({ error })
                    )
                )
            )
        );
    }
}
