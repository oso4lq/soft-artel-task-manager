// src/app/core/store/tasks/tasks.effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as TasksActions from './tasks.actions';
import { switchMap, map, catchError, of, tap } from 'rxjs';
import { TasksService } from '../../services/tasks.service';
import { IndexedDbService } from '../../services/indexed-db.service';
import { TaskCard } from '../../../shared/models/task.models';
import { TasksFirebaseService } from '../../services/tasks-firebase.service';

@Injectable()
export class TasksEffects {

    loadTasks$;
    saveTasksAfterLoad$;
    saveTasksToIndexedDb$;
    loadTasksFromIndexedDb$;

    constructor(
        private actions$: Actions,
        private tasksService: TasksService,
        private indexedDbService: IndexedDbService,
        private tasksFirebaseService: TasksFirebaseService,
    ) {
        // Load from Firestore
        this.loadTasks$ = createEffect(() =>
            this.actions$.pipe(
                ofType(TasksActions.loadTasks),
                switchMap(() =>
                    this.tasksFirebaseService.getTasks().pipe(
                        map((tasks: TaskCard[]) => {
                            return TasksActions.loadTasksSuccess({ tasks });
                        }),
                        catchError((error) => of(TasksActions.loadTasksFailure({ error })))
                    )
                )
            )
        );

        // If loaded from Firestore, then save to IndexedDB
        this.saveTasksAfterLoad$ = createEffect(() =>
            this.actions$.pipe(
                ofType(TasksActions.loadTasksSuccess),
                map(({ tasks }) => TasksActions.saveTasksToIndexedDb({ tasks }))
            )
        );

        // Save to IndexedDB
        this.saveTasksToIndexedDb$ = createEffect(() =>
            this.actions$.pipe(
                ofType(TasksActions.saveTasksToIndexedDb),
                switchMap(({ tasks }) =>
                    this.indexedDbService.bulkPutTasks(tasks).then(
                        () => TasksActions.saveTasksToIndexedDbSuccess(),
                        (error) => TasksActions.saveTasksToIndexedDbFailure({ error })
                    )
                )
            )
        );

        // Load from IndexedDB (offline cache)
        this.loadTasksFromIndexedDb$ = createEffect(() =>
            this.actions$.pipe(
                ofType(TasksActions.loadTasksFromIndexedDb),
                switchMap(() =>
                    this.indexedDbService.getAllTasks().then(
                        (tasks) => TasksActions.loadTasksFromIndexedDbSuccess({ tasks }),
                        (error) => TasksActions.loadTasksFromIndexedDbFailure({ error })
                    )
                )
            )
        );
    }
}
