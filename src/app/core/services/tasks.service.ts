// tasks.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TaskCard } from '../../shared/models/task.models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

export class TasksService {
    constructor(private http: HttpClient) { }

    public getTasks(): Observable<TaskCard[]> {
        // Temporarily mocking data using JSON from 'assets/tasks.mock.json'
        return this.http.get<TaskCard[]>('assets/tasks.mock.json');
    }
}
