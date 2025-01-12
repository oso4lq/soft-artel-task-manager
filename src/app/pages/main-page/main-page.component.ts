// main-page.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, Signal, effect } from '@angular/core';
import { TaskCard } from '../../shared/models/task.models';
import { TasksService } from '../../core/services/tasks.service';
import { FormsModule } from '@angular/forms';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { loadAuthFromIndexedDb } from '../../core/store/auth/auth.actions';
import { loadTasks } from '../../core/store/tasks/tasks.actions';
import { Store } from '@ngrx/store';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { UserData } from '../../shared/models/users.model';

// Temporary solution to store current user's performerId
// export const USER_SESSION_ID = 'user-123';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TaskCardComponent,
    HeaderComponent,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  // State
  userData: UserData | null = null; // Store the fetched user data

  // Signals
  currentUser: Signal<User | null | undefined> = computed(() => this.authService.currentUserSig()); // track the current user
  currentUserData: Signal<UserData | null> = computed(() => this.authService.currentUserDataSig()); // track the current user data
  tasks: Signal<TaskCard[]> = computed(() => this.tasksService.tasksSig()); // track the tasks array

  // Filter signals
  selectedProduct = signal('all');
  selectedCategory = signal('all');
  selectedStatusFilter = signal<'approval' | 'review' | 'execution' | 'draft'>('execution');

  // Signal for collapsible task lists
  collapsed = signal({
    myTasks: false,
    unassigned: false
  });

  constructor(
    private tasksService: TasksService,
    private authService: AuthService,
    private router: Router,
    private store: Store,
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

  // Make a list of developing products
  allProjects = computed(() => {
    // Extract projectNames from tasks()
    const names = this.tasks().map(t => t.taskPath.projectName);
    const unique = Array.from(new Set(names));
    return unique; // Unique projectNames
  });

  // Find the latest task
  private lastTask = computed(() => {
    const all = this.tasks();
    if (!all.length) {
      return null;
    }
    const sorted = [...all].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return sorted[0];
  });

  // Compile a short version of the latest task name
  shortLastTaskName = computed(() => {
    const task = this.lastTask();
    if (!task) return null;
    const name = task.taskName;
    return name.length > 47 ? name.slice(0, 47) + '...' : name;
  });

  // Date and time
  private timeSignal = signal(new Date());
  currentTimeStr = computed(() => {
    return this.timeSignal().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  });
  private dateSignal = signal(new Date());
  currentDateStr = computed(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    const formatted = new Intl.DateTimeFormat('ru-RU', options).format(this.dateSignal());
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  });

  ngOnInit(): void {
    // Load Auth from the IndexedDB cache
    this.store.dispatch(loadAuthFromIndexedDb());
    // Load tasks from the IndexedDB cache
    this.store.dispatch(loadTasks());
    // Load tasks from the Firestore
    this.tasksService.loadTasks();
    // Load and set locally current user's data
    this.userData = this.currentUserData();

    // Refresh date and time
    setInterval(() => {
      const oldValue = this.timeSignal();
      const newValue = new Date();
      this.timeSignal.set(newValue);

      // Check calendar day
      if (oldValue.getDate() !== newValue.getDate()) {
        this.dateSignal.set(newValue);
      }
    }, 1000);
  }

  // Wrap / Unwrap task lists in MY and UNASSIGNED blocks
  toggleCollapsible(listName: 'myTasks' | 'unassigned') {
    this.collapsed.update((prev) => ({
      ...prev,
      [listName]: !prev[listName],
    }));
  }

  // Select the filter from the Product dropdown
  onProductFilterChange(value: string) {
    this.selectedProduct.set(value);
  }

  // Select the filter from the Category dropdown
  onCategoryFilterChange(value: string) {
    this.selectedCategory.set(value);
  }

  // Select the filter from the Status radio buttons
  onStatusFilterChange(value: 'approval' | 'review' | 'execution' | 'draft') {
    this.selectedStatusFilter.set(value);
  }


  // Helper methods start
  private matchProduct(task: TaskCard): boolean {
    if (this.selectedProduct() === 'all') return true;
    return task.taskPath.projectName === this.selectedProduct();
  }

  private matchCategory(task: TaskCard): boolean {
    switch (this.selectedCategory()) {
      case 'all':
        return true;
      case 'common':
        return (task.taskType === 'Дизайн' || task.taskType === 'Аналитика');
      case 'development':
        return (task.taskType === 'Frontend' || task.taskType === 'Backend');
      case 'testing':
        return (task.taskType === 'Тестирование');
      case 'errors':
        return (
          task.taskType === 'Ошибка блокирующая'
          || task.taskType === 'Ошибка критическая'
          || task.taskType === 'Ошибка значительная'
          || task.taskType === 'Ошибка незначительная'
          || task.taskType === 'Ошибка тривиальная'
        );
      default:
        return true;
    }
  }

  private matchLeftColumnStatus(task: TaskCard): boolean {
    // performerId === current user's UID
    const userData = this.authService.currentUserDataSig();
    const currentUserUid = userData?.id; // UID from Firestore

    switch (this.selectedStatusFilter()) {
      case 'approval':
        return (task.taskStatus === 'Согласование' && task.performerId === currentUserUid);
      case 'review':
        return (task.taskStatus === 'Ревью' && task.performerId === currentUserUid);
      case 'execution':
        return (
          task.taskStatus === 'Исполнение'
          && (!task.performerId || task.performerId === currentUserUid)
        );
      case 'draft':
        return (task.taskStatus === 'Черновик' && task.performerId === currentUserUid);
    }
  }

  // private matchMy(task: TaskCard): boolean {
  //   return task.performerId === USER_SESSION_ID;
  // }

  // private matchUnassigned(task: TaskCard): boolean {
  //   return !task.performerId; // task.performerId === '' / undefined / null
  // }

  // If the user is anonymous, do not check performerId
  private isCurrentUser(task: TaskCard): boolean {
    const userData = this.authService.currentUserDataSig();
    console.log('userData.id:', userData?.id);
    if (!userData) return false;
    console.log('userData.id:', userData.id);
    return task.performerId === userData.id;
  }

  private isUnassigned(task: TaskCard): boolean {
    return !task.performerId;
  }

  private matchInProgress(task: TaskCard): boolean {
    return task.taskStatus === 'В работе';
  }

  private matchPause(task: TaskCard): boolean {
    return task.taskStatus === 'Пауза';
  }
  // Helper methods end


  // Sort the tasks for each block using different filters
  myTasksFiltered = computed(() => {
    return this.tasks().filter((t) => {
      // 1 - product
      if (!this.matchProduct(t)) return false;
      // 2 - category
      if (!this.matchCategory(t)) return false;
      // 3 - radio-status (because it is in the left column)
      if (!this.matchLeftColumnStatus(t)) return false;
      // 4 - performerId = user
      if (!this.isCurrentUser(t)) return false;

      return true;
    });
  });

  unassignedFiltered = computed(() => {
    return this.tasks().filter((t) => {
      // 1 - product
      if (!this.matchProduct(t)) return false;
      // 2 - category
      if (!this.matchCategory(t)) return false;
      // 3 - radio-status (because it is in the left column)
      if (!this.matchLeftColumnStatus(t)) return false;
      // 4 - performerId = undefined/null
      if (!this.isUnassigned(t)) return false;

      return true;
    });
  });

  inProgressFiltered = computed(() => {
    return this.tasks().filter((t) => {
      // 1 - product
      if (!this.matchProduct(t)) return false;
      // 2 - category
      if (!this.matchCategory(t)) return false;
      // 3 - taskStatus = 'В работе'
      if (!this.matchInProgress(t)) return false;

      return true;
    });
  });

  pauseFiltered = computed(() => {
    return this.tasks().filter((t) => {
      // 1 - product
      if (!this.matchProduct(t)) return false;
      // 2 - category
      if (!this.matchCategory(t)) return false;
      // 3 - taskStatus = 'Пауза'
      if (!this.matchPause(t)) return false;

      return true;
    });
  });

}
