// src/app/core/store/tasks/tasks.actions.ts

import { createAction, props } from '@ngrx/store';
import { TaskCard } from '../../../shared/models/task.models';

// Load from Firestore
export const loadTasks = createAction('[Tasks] Load Tasks');
export const loadTasksSuccess = createAction(
    '[Tasks] Load Tasks Success',
    props<{ tasks: TaskCard[] }>()
);
export const loadTasksFailure = createAction(
    '[Tasks] Load Tasks Failure',
    props<{ error: any }>()
);

// Load from IndexedDB (offline)
export const loadTasksFromIndexedDb = createAction('[Tasks] Load Tasks From IndexedDB');
export const loadTasksFromIndexedDbSuccess = createAction(
    '[Tasks] Load Tasks From IndexedDB Success',
    props<{ tasks: TaskCard[] }>()
);
export const loadTasksFromIndexedDbFailure = createAction(
    '[Tasks] Load Tasks From IndexedDB Failure',
    props<{ error: any }>()
);

// Save to IndexedDB
export const saveTasksToIndexedDb = createAction(
    '[Tasks] Save Tasks To IndexedDB',
    props<{ tasks: TaskCard[] }>()
);
export const saveTasksToIndexedDbSuccess = createAction('[Tasks] Save Tasks To IndexedDB Success');
export const saveTasksToIndexedDbFailure = createAction(
    '[Tasks] Save Tasks To IndexedDB Failure',
    props<{ error: any }>()
);
