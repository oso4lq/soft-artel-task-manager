// tasks.service.ts

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TaskCard } from '../../shared/models/task.models';
import { Observable } from 'rxjs';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})

export class TasksService {
    // constructor(
    //     // private http: HttpClient,
    //     private firestore: Firestore,
    // ) { }

    //     // Temporarily mocking data using JSON from 'assets/tasks.mock.json'
    // public getTasks(): Observable<TaskCard[]> {
    //     return this.http.get<TaskCard[]>('assets/tasks.mock.json');
    // }


    firestore = inject(Firestore);
    tasksCollection = collection(this.firestore, 'tasks');

    // public getTasksFromFirestore(): Observable<TaskCard[]> {
    //     console.log('getTasksFromFirestore');
    //     return collectionData(this.tasksCollection, {
    //         idField: 'taskKey',
    //     }) as Observable<TaskCard[]>;
    // }

    public getTasksFromFirestore(): Observable<TaskCard[]> {
        const tasksRef = collection(this.firestore, 'tasks');
        return collectionData(tasksRef, { idField: 'taskKey' }) as Observable<TaskCard[]>;
    }

}
