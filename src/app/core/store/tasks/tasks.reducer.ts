// src/app/core/store/tasks/tasks.reducer.ts

import { createReducer, on } from '@ngrx/store';
import { TaskCard } from '../../../shared/models/task.models';
import * as TasksActions from './tasks.actions';

export interface TasksState {
    tasks: TaskCard[];
    loading: boolean;
    error: any;
}

const initialState: TasksState = {
    tasks: [],
    loading: false,
    error: null,
};

export const tasksReducer = createReducer(
    initialState,

    on(TasksActions.loadTasks, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(TasksActions.loadTasksSuccess, (state, { tasks }) => ({
        ...state,
        tasks,
        loading: false,
        error: null,
    })),
    on(TasksActions.loadTasksFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    // Load from IndexedDB
    on(TasksActions.loadTasksFromIndexedDb, (state) => ({
        ...state,
        loading: true,
    })),
    on(TasksActions.loadTasksFromIndexedDbSuccess, (state, { tasks }) => ({
        ...state,
        tasks,
        loading: false,
        error: null,
    })),
    on(TasksActions.loadTasksFromIndexedDbFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    // Save to IndexedDB
    on(TasksActions.saveTasksToIndexedDb, (state) => ({
        ...state,
        // loading=true
    })),
    on(TasksActions.saveTasksToIndexedDbSuccess, (state) => ({
        ...state,
    })),
    on(TasksActions.saveTasksToIndexedDbFailure, (state, { error }) => ({
        ...state,
        error,
    })),
);
