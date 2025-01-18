// src/app/core/store/users/users.actions.ts

import { createAction, props } from '@ngrx/store';
import { UserData } from '../../../shared/models/users.model';

// Load from Firestore
export const loadUsers = createAction('[Users] Load Users');
export const loadUsersSuccess = createAction(
    '[Users] Load Users Success',
    props<{ users: UserData[] }>()
);
export const loadUsersFailure = createAction(
    '[Users] Load Users Failure',
    props<{ error: any }>()
);

// Load from IndexedDB (offline)
export const loadUsersFromIndexedDb = createAction('[Users] Load Users From IndexedDB');
export const loadUsersFromIndexedDbSuccess = createAction(
    '[Users] Load Users From IndexedDB Success',
    props<{ users: UserData[] }>()
);
export const loadUsersFromIndexedDbFailure = createAction(
    '[Users] Load Users From IndexedDB Failure',
    props<{ error: any }>()
);

// Save to IndexedDB
export const saveUsersToIndexedDb = createAction(
    '[Users] Save Users To IndexedDB',
    props<{ users: UserData[] }>()
);
export const saveUsersToIndexedDbSuccess = createAction('[Users] Save Users To IndexedDB Success');
export const saveUsersToIndexedDbFailure = createAction(
    '[Users] Save Users To IndexedDB Failure',
    props<{ error: any }>()
);
