// new-task.component.ts

import { Component, EventEmitter, Output, OnInit, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductType, TaskCard, TaskStatus, TaskType } from '../../models/task.models';
import { TasksService } from '../../../core/services/tasks.service';
import { AuthService } from '../../../core/services/auth.service';
import { sortTaskStatuses } from '../../utils/task-status-utils';
import { UserData } from '../../models/users.model';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss'],
})
export class NewTaskComponent implements OnInit {

  @Output() closed = new EventEmitter<void>();

  // State
  // userData: UserData | null = null; // Store the fetched user data
  public TaskStatus = TaskStatus;
  errorMessage: string = '';

  // Signals
  // currentUser: Signal<User | null | undefined> = computed(() => this.authService.currentUserSig()); // track the current user
  currentUserData: Signal<UserData | null> = computed(() => this.authService.currentUserDataSig()); // track the current user data
  // userList = computed(() => this.usersService.userDatasSig());
  userDatas: Signal<UserData[]> = computed(() => this.usersService.userDatasSig()); // track the userDatas array

  // Initial task state
  private initialTaskState: TaskCard = {
    id: '', // Firebase will create it
    taskPath: {
      projectName: '', // User can change it
      productName: ProductType.WebSite, // User can change it
      version: 1, // User can change it
      feature: '', // User can change it
    },
    taskName: '', // User can change it
    taskType: TaskType.Frontend, // User can change it
    taskKey: '', // Will be generated automatically
    taskStatuses: [], // User will fill it with selected statuses
    currentTaskStatus: TaskStatus.Draft, // Will be selected automatically
    performerId: null, // User can change it, OR will be applied automatically
    inProgress: null, // Will not be changed
    taskTime: {
      spent: '0', // 0, readonly
      planned: '1', // User can change it
    },
    createdAt: '', // Will be generated automatically
  };

  // Task model (resets to initial state after closing the modal)
  task: TaskCard = { ...this.initialTaskState };

  // Status checkbox flags
  statusesCheckbox = {
    [TaskStatus.Approval]: false,
    [TaskStatus.Execution]: false,
    [TaskStatus.Review]: false,
    [TaskStatus.Deploy]: false,
    [TaskStatus.Testing]: false,
  };

  // TaskType and ProductType lists for <select>
  taskTypes = Object.values(TaskType);
  productTypes = Object.values(ProductType);

  constructor(
    private tasksService: TasksService,
    private usersService: UsersService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.task.performerId = this.currentUserData()?.id;
  }

  // If closed by clicking on "Close" button or clicking outside modal, save this task as a draft
  public async closeModal() {

    const isFormModified = this.isFormModified();

    if (!isFormModified) {
      console.log('Форма не изменена. Не сохраняем черновик.');
      this.closed.emit();
      this.resetForm();
      return;
    }

    await this.createTask(true);
    this.closed.emit();
    this.resetForm();
  }

  // Create task using button
  async submit() {

    const missingFields = this.checkMissingFields();
    if (missingFields.length > 0) {
      const msg = 'Пожалуйста, укажите ' + missingFields.join(', ');
      this.showErrorMessage(msg);
      return;
    }

    await this.createTask(false);
    this.closed.emit();
    this.resetForm();
  }

  private async createTask(isDraft: boolean) {

    // 1 - Collect selected statuses
    const selectedStatuses: TaskStatus[] = [];
    for (const [statusKey, checked] of Object.entries(this.statusesCheckbox)) {
      if (checked) {
        selectedStatuses.push(statusKey as TaskStatus);
      }
    }

    // 2 - Sort statuses with TaskStatusOrder
    this.task.taskStatuses = sortTaskStatuses(selectedStatuses);

    // 3 - If the task was saved as a draft, force apply performerId = current user
    if (isDraft) {
      if (this.currentUserData()) {
        this.task.performerId = this.currentUserData()?.id;
      }
    }

    // 4 - Define currentTaskStatus
    if (!isDraft && this.task.taskStatuses.length > 0) {
      this.task.currentTaskStatus = this.task.taskStatuses[0];
    } else {
      this.task.currentTaskStatus = TaskStatus.Draft;
    }

    // 5 - Generate createdAt
    this.task.createdAt = new Date().toISOString();

    // 6 - Generate taskKey by taskType
    this.task.taskKey = await this.tasksService.generateTaskKey(this.task.taskType);

    // 7 - Add task to Firebase
    try {
      const docRef = await this.tasksService.addTask(this.task);
      console.log('New task created with ID:', docRef.id);

      // 7.1 If the task has performerId, add this task ID to the userData/tasks of the user with performerId
      if (this.task.performerId) {
        this.appendTaskToUser(this.task.performerId, docRef.id);
      }
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
    }
  }

  // Find userData with a specific userId, add a new docId to userData/tasks, update
  private appendTaskToUser(userId: string | number, taskId: string) {
    // Find userId in userList
    const foundUser = this.userDatas().find(u => u.id === userId);
    if (!foundUser) {
      console.warn('Не нашли пользователя с id=', userId);
      return;
    }
    // UserData/tasks: string[]
    const updatedTasks = foundUser.tasks ? [...foundUser.tasks, taskId] : [taskId];

    // Updated object
    const updatedUserData: UserData = {
      ...foundUser,
      tasks: updatedTasks,
    };

    // Send to Firestore
    this.usersService.updateUserData(updatedUserData);
  }

  // Reset the form to its initial state after "submit" or "closeModal"
  private resetForm(): void {
    console.log('resetForm');
    // Reset the task fields
    this.task = { ...this.initialTaskState };

    // Reset the checkboxes
    this.statusesCheckbox = {
      [TaskStatus.Approval]: false,
      [TaskStatus.Execution]: false,
      [TaskStatus.Review]: false,
      [TaskStatus.Deploy]: false,
      [TaskStatus.Testing]: false,
    };
  }

  private isFormModified(): boolean {
    // 1 - Save current performerId before the check
    const savedPerformerId = this.task.performerId;

    // 2 - Null performerId before the check (===initialvalue)
    this.task.performerId = null;

    // 3 - Check current form and its initial state
    const current = JSON.stringify(this.task);
    const initial = JSON.stringify(this.initialTaskState);

    // 4 - Restore performerId
    this.task.performerId = savedPerformerId;

    // 5 - Result
    if (current !== initial) {
      return true;
    }

    // 6 Checkboxes
    const statusesModified = Object.values(this.statusesCheckbox).some(v => v === true);
    if (statusesModified) {
      return true;
    }

    // If all match, the form was not modified
    return false;
  }

  // Validator
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
    const selectedStatusesCount = Object.values(this.statusesCheckbox).filter(v => v === true).length;
    if (selectedStatusesCount < 1) {
      missing.push('хотя бы 1 статус');
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

}
