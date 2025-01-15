// edit-task.component.ts

import { Component, EventEmitter, Output, OnInit, Input, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductType, TaskCard, TaskStatus, TaskType } from '../../models/task.models';
import { TasksService } from '../../../core/services/tasks.service';
import { AuthService } from '../../../core/services/auth.service';
import { sortTaskStatuses } from '../../utils/task-status-utils';
import { UserData } from '../../models/users.model';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss'],
})
export class EditTaskComponent implements OnInit {

  @Input() taskInput!: TaskCard;
  @Output() closed = new EventEmitter<void>();

  public TaskStatus = TaskStatus;
  errorMessage: string = '';

  // Signals
  currentUserData: Signal<UserData | null> = computed(() => this.authService.currentUserDataSig());
  userDatas: Signal<UserData[]> = computed(() => this.usersService.userDatasSig());

  // Local copy of a task
  task: TaskCard = {
    id: '',
    taskPath: {
      projectName: '',
      productName: ProductType.WebSite,
      version: 1,
      feature: '',
    },
    taskName: '',
    taskType: TaskType.Frontend,
    taskKey: '',
    taskStatuses: [],
    currentTaskStatus: TaskStatus.Draft,
    performerId: null,
    inProgress: null,
    taskTime: {
      spent: '0',
      planned: '1',
    },
    createdAt: '',
  };

  // Available statuses for checkboxes
  readonly statusesForCheckbox: TaskStatus[] = [
    TaskStatus.Approval,
    TaskStatus.Execution,
    TaskStatus.Review,
    TaskStatus.Deploy,
    TaskStatus.Testing,
  ];


  // Lists for <select>
  statusesCheckbox: Partial<Record<TaskStatus, boolean>> = {}; // Object may but not obliged to contain all TaskStatuses (subset)
  taskTypes = Object.values(TaskType);
  productTypes = Object.values(ProductType);

  constructor(
    private tasksService: TasksService,
    private usersService: UsersService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    if (!this.taskInput) {
      console.error('EditTaskComponent: нет входного TaskCard!');
      return;
    }

    // Local copy
    this.task = JSON.parse(JSON.stringify(this.taskInput)) as TaskCard;

    this.initStatusesCheckbox();
  }

  // Initiate checkboxes for this task statuses
  private initStatusesCheckbox(): void {

    // Create fields for specific statuses
    this.statusesForCheckbox.forEach((st) => {
      this.statusesCheckbox[st] = false;
    });

    // Copy selected statuses from task.taskStatuses
    this.task.taskStatuses.forEach((st) => {
      if (this.statusesCheckbox.hasOwnProperty(st)) {
        this.statusesCheckbox[st] = true;
      }
    });
  }

  // Close without saving
  public closeModal(): void {
    this.closed.emit();
  }

  // Update task in Firestore
  public async saveChanges(): Promise<void> {
    // 1 - Validation
    const missingFields = this.checkMissingFields();
    if (missingFields.length > 0) {
      const msg = 'Пожалуйста, укажите ' + missingFields.join(', ');
      this.showErrorMessage(msg);
      return;
    }

    // 2 - Read statuses from checkboxes and sort them
    const selectedStatuses: TaskStatus[] = [];
    for (const [statusKey, checked] of Object.entries(this.statusesCheckbox)) {
      if (checked) {
        selectedStatuses.push(statusKey as TaskStatus);
      }
    }
    this.task.taskStatuses = sortTaskStatuses(selectedStatuses);

    // 3 - Send updated task to Firestore
    try {
      // CAUTION: binding [(ngModel)]="task.currentTaskStatus"
      this.tasksService.updateTask(this.task);
      console.log('Задача успешно обновлена:', this.task.id);
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
    }

    // 4 - Close
    this.closed.emit();
  }

  // Delete task
  public async deleteTask(): Promise<void> {
    if (!this.task.id) {
      console.warn('Нечего удалять: у задачи нет id!');
      return;
    }

    try {
      await this.tasksService.deleteTask(this.task.id);
      console.log('Задача удалена:', this.task.id);
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
    }

    // Close
    this.closed.emit();
  }

  // Validation
  private checkMissingFields(): string[] {
    const missing: string[] = [];

    if (!this.task.taskName.trim()) {
      missing.push('название задачи');
    }
    if (!this.task.taskPath.projectName.trim()) {
      missing.push('название проекта');
    }
    if (!this.task.taskPath.productName) {
      missing.push('название продукта');
    }
    if (!this.task.taskPath.version) {
      missing.push('версию продукта');
    }
    if (!this.task.taskPath.feature.trim()) {
      missing.push('название фичи');
    }
    if (!this.task.taskType) {
      missing.push('тип задачи');
    }
    const selectedStatusesCount = Object.values(this.statusesCheckbox).filter((v) => v === true).length;
    if (selectedStatusesCount < 1) {
      missing.push('хотя бы 1 статус');
    }
    if (!this.task.taskTime.spent.trim()) {
      missing.push('затраченное на задачу время');
    }
    if (!this.task.taskTime.planned.trim()) {
      missing.push('ожидаемое время выполнения задачи');
    }

    return missing;
  }

  private showErrorMessage(msg: string) {
    this.errorMessage = msg;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  // Collect selected statuses and update task.taskStatuses
  onCheckboxChange(): void {
    const selected: TaskStatus[] = [];
    for (const [statusKey, checked] of Object.entries(this.statusesCheckbox)) {
      if (checked) {
        selected.push(statusKey as TaskStatus);
      }
    }
    this.task.taskStatuses = sortTaskStatuses(selected);
  }

}
