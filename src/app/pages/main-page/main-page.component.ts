// main-page.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { TaskCard } from '../../shared/models/task.models';
import { TasksService } from '../../core/services/tasks.service';
import { FormsModule } from '@angular/forms';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';

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

  selectedProduct = 'all';
  selectedCategory = 'all';

  // Signal for collapsible task lists
  collapsed = signal({
    myTasks: false,
    unassigned: false
  });

  // Store loaded tasks in a signal
  tasks = signal<TaskCard[]>([]);

  constructor(private tasksService: TasksService) { }

  ngOnInit(): void {
    this.loadTasks();
    console.log(this.tasks());
  }

  loadTasks(): void {
    this.tasksService.getTasks().subscribe((data) => {
      this.tasks.set(data);
      console.log('Данные получены:', this.tasks());
    });
  }

  toggleCollapsible(listName: 'myTasks' | 'unassigned') {
    this.collapsed.update((prev) => ({
      ...prev,
      [listName]: !prev[listName],
    }));
  }

  // Method for selecting the filter from the dropdown Product
  onProductFilterChange(value: string) {
    this.selectedProduct = value;
    // Filter tasks with pipe / computed signal / NgRx
  }

  // Method for selecting the filter from the dropdown Category
  onCategoryFilterChange(value: string) {
    this.selectedCategory = value;
    // Filter tasks with pipe / computed signal / NgRx
  }
}
