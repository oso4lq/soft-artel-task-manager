// src/app/core/store/users/users.reducer.ts

import { createReducer, on } from '@ngrx/store';
import * as UsersActions from './users.actions';
import { UserData } from '../../../shared/models/users.model';

export interface UsersState {
    users: UserData[];
    loading: boolean;
    error: any;
}

const initialState: UsersState = {
    users: [],
    loading: false,
    error: null,
};

export const usersReducer = createReducer(
    initialState,

    on(UsersActions.loadUsers, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(UsersActions.loadUsersSuccess, (state, { users }) => ({
        ...state,
        users,
        loading: false,
        error: null,
    })),
    on(UsersActions.loadUsersFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    // Load from IndexedDB
    on(UsersActions.loadUsersFromIndexedDb, (state) => ({
        ...state,
        loading: true,
    })),
    on(UsersActions.loadUsersFromIndexedDbSuccess, (state, { users }) => ({
        ...state,
        users,
        loading: false,
        error: null,
    })),
    on(UsersActions.loadUsersFromIndexedDbFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    // Save to IndexedDB
    on(UsersActions.loadUsersFromIndexedDb, (state) => ({
        ...state,
        // loading=true
    })),
    on(UsersActions.loadUsersFromIndexedDbSuccess, (state) => ({
        ...state,
    })),
    on(UsersActions.loadUsersFromIndexedDbFailure, (state, { error }) => ({
        ...state,
        error,
    })),
);
