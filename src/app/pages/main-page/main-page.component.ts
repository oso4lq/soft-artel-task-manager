// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-main-page',
//   standalone: true,
//   imports: [],
//   templateUrl: './main-page.component.html',
//   styleUrl: './main-page.component.scss'
// })
// export class MainPageComponent {

// }

import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {
  // Пример сигнала для хранения состояния списка
  collapsed = signal({
    myTasks: false,
    unassigned: false
  });

  toggleCollapsible(listName: 'myTasks' | 'unassigned') {
    // Инвертируем значение сигнала
    this.collapsed.update((prev) => ({
      ...prev,
      [listName]: !prev[listName]
    }));
  }
}
