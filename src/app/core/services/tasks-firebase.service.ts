// tasks-firebase.service.ts

import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, DocumentReference, Firestore, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { TaskCard } from '../../shared/models/task.models';

@Injectable({
  providedIn: 'root'
})
export class TasksFirebaseService {

  firestore = inject(Firestore);
  tasksCollection = collection(this.firestore, 'tasks');

  // Get the list of tasks from Firebase
  getTasks(): Observable<TaskCard[]> {
    console.log('getTasksFromFirestore');
    return collectionData(this.tasksCollection, {
      idField: 'id',
    }) as Observable<TaskCard[]>;
  }

  // Add a new task to Firebase and return the document reference
  addTask(newTask: TaskCard): Promise<DocumentReference> {
    console.log('addTask');
    return addDoc(this.tasksCollection, newTask);
  }

  // Update an existing task in Firebase
  updateTask(updatedTask: TaskCard): Promise<void> {
    console.log('updateTask');
    const taskDoc = doc(this.firestore, `tasks/${updatedTask.id}`);
    return updateDoc(taskDoc, { ...updatedTask });
  }

  // Delete a task from Firebase
  hardDeleteTask(taskId: string | number): Promise<void> {
    console.log('deleteTask');
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    return deleteDoc(taskDoc);
  }
}
