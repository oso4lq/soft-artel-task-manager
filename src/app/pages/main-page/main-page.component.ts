// main-page.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, Signal, effect } from '@angular/core';
import { TaskCard, TaskStatus, TaskType } from '../../shared/models/task.models';
import { TasksService } from '../../core/services/tasks.service';
import { FormsModule } from '@angular/forms';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';
import { AuthService } from '../../core/services/auth.service';
import { UserData } from '../../shared/models/users.model';
import { TimeService } from '../../core/services/time.service';
import { IconComponent } from '../../shared/icon/icon/icon.component';
import { DropdownModule } from 'primeng/dropdown';
import { MobileService } from '../../core/services/mobile.service';
import { ProductDropdownComponent } from '../../shared/components/product-dropdown/product-dropdown.component';
import { CategoryDropdownComponent } from '../../shared/components/category-dropdown/category-dropdown.component';
import { StatusFiltersComponent } from '../../shared/components/status-filters/status-filters.component';
import { TaskBlockComponent } from '../../shared/components/task-block/task-block.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    DropdownModule,

    ProductDropdownComponent,
    CategoryDropdownComponent,
    StatusFiltersComponent,
    TaskBlockComponent,
    // TaskCardComponent,
    // IconComponent,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  // State
  userData: UserData | null = null; // Store the fetched user data
  public TaskStatus = TaskStatus;
  productsBase = [
    {
      label: 'Все продукты',
      value: 'all',
      icon: 'icon-none'
    },
  ];
  categories = [
    {
      label: 'Все задачи',
      value: 'all',
      icon: 'icon-none'
    },
    {
      label: 'Общие',
      value: 'common',
      icon: 'icon-filter-general'
    },
    {
      label: 'Разработка',
      value: 'development',
      icon: 'icon-filter-dev'
    },
    {
      label: 'Тестирование',
      value: 'testing',
      icon: 'icon-filter-test'
    },
    {
      label: 'Ошибки',
      value: 'errors',
      icon: 'icon-filter-bug'
    },
  ];

  // Signals
  arrangedTasks: Signal<TaskCard[]> = computed(() => this.tasksService.arrangedTasksSig()); // track the tasks array
  currentDateStr: Signal<string> = computed(() => this.timeService.currentDateStrSig()); // track current date

  // Filter signals
  selectedProduct = signal('all');
  selectedCategory = signal('all');
  selectedStatusFilter = signal<TaskStatus.Approval | TaskStatus.Review | TaskStatus.Execution | TaskStatus.Draft>(TaskStatus.Execution);

  // Signal for collapsible task lists
  collapsed = signal({
    myTasks: false,
    unassigned: false
  });

  constructor(
    private tasksService: TasksService,
    private authService: AuthService,
    private timeService: TimeService,
    public mobileService: MobileService,
  ) {
    // Effect to watch for changes in currentUserData
    effect(() => {
      const data = this.authService.currentUserDataSig();
      if (data) {
        this.userData = data;
      } else {
        this.userData = null;
      }
    });
  }

  // Make a list of developing products
  allProjects = computed(() => {
    const names = this.arrangedTasks().map(t => t.taskPath.projectName); // Extract projectNames from tasks()
    const unique = Array.from(new Set(names));
    return unique; // Unique projectNames
  });

  // Add the list of developing products to dropdown
  productOptions = computed(() => {
    const dynamicItems = this.allProjects().map((p) => ({
      label: p,
      value: p,
      icon: 'icon-none'
    }));
    return [...this.productsBase, ...dynamicItems];
  });

  // Counters for task filters
  approvalCount = computed(() => this.arrangedTasks().filter(t =>
    t.currentTaskStatus === TaskStatus.Approval &&
    t.inProgress === null &&
    (
      t.performerId === this.userData?.id ||
      t.performerId === null
    )
  ).length);

  reviewCount = computed(() => this.arrangedTasks().filter(t =>
    t.currentTaskStatus === TaskStatus.Review &&
    t.inProgress === null &&
    (
      t.performerId === this.userData?.id ||
      t.performerId === null
    )
  ).length);

  executionCount = computed(() => this.arrangedTasks().filter(t =>
    (
      t.currentTaskStatus === TaskStatus.Execution ||
      t.currentTaskStatus === TaskStatus.Deploy ||
      t.currentTaskStatus === TaskStatus.Testing
    ) &&
    t.inProgress === null &&
    (
      t.performerId === this.userData?.id ||
      t.performerId === null
    )
  ).length);

  draftCount = computed(() => {
    if (!this.userData) return 0;

    return this.arrangedTasks().filter(t =>
      t.currentTaskStatus === TaskStatus.Draft &&
      t.inProgress === null &&
      t.performerId === this.userData?.id
    ).length;
  });

  ngOnInit(): void { }

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
  onStatusFilterChange(value: TaskStatus.Approval | TaskStatus.Review | TaskStatus.Execution | TaskStatus.Draft) {
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
        return (task.taskType === TaskType.Design || task.taskType === TaskType.Analytics);
      case 'development':
        return (task.taskType === TaskType.Frontend || task.taskType === TaskType.Backend);
      case 'testing':
        return (task.taskType === TaskType.Testing);
      case 'errors':
        return (
          task.taskType === TaskType.BlockingBug
          || task.taskType === TaskType.CriticalBug
          || task.taskType === TaskType.MajorBug
          || task.taskType === TaskType.MinorBug
          || task.taskType === TaskType.TrivialBug
        );
      default:
        return true;
    }
  }

  private matchLeftColumnStatus(task: TaskCard): boolean {
    switch (this.selectedStatusFilter()) {
      case TaskStatus.Approval:
        return (task.currentTaskStatus === TaskStatus.Approval);
      case TaskStatus.Review:
        return (task.currentTaskStatus === TaskStatus.Review);
      case TaskStatus.Execution:
        return (
          task.currentTaskStatus === TaskStatus.Execution
          || task.currentTaskStatus === TaskStatus.Deploy
          || task.currentTaskStatus === TaskStatus.Testing
        );
      case TaskStatus.Draft:
        return (task.currentTaskStatus === TaskStatus.Draft);
      // New status may be added later. Currently the closed tasks disappear
      // case TaskStatus.Closed:
      //   return (task.currentTaskStatus === TaskStatus.Closed);
    }
  }

  private matchNullProgress(task: TaskCard): boolean {
    return task.inProgress === null;
  }

  // If the user is anonymous, do not check performerId
  private isCurrentUser(task: TaskCard): boolean {
    const userData = this.authService.currentUserDataSig();
    if (!userData) return false;
    return task.performerId === userData.id;
  }

  private isUnassigned(task: TaskCard): boolean {
    return !task.performerId;
  }

  private matchInProgress(task: TaskCard): boolean {
    return task.inProgress === true;
  }

  private matchPause(task: TaskCard): boolean {
    return task.inProgress === false;
  }
  // Helper methods end


  // Sort the tasks for each block using different filters
  myTasksFiltered = computed(() => {
    return this.arrangedTasks().filter((t) => {
      // 1 - product
      if (!this.matchProduct(t)) return false;
      // 2 - category
      if (!this.matchCategory(t)) return false;
      // 3 - radio-status (because it is in the left column)
      if (!this.matchLeftColumnStatus(t)) return false;
      // 4 - performerId === currentUser.id
      if (!this.isCurrentUser(t)) return false;
      // 5 - inProgress === null
      if (!this.matchNullProgress(t)) return false;

      return true;
    });
  });

  unassignedFiltered = computed(() => {
    return this.arrangedTasks().filter((t) => {
      // 1 - product
      if (!this.matchProduct(t)) return false;
      // 2 - category
      if (!this.matchCategory(t)) return false;
      // 3 - radio-status (because it is in the left column)
      if (!this.matchLeftColumnStatus(t)) return false;
      // 4 - performerId === undefined/null
      if (!this.isUnassigned(t)) return false;
      // 5 - inProgress === null
      if (!this.matchNullProgress(t)) return false;

      return true;
    });
  });

  inProgressFiltered = computed(() => {
    return this.arrangedTasks().filter((t) => {
      // 1 - product
      if (!this.matchProduct(t)) return false;
      // 2 - category
      if (!this.matchCategory(t)) return false;
      // 3 - taskStatus = 'В работе'
      if (!this.matchInProgress(t)) return false;
      // 4 - performerId === currentUser.id
      if (!this.isCurrentUser(t)) return false;

      return true;
    });
  });

  pauseFiltered = computed(() => {
    return this.arrangedTasks().filter((t) => {
      // 1 - product
      if (!this.matchProduct(t)) return false;
      // 2 - category
      if (!this.matchCategory(t)) return false;
      // 3 - taskStatus = 'Пауза'
      if (!this.matchPause(t)) return false;
      // 4 - performerId === currentUser.id
      if (!this.isCurrentUser(t)) return false;

      return true;
    });
  });

}
