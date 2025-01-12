// src/app/core/store/tasks/tasks.effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as TasksActions from './tasks.actions';
import { switchMap, map, catchError, of, tap } from 'rxjs';
import { TasksService } from '../../services/tasks.service';
import { IndexedDbService } from '../../services/indexed-db.service';
import { TaskCard } from '../../../shared/models/task.models';

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
    ) {
        // 1) Загрузка из Firestore
        this.loadTasks$ = createEffect(() =>
            this.actions$.pipe(
                ofType(TasksActions.loadTasks),
                switchMap(() =>
                    this.tasksService.getTasksFromFirestore().pipe(
                        map((tasks: TaskCard[]) => {
                            // Успешно получили
                            return TasksActions.loadTasksSuccess({ tasks });
                        }),
                        catchError((error) => of(TasksActions.loadTasksFailure({ error })))
                    )
                )
            )
        );

        // 2) При удачной загрузке из Firestore — сохраняем в IndexedDB
        this.saveTasksAfterLoad$ = createEffect(() =>
            this.actions$.pipe(
                ofType(TasksActions.loadTasksSuccess),
                map(({ tasks }) => TasksActions.saveTasksToIndexedDb({ tasks }))
            )
        );

        // 3) Собственно сохранение в IndexedDB
        this.saveTasksToIndexedDb$ = createEffect(() =>
            this.actions$.pipe(
                ofType(TasksActions.saveTasksToIndexedDb),
                switchMap(({ tasks }) =>
                    // Сохраняем все задачи в IndexedDB
                    this.indexedDbService.bulkPutTasks(tasks).then(
                        () => TasksActions.saveTasksToIndexedDbSuccess(),
                        (error) => TasksActions.saveTasksToIndexedDbFailure({ error })
                    )
                )
            )
        );

        // 4) Загрузка задач из IndexedDB (например, при оффлайне)
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

// // 1) Загрузка из Firestore
// loadTasks$ = createEffect(() =>
//     this.actions$.pipe(
//         ofType(TasksActions.loadTasks),
//         switchMap(() =>
//             this.tasksService.getTasksFromFirestore().pipe(
//                 map((tasks: TaskCard[]) => {
//                     // Успешно получили
//                     return TasksActions.loadTasksSuccess({ tasks });
//                 }),
//                 catchError((error) => of(TasksActions.loadTasksFailure({ error })))
//             )
//         )
//     )
// );

// // 2) При удачной загрузке из Firestore — сохраняем в IndexedDB
// saveTasksAfterLoad$ = createEffect(() =>
//     this.actions$.pipe(
//         ofType(TasksActions.loadTasksSuccess),
//         map(({ tasks }) => TasksActions.saveTasksToIndexedDb({ tasks }))
//     )
// );

// // 3) Собственно сохранение в IndexedDB
// saveTasksToIndexedDb$ = createEffect(() =>
//     this.actions$.pipe(
//         ofType(TasksActions.saveTasksToIndexedDb),
//         switchMap(({ tasks }) =>
//             // Сохраняем все задачи в IndexedDB
//             this.indexedDbService.bulkPutTasks(tasks).then(
//                 () => TasksActions.saveTasksToIndexedDbSuccess(),
//                 (error) => TasksActions.saveTasksToIndexedDbFailure({ error })
//             )
//         )
//     )
// );

// // 4) Загрузка задач из IndexedDB (например, при оффлайне)
// loadTasksFromIndexedDb$ = createEffect(() =>
//     this.actions$.pipe(
//         ofType(TasksActions.loadTasksFromIndexedDb),
//         switchMap(() =>
//             this.indexedDbService.getAllTasks().then(
//                 (tasks) => TasksActions.loadTasksFromIndexedDbSuccess({ tasks }),
//                 (error) => TasksActions.loadTasksFromIndexedDbFailure({ error })
//             )
//         )
//     )
// );

// constructor(
//     private actions$: Actions,
//     private tasksService: TasksService,
//     private indexedDbService: IndexedDbService,
// ) { }
// }
