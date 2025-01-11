// main-page.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { TaskCard } from '../../shared/models/task.models';
import { TasksService } from '../../core/services/tasks.service';
import { FormsModule } from '@angular/forms';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';

// Temporary solution to store current user's performerId
export const USER_SESSION_ID = 'user-123';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TaskCardComponent,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  // Filter by product (all by default)
  selectedProduct = signal('all');
  // Filter by category (all by default)
  selectedCategory = signal('all');
  // Radio button status filter (execution by default)
  selectedStatusFilter = signal<'approval' | 'review' | 'execution' | 'draft'>('execution');

  // Store user
  user: User | null = null;

  // User popup
  isUserPopupOpen = false;

  // Signal for collapsible task lists
  collapsed = signal({
    myTasks: false,
    unassigned: false
  });

  // Store loaded tasks in a signal
  tasks = signal<TaskCard[]>([]);

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

  constructor(
    private tasksService: TasksService,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {

    // Subscribe on user$
    this.authService.user$.subscribe(currentUser => {
      this.user = currentUser;
    });

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

    this.loadTasks();
  }

  loadTasks(): void {
    this.tasksService.getTasks().subscribe((data) => {
      this.tasks.set(data);
      console.log('Данные получены:', this.tasks());
    });
  }

  toggleUserPopup() {
    this.isUserPopupOpen = !this.isUserPopupOpen;
  }

  logout() {
    this.authService.logout().then(() => {
      // Можно сделать дополнительный редирект, если нужно
      this.authService.logout();
      this.router.navigate(['/login']);
    });
  }

  goToLogin() {
    // Можно переходить на страницу логина или другую
    this.authService.logout();
    this.router.navigate(['/login']);
  }

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
    switch (this.selectedStatusFilter()) {
      case 'approval':
        return (task.taskStatus === 'Согласование' && task.performerId === USER_SESSION_ID);
      case 'review':
        return (task.taskStatus === 'Ревью' && task.performerId === USER_SESSION_ID);
      case 'execution':
        return (
          task.taskStatus === 'Исполнение'
          && (!task.performerId || task.performerId === USER_SESSION_ID)
        );
      case 'draft':
        return (task.taskStatus === 'Черновик' && task.performerId === USER_SESSION_ID);
    }
  }

  private matchMy(task: TaskCard): boolean {
    return task.performerId === USER_SESSION_ID;
  }

  private matchUnassigned(task: TaskCard): boolean {
    return !task.performerId; // task.performerId === '' / undefined / null
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
      if (!this.matchMy(t)) return false;

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
      if (!this.matchUnassigned(t)) return false;

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
