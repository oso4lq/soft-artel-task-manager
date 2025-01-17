// src/app/core/services/indexed-db.service.ts

import Dexie, { Table } from 'dexie';
import { TaskCard } from '../../shared/models/task.models';
import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { UserData } from '../../shared/models/users.model';

@Injectable({ providedIn: 'root' })
export class IndexedDbService {

    private db = new MyDexie();

    // TASK methods
    async getAllTasks(): Promise<TaskCard[]> {
        console.log('getAllTasks');
        return this.db.tasks.toArray();
    }

    async putTask(task: TaskCard) {
        console.log('putTask', task);
        await this.db.tasks.put(task);
    }

    async bulkPutTasks(tasks: TaskCard[]): Promise<any> {
        console.log('bulkPutTasks', tasks);
        return this.db.tasks.bulkPut(tasks);
    }

    // TASK methods
    async getAllUsers(): Promise<UserData[]> {
        console.log('getAllUsers');
        return this.db.userDatas.toArray();
    }

    async putUser(user: UserData) {
        console.log('putUser', user);
        await this.db.userDatas.put(user);
    }

    async bulkPutUsers(users: UserData[]): Promise<any> {
        console.log('bulkPutUsers', users);
        return this.db.userDatas.bulkPut(users);
    }

    // AUTH methods
    // Save user in a frozen key 'currentUser'
    async saveAuthUser(user: User | null): Promise<void> {
        console.log('saveAuthUser', user);

        // Transform User into a simple object for Dexie
        const currentUser = user ?
            // user.uid : null;
            {
                uid: user.uid,
                // email: user.email,
                isAnonymous: user.isAnonymous,
            }
            : null;

        // If no user, delete currentUser
        if (!currentUser) {
            await this.db.auth.delete('currentUser');
            return;
        }

        await this.db.auth.put(currentUser, 'currentUser');
    }

    async getAuthUser(): Promise<User | null> {

        console.log('getAuthUser');
        const data = await this.db.auth.get('currentUser');

        if (!data) {
            console.log('no data');
            return null;
        }
        console.log(data);

        // Transform currentUser into the User-like object.
        // It's a bit redundant but may be used later.
        return {
            uid: data.uid,
            // email: data.email,
            isAnonymous: data.isAnonymous,
        } as User;
    }
}

export class MyDexie extends Dexie {

    tasks!: Table<TaskCard, string>;
    auth!: Table<any>; // maybe object with keyPath = &id
    userDatas!: Table<UserData, string>;

    constructor() {
        super('TaskManagerDB');
        // this.version(1).stores({
        //     tasks: 'taskKey, taskName, taskStatus, performerId',
        // });
        // this.version(2).stores({
        //     tasks: 'id, taskPath, taskName, taskType, taskKey, taskStatus, performerId, taskTime, createdAt',
        //     auth: '',
        // });
        this.version(3).stores({
            tasks: 'id, taskPath, taskName, taskType, taskKey, taskStatuses, currentTaskStatus, performerId, taskTime, createdAt, editedAt, deletedAt',
            auth: '',
            userDatas: 'id, username, img, email, telegram, tasks',
        });
    }
}
