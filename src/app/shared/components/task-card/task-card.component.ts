// task-card.component.ts

import { Component, computed, Input, OnInit, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ProductType, TaskCard, TaskStatus, TaskType } from '../../models/task.models';
import { UsersService } from '../../../core/services/users.service';
import { TasksService } from '../../../core/services/tasks.service';
import { getNextTaskStatus } from '../../utils/task-status-utils';
import { AuthService } from '../../../core/services/auth.service';
import { AppComponent } from '../../../app.component';
import { UserData } from '../../models/users.model';
import { IconComponent } from '../../icon/icon/icon.component';
import { productIconMap, taskStatusIconMap, taskTypeIconMap } from '../../utils/icon-utils';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
  ],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent implements OnInit {

  // Task to display
  @Input() task!: TaskCard;
  @Input() isInProgress: boolean = false;

  public TaskStatus = TaskStatus;
  placeholder = 'https://res.cloudinary.com/dxunxtt1u/image/upload/userAvatarPlaceholder_ox0tj4.png';

  // Signals for UI
  hoveredTop = signal(false);
  hoveredBottom = signal(false);
  currentUserData: Signal<UserData | null> = computed(() => this.authService.currentUserDataSig()); // track the current user data

  // For debounce effect
  private hoverTopSubject = new Subject<boolean>();
  private hoverBottomSubject = new Subject<boolean>();


  // Calculate current status index. If Closed, all statuses are "passed"
  currentStatusIndex = computed(() => {
    if (this.task.currentTaskStatus === TaskStatus.Closed) {
      return this.task.taskStatuses.length - 1;
    }
    return this.task.taskStatuses.indexOf(this.task.currentTaskStatus);
  });

  // Closed task attribute
  isClosed = computed(() => {
    return this.task.currentTaskStatus === TaskStatus.Closed;
  });

  // Get this task assignee name
  taskPerformerName = computed(() => {
    if (!this.task.performerId) {
      return 'Любой сотрудник';
    }
    const users = this.usersService.userDatasSig();
    const foundUser = users.find(u => u.id === this.task.performerId);
    if (!foundUser) {
      return 'Неизвестный сотрудник';
    }

    const fullName = foundUser.username.trim();
    const nameParts = fullName.split(' ');

    if (nameParts.length === 1) {
      return nameParts[0];
    } else if (nameParts.length === 2) {
      const [firstName, lastName] = nameParts;
      const abbreviatedLastName = lastName.charAt(0).toUpperCase() + '.';
      return `${firstName} ${abbreviatedLastName}`;
    } else {
      // If more than 2 parts, trim all except first and first letter of last
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      const abbreviatedLastName = lastName.charAt(0).toUpperCase() + '.';
      return `${firstName} ${abbreviatedLastName}`;
    }
  });

  // Get this task assignee img
  taskPerformerImg = computed(() => {
    if (!this.task.performerId) {
      return this.placeholder;
    }
    const users = this.usersService.userDatasSig();
    const foundUser = users.find(u => u.id === this.task.performerId);
    return foundUser ? foundUser.img : this.placeholder;
  });

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private tasksService: TasksService,
    private parent: AppComponent,
  ) { }

  ngOnInit(): void {
    // Subscribe with a 300ms debounce for the Top Card Part
    this.hoverTopSubject
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.hoveredTop.set(value);
      });

    // Subscribe with a 800ms debounce for the Bottom Card Part
    this.hoverBottomSubject
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.hoveredBottom.set(value);
      });
  }

  // Get iconId for a ProductType
  getProductIconId(): string {
    return productIconMap[this.task.taskPath.productName] || 'icon-default-product';
  }

  // Get iconId and color for TaskType
  getTaskTypeIcon(): { iconId: string, color?: string } {
    return taskTypeIconMap[this.task.taskType] || { iconId: 'icon-default-task' };
  }

  // Get iconId and color for TaskStatus
  getTaskStatusIcon(): { iconId: string, color: string } {
    const iconId = taskStatusIconMap[this.task.currentTaskStatus] || 'icon-status-default';
    const color = this.task.inProgress ? '#16A4E3' : '#7E7E7E';
    return { iconId, color };
  }

  // mouseenter / mouseleave for the Top Card Part
  onTopHover(isHover: boolean) {
    this.hoverTopSubject.next(isHover);
  }

  // mouseenter / mouseleave for the Bottom Card Part
  onBottomHover(isHover: boolean) {
    this.hoverBottomSubject.next(isHover);
  }

  // Apply a specific CSS class for the progress bar
  getProgressBlockClass(index: number): string {
    if (this.isClosed()) {
      // If Closed, colorize green
      return 'progress-block--green';
    }

    const currentIndex = this.currentStatusIndex();
    if (index < currentIndex) {
      // Previous statuses
      return 'progress-bar__block_green';
    } else if (index === currentIndex) {
      // Current status
      if (this.task.inProgress === true) {
        // Task has an assignee and is in progress => blue
        return 'progress-bar__block_active-blue';
      } else if (this.task.inProgress === false) {
        // Task has an assignee and is on pause => dark grey
        return 'progress-bar__block_text-secondary';
      } else {
        // (other) inProgress === null => grey
        // Task has may have an assignee but he didn't start it 
        return 'progress-bar__block_divider';
      }
    } else {
      // Upcoming statuses => grey
      return 'progress-bar__block_divider';
    }
  }


  // Button handlers
  onEditClick(): void {
    if (this.currentUserData()) {
      this.parent.openEditTaskModal(this.task);
    } else {
      this.parent.openLoginModal();
    }
  }

  // Work: apply inProgress===true
  onInWorkClick(): void {
    if (this.currentUserData()) {
      this.task.inProgress = true;
      this.task.performerId = this.authService.currentUserDataSig()?.id;
      this.tasksService.updateTask(this.task);
    } else {
      this.parent.openLoginModal();
    }
  }

  // Accept: apply next status and null assignee
  onAcceptClick(): void {
    if (this.currentUserData()) {
      const nextStatus = getNextTaskStatus(this.task);
      if (nextStatus) {
        this.task.currentTaskStatus = nextStatus;
      } else {
        this.task.currentTaskStatus = TaskStatus.Closed;
      }
      this.task.inProgress = null;
      this.task.performerId = null;
      this.tasksService.updateTask(this.task);
    } else {
      this.parent.openLoginModal();
    }
  }

  // Pause: apply inProgress===false
  onPauseClick(): void {
    if (this.currentUserData()) {
      this.task.inProgress = false;
      this.task.performerId = this.authService.currentUserDataSig()?.id;
      this.tasksService.updateTask(this.task);
    } else {
      this.parent.openLoginModal();
    }
  }

  // Done: apply next status and null assignee
  onDoneClick(): void {
    if (this.currentUserData()) {
      const nextStatus = getNextTaskStatus(this.task);
      if (nextStatus) {
        this.task.currentTaskStatus = nextStatus;
      } else {
        this.task.currentTaskStatus = TaskStatus.Closed;
      }
      this.task.inProgress = null;
      this.task.performerId = null;
      this.tasksService.updateTask(this.task);
    } else {
      this.parent.openLoginModal();
    }
  }
}
