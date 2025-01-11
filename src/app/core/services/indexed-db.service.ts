// indexed-db.service.ts

import Dexie, { Table } from 'dexie';
import { TaskCard } from '../../shared/models/task.models';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IndexedDbService {
    private db = new MyDexie();

    async getAllTasks(): Promise<TaskCard[]> {
        return await this.db.tasks.toArray();
    }

    async putTask(task: TaskCard) {
        await this.db.tasks.put(task);
    }

    // ... etc
}

export class MyDexie extends Dexie {
    tasks!: Table<TaskCard, string>;
    // second param -> primary key type (string for taskKey, or number if auto-generated)

    constructor() {
        super('TaskManagerDB'); // имя БД
        this.version(1).stores({
            tasks: 'taskKey, taskName, taskStatus, performerId',
            // или нужные индексы
        });
    }
}
