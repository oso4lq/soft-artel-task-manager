// src/app/core/store/auth/auth.reducer.ts

import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {

    // We can't use User because some of the Firebase keys are mutable
    // user: User | null;

    // So we create a user array to store some of the data in the Store
    // It is used in auth.effects.ts and indexed-db.service.ts
    user: {
        uid: string;
        // email: string | null;
        isAnonymous: boolean;
      } | null;
    loading: boolean; // For a pre-loader
    error: any;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
};

export const authReducer = createReducer(
    initialState,

    // Read from IndexedDB
    on(AuthActions.loadAuthFromIndexedDb, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(AuthActions.loadAuthFromIndexedDbSuccess, (state, { user }) => ({
        ...state,
        user,
        loading: false,
        error: null,
    })),
    on(AuthActions.loadAuthFromIndexedDbFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    // Save user from the Firebase to the Store
    on(AuthActions.setAuthUser, (state, { user }) => ({
        ...state,
        user,
    })),

    // Save to IndexedDB
    on(AuthActions.saveAuthToIndexedDb, (state) => ({
        ...state,
        // loading true for a pre-loader
    })),
    on(AuthActions.saveAuthToIndexedDbSuccess, (state) => ({
        ...state,
        // loading: false
    })),
    on(AuthActions.saveAuthToIndexedDbFailure, (state, { error }) => ({
        ...state,
        // loading: false,
        error,
    }))
);
