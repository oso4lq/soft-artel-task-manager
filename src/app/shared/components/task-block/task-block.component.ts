// task-block.component.ts

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskCard } from '../../models/task.models';
import { IconComponent } from '../../icon/icon/icon.component';

/**
 <app-task-block
 *   [title]="'Мои'"
 *   [count]="myTasks.length"
 *   [tasks]="myTasks"
 * 
 *   [isCollapsible]="true"
 *   [isCollapsed]="collapsed.myTasks"
 *   (toggle)="toggleCollapsible('myTasks')"
 *   [blockClass]="'tasks-block_in-progress' | 'tasks-block_paused' и т.д."
 *   [requiresAuth]="true"
 *   [userLoggedIn]="!!userData"
 *   [noTasksMessage]="'У вас нет задач.'"
 *   [noUserMessage]="'Войдите...'"
 * ></app-task-block>
 */

@Component({
  selector: 'app-task-block',
  standalone: true,
  imports: [
    CommonModule,
    TaskCardComponent,
    IconComponent,
  ],
  templateUrl: './task-block.component.html',
  styleUrl: './task-block.component.scss'
})
export class TaskBlockComponent {

  @Input() title: string = '';
  @Input() count: number = 0;
  @Input() tasks: TaskCard[] = [];

  @Input() isCollapsible: boolean = false;
  @Input() isCollapsed: boolean = false;

  /** Класс, который будет добавляться к tasks-block, например "tasks-block_in-progress" */
  @Input() blockClass: string = '';

  @Input() requiresAuth: boolean = false;
  @Input() userLoggedIn: boolean = false;

  @Input() noTasksMessage: string = 'Нет задач.';
  @Input() noUserMessage: string = 'Войдите, чтобы просмотреть задачи.';

  @Output() toggle = new EventEmitter<void>();

  onToggle(): void {
    if (this.isCollapsible) {
      this.toggle.emit();
    }
  }

}
