// new-task.component.ts

import { Component, EventEmitter, Output, OnInit, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductType, TaskCard, TaskStatus, TaskType } from '../../models/task.models';
import { TasksService } from '../../../core/services/tasks.service';
import { AuthService } from '../../../core/services/auth.service';
import { sortTaskStatuses } from '../../utils/task-status-utils';
import { UserData } from '../../models/users.model';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss'],
})
export class NewTaskComponent implements OnInit {

  @Output() closed = new EventEmitter<void>();

  // State
  userData: UserData | null = null; // Store the fetched user data
  public TaskStatus = TaskStatus; // Initiate an enum copy for internal use

  // Signals
  // currentUser: Signal<User | null | undefined> = computed(() => this.authService.currentUserSig()); // track the current user
  currentUserData: Signal<UserData | null> = computed(() => this.authService.currentUserDataSig()); // track the current user data

  // Store keys
  task: TaskCard = {
    id: '', // to add later (Firebase)
    taskPath: {
      projectName: '',
      productName: ProductType.WebSite, // default
      version: 1, // default
      feature: '',
    },
    taskName: '',
    taskType: TaskType.Frontend, // default
    taskKey: '',
    taskStatuses: [], // initiate an empty array, to fill with user-selected statuses
    currentTaskStatus: TaskStatus.Draft,
    performerId: null,
    inProgress: null,
    taskTime: {
      spent: '0',     // apply 0 при создании, только readonly
      planned: '1',   // 1 hour by default
    },
    createdAt: '', // to add later
  };

  // Набор флажков для статусов
  statusesCheckbox = {
    [TaskStatus.Approval]: false,
    [TaskStatus.Execution]: false,
    [TaskStatus.Review]: false,
    [TaskStatus.Deploy]: false,
    [TaskStatus.Testing]: false,
  };

  // Список TaskType и ProductType (для <select>), можно оформить Enum’ы через Object.values(...)
  // TaskType and ProductType lists for <select>
  taskTypes = Object.values(TaskType);
  productTypes = Object.values(ProductType);

  constructor(
    private tasksService: TasksService,
    private authService: AuthService,
  ) {
    // Use effect to watch for changes in currentUserData
    effect(() => {
      const data = this.currentUserData();
      if (data) {
        this.userData = data;
      } else {
        this.userData = null;
      }
    });
  }

  ngOnInit(): void {

    // Refactor using Signal. Fill with UID
    if (this.userData) {
      this.task.performerId = this.userData.id;
    }
  }

  closeModal() {
    // If closed without "create task" button, save this task as a draft
    this.createTask(true); 
    this.closed.emit();
  }

  async submit() {
    // Create task using button
    this.createTask(false);
  }

  private async createTask(isDraft: boolean) {
    // 1) Collect statuses
    const selectedStatuses: TaskStatus[] = [];
    for (const [statusKey, checked] of Object.entries(this.statusesCheckbox)) {
      if (checked) {
        selectedStatuses.push(statusKey as TaskStatus);
      }
    }

    // 2) Sort statuses with TaskStatusOrder
    this.task.taskStatuses = sortTaskStatuses(selectedStatuses);

    // 3) currentTaskStatus:
    // If isDraft=true => currentTaskStatus = "Черновик".
    // If "Сформировать задачу" button used => currentTaskStatus = "first status from taskStatuses"
    if (!isDraft && this.task.taskStatuses.length > 0) {
      this.task.currentTaskStatus = this.task.taskStatuses[0];
    } else {
      this.task.currentTaskStatus = TaskStatus.Draft;
    }

    // 4) createdAt
    this.task.createdAt = new Date().toISOString();

    // 5) Generate taskKey by taskType
    this.task.taskKey = await this.tasksService.generateTaskKey(this.task.taskType);

    // 6) Add task to Firebase
    try {
      const docRef = await this.tasksService.addTask(this.task);
      console.log('New task created with ID:', docRef.id);
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
    }

    // 7) Close modal only if clicked "Create task"
    if (!isDraft) {
      this.closed.emit();
    }
  }
}
