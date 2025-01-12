// tasks.service.ts

import { inject, Injectable, signal } from '@angular/core';
import { TaskCard } from '../../shared/models/task.models';
import { Observable } from 'rxjs';
import { addDoc, collection, collectionData, deleteDoc, doc, DocumentReference, Firestore, updateDoc } from '@angular/fire/firestore';
import { TasksFirebaseService } from './tasks-firebase.service';

@Injectable({
    providedIn: 'root',
})

export class TasksService {

    // Signal to hold the tasks list
    tasksSig = signal<TaskCard[]>([]);

    constructor(
        private tasksFirebaseService: TasksFirebaseService,
    ) { }

    // Fetch the tasks from Firebase and set them in the signal
    loadTasks(): void {
        this.tasksFirebaseService.getTasks().subscribe((tasks: TaskCard[]) => {
            console.log('loadTasks ', tasks);
            this.tasksSig.set(tasks);
        })
    }

    // Add a new task, update the signal, and return the document reference with the auto-generated ID
    addTask(newTask: TaskCard): Promise<DocumentReference> {
        console.log('addTask', newTask);
        return this.tasksFirebaseService.addTask(newTask).then((docRef) => {
            // Set the generated ID in the newTask object
            newTask.id = docRef.id;

            // Update the tasks signal
            this.tasksSig.update((tasks) => [...tasks, newTask]);

            // Return the document reference
            return docRef;
        });
    }

    // Update a task (local and to Firebase)
    updateTask(updatedTask: TaskCard): void {
        console.log('updateTask', updatedTask);
        this.tasksFirebaseService.updateTask(updatedTask).then(() => {
            this.tasksSig.update((tasks) =>
                tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
        });
    }

    // Delete a task (local and from Firebase)
    deleteTask(taskId: string | number): void {
        console.log('deleteTask', taskId);
        this.tasksFirebaseService.deleteTask(taskId).then(() => {
            this.tasksSig.update((tasks) => tasks.filter((t) => t.id !== taskId));
        });
    }

}
