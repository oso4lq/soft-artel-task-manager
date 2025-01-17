// src/app/core/services/sync.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { IndexedDbService } from './indexed-db.service';
import { TasksFirebaseService } from './tasks-firebase.service';
import { UsersFirebaseService } from './users-firebase.service';
import { TaskCard } from '../../shared/models/task.models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  // Store connection state
  private online$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor(
    private indexedDbService: IndexedDbService,
    private tasksFirebaseService: TasksFirebaseService,
    private usersFirebaseService: UsersFirebaseService,
  ) {
    fromEvent(window, 'online').subscribe(() => {
      this.online$.next(true);
      this.handleOnline();
    });
    fromEvent(window, 'offline').subscribe(() => {
      this.online$.next(false);
      // handle offline case?
    });
  }

  isOnline(): boolean {
    return this.online$.value;
  }

  // Call when online
  private handleOnline() {

    this.syncAllData().then(() => {
      console.log('Синхронизация завершена');
    }).catch((error) => {
      console.error('Ошибка синхронизации:', error);
    });
  }

  // Start sync
  async syncAllData(): Promise<void> {
    await this.syncTasks();
    await this.syncUsers();
  }

  // Sync tasks
  private async syncTasks(): Promise<void> {
    // 1 - Get all tasks from IndexedDB
    const localTasks = await this.indexedDbService.getAllTasks();

    // 2 - Get all tasks from Firestore
    const remoteTasks = await firstValueFrom(this.tasksFirebaseService.getTasks());

    // 3 - Compare and merge
    await this.mergeTasks(localTasks, remoteTasks);
  }

  // Merge logic
  private async mergeTasks(localTasks: TaskCard[], remoteTasks: TaskCard[]): Promise<void> {
    const localMap = toMapById(localTasks);
    const remoteMap = toMapById(remoteTasks);

    const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

    for (let id of allIds) {
      const local = localMap.get(id);
      const remote = remoteMap.get(id);

      // Local true, server false
      if (local && !remote) {
        // The more the better: send locally saved task to Firestore
        if (!local.deletedAt) {
          await this.tasksFirebaseService.addTask(local);
        } else {
          // If local task is marked deletedAt, do nothing
        }
      }

      // Local false, server true
      else if (!local && remote) {
        // Add to IndexedDB
        await this.indexedDbService.putTask(remote);
      }

      // Local true, server true
      else if (local && remote) {

        // Compare editedAt
        const localEdited = new Date(local.editedAt || local.createdAt).getTime();
        const remoteEdited = new Date(remote.editedAt || remote.createdAt).getTime();

        // Mark if deleted
        const localIsDeleted = !!local.deletedAt;
        const remoteIsDeleted = !!remote.deletedAt;

        // (A) If one task was deleted, compare deletedAt/editedAt dates
        if (localIsDeleted && !remoteIsDeleted) {
          // local.deletedAt | remote.editedAt
          // Local is more fresh than remote => update Firestore
          await this.tasksFirebaseService.updateTask(local);
        } else if (!localIsDeleted && remoteIsDeleted) {
          // local.deletedAt | remote.editedAt
          // Remote is more fresh than local => update indexedDb
          await this.indexedDbService.putTask(remote);
        }
        // (B) Both deleted, compare deletedAt dates
        else if (localIsDeleted && remoteIsDeleted) {
          // const localDel = new Date(local.deletedAt).getTime();
          // const remoteDel = new Date(remote.deletedAt).getTime();
          const localDel = local.deletedAt ? new Date(local.deletedAt).getTime() : 0;
          const remoteDel = remote.deletedAt ? new Date(remote.deletedAt).getTime() : 0;
          if (localDel > remoteDel) {
            // Local is more fresh than remote => update Firestore
            await this.tasksFirebaseService.updateTask(local);
          } else if (localDel < remoteDel) {
            // Remote is more fresh than local => update indexedDb
            await this.indexedDbService.putTask(remote);
          }
          // Match => do nothing
        }
        // (C) Both not deleted, compare editedAt dates
        else {
          if (localEdited > remoteEdited) {
            // Local is more fresh than remote => update Firestore
            await this.tasksFirebaseService.updateTask(local);
          } else if (localEdited < remoteEdited) {
            // Remote is more fresh than local => update indexedDb
            await this.indexedDbService.putTask(remote);
          }
          // Match => do nothing
        }
      }
    }
  }

  // The same for users
  private async syncUsers(): Promise<void> {
    const localUsers = await this.indexedDbService.getAllUsers();
    const remoteUsers = await firstValueFrom(this.usersFirebaseService.getUsers());

    // Тут та же логика merge, но попроще, т. к. у пользователей нет deletedAt
    // Пример:
    // 1. toMapById()
    // 2. пройтись по объединённым ключам
    // 3. если userData нет на сервере — добавить
    // 4. если userData нет локально — записать
    // 5. если есть расхождения, нет поля deletedAt, значит можно сравнить updatedAt (если есть) или брать за основу server/ local
    //    и обновлять "отстающий" источник.
  }
}

// Helper
function toMapById(tasks: TaskCard[]): Map<string | null | undefined, TaskCard> {
  return new Map(tasks.map(t => [t.id, t]));
}
