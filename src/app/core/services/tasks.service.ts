// tasks.service.ts

import { inject, Injectable } from '@angular/core';
import { TaskCard } from '../../shared/models/task.models';
import { Observable } from 'rxjs';
import { addDoc, collection, collectionData, deleteDoc, doc, DocumentReference, Firestore, updateDoc } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})

export class TasksService {

    firestore = inject(Firestore);
    tasksCollection = collection(this.firestore, 'tasks');

    // Get the list of tasks from Firebase
    public getTasksFromFirestore(): Observable<TaskCard[]> {
        console.log('getTasksFromFirestore');
        return collectionData(this.tasksCollection, {
            idField: 'id',
        }) as Observable<TaskCard[]>;
    }

    // Add a new task to Firebase and return the document reference
    addTask(newTask: TaskCard): Promise<DocumentReference> {
        return addDoc(this.tasksCollection, newTask);
    }

    // Update an existing task in Firebase
    updateTask(updatedTask: TaskCard): Promise<void> {
        const taskDoc = doc(this.firestore, `tasks/${updatedTask.id}`);
        return updateDoc(taskDoc, { ...updatedTask });
    }

    // Delete a task from Firebase
    deleteTask(taskId: string | number): Promise<void> {
        const taskDoc = doc(this.firestore, `tasks/${taskId}`);
        return deleteDoc(taskDoc);
    }

}
