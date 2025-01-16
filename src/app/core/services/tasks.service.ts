// tasks.service.ts

import { computed, Injectable, signal } from '@angular/core';
import { CounterDoc, TaskCard, TaskStatus, TaskType } from '../../shared/models/task.models';
import { doc, DocumentReference, Firestore, runTransaction } from '@angular/fire/firestore';
import { TasksFirebaseService } from './tasks-firebase.service';

@Injectable({
    providedIn: 'root',
})

export class TasksService {

    public TaskStatus = TaskStatus;

    // Signal to hold the tasks list
    tasksSig = signal<TaskCard[]>([]);

    // Arrange the tasks by their date (new first)
    arrangedTasksSig = computed(() => {
        const all = this.tasksSig();
        return [...all].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    });

    // Find the latest task
    lastTaskSig = computed(() => {
        // Exclude drafts from the task list
        const all = this.arrangedTasksSig().filter(t => t.currentTaskStatus !== TaskStatus.Draft);

        if (!all.length) {
            return null;
        }

        return all[0];
    });

    // Compile a short version of the latest task name
    shortLastTaskNameSig = computed(() => {
        const task = this.lastTaskSig();
        if (!task) return null;
        const name = task.taskName;
        return name.length > 47 ? name.slice(0, 47) + '...' : name;
    });

    // Map of prefixes for task types
    private readonly taskTypePrefixMap: { [key in TaskType]: string } = {
        [TaskType.Design]: 'COM',
        [TaskType.Analytics]: 'COM',
        [TaskType.Frontend]: 'DEV',
        [TaskType.Backend]: 'DEV',
        [TaskType.Testing]: 'TEST',
        [TaskType.BlockingBug]: 'BUG',
        [TaskType.CriticalBug]: 'BUG',
        [TaskType.MajorBug]: 'BUG',
        [TaskType.MinorBug]: 'BUG',
        [TaskType.TrivialBug]: 'BUG',
    };

    constructor(
        private tasksFirebaseService: TasksFirebaseService,
        private firestore: Firestore,
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

    // Generate a unique taskKey based on TaskType. Returns a Promise with a generated taskKey
    async generateTaskKey(taskType: TaskType): Promise<string> {
        const prefix = this.taskTypePrefixMap[taskType];
        if (!prefix) {
            throw new Error(`Неизвестный TaskType: ${taskType}`);
        }

        const counterDocRef = doc(this.firestore, `counters/${prefix}`);

        try {
            const taskKey = await runTransaction(this.firestore, async (transaction) => {
                const counterDocSnap = await transaction.get(counterDocRef);
                let nextNumber: number;

                if (!counterDocSnap.exists()) {
                    // If no document, initiate it
                    nextNumber = 1;
                    const newCounter: CounterDoc = { group: prefix, nextNumber: nextNumber + 1 };
                    transaction.set(counterDocRef, newCounter);
                } else {
                    const counterData = counterDocSnap.data() as CounterDoc;
                    nextNumber = counterData.nextNumber;
                    transaction.update(counterDocRef, { nextNumber: nextNumber + 1 });
                }

                // Format task number to XXX format
                const formattedNumber = String(nextNumber).padStart(3, '0');
                return `${prefix}-${formattedNumber}`;
            });

            return taskKey;
        } catch (error) {
            console.error('Ошибка при генерации taskKey:', error);
            throw new Error('Не удалось сгенерировать taskKey.');
        }
    }

}
