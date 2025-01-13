// task-card.component.ts

import { Component, computed, Input, OnInit, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TaskCard, TaskStatus } from '../../models/task.models';
import { UserData } from '../../models/users.model';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent implements OnInit {

  // Task to display
  @Input() task!: TaskCard;

  // Signals
  userDatas: Signal<UserData[]> = computed(() => this.usersService.userDatasSig()); // track the userDatas array

  // Signals for hover
  hoveredTop = signal(false);
  hoveredBottom = signal(false);

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

  taskPerformerName = computed(() => {
    console.log(this.task.performerId);
    if (!this.task.performerId) {
      return 'Любой сотрудник';
    }
    const users = this.userDatas();
    console.log(users);
    const foundUser = users.find(u => u.id === this.task.performerId);
    console.log(foundUser);
    return foundUser ? foundUser.username : 'Неизвестный сотрудник';
  });

  constructor(
    private usersService: UsersService,
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
      .pipe(debounceTime(800))
      .subscribe((value) => {
        this.hoveredBottom.set(value);
      });

    this.usersService.loadUserDatas();
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
      return 'progress-block--green';
    } else if (index === currentIndex) {
      // Current status
      if (this.task.inProgress === true) {
        // Task has an assignee and is in progress
        return 'progress-block--active-blue';
      } else if (this.task.inProgress === false) {
        // Task has an assignee and is on pause
        return 'progress-block--text-secondary';
      } else {
        // (other) inProgress === null
        // Task has may have an assignee but he didn't start it 
        return 'progress-block--divider';
      }
    } else {
      // Upcoming statuses
      return 'progress-block--divider';
    }
  }
}
