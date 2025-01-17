// src/app/core/store/auth/auth.actions.ts

import { createAction, props } from '@ngrx/store';

export const loadAuthFromIndexedDb = createAction(
    '[Auth] Load Auth From IndexedDB'
);

export const loadAuthFromIndexedDbSuccess = createAction(
    '[Auth] Load Auth From IndexedDB Success',
    props<{ user: any | null }>()
);

export const loadAuthFromIndexedDbFailure = createAction(
    '[Auth] Load Auth From IndexedDB Failure',
    props<{ error: any }>()
);

export const setAuthUser = createAction(
    '[Auth] Set Auth User',
    props<{ user: any | null }>()
);

export const saveAuthToIndexedDb = createAction(
    '[Auth] Save Auth To IndexedDB',
    props<{ user: any | null }>()
);

export const saveAuthToIndexedDbSuccess = createAction(
    '[Auth] Save Auth To IndexedDB Success'
);

export const saveAuthToIndexedDbFailure = createAction(
    '[Auth] Save Auth To IndexedDB Failure',
    props<{ error: any }>()
);
