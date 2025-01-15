// header.component.ts

import { Component, computed, Input, OnInit, Signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { UserData } from '../../models/users.model';
import { AppComponent } from '../../../app.component';
import { TimeService } from '../../../core/services/time.service';
import { TasksService } from '../../../core/services/tasks.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  // Signals
  currentUserData: Signal<UserData | null> = computed(() => this.authService.currentUserDataSig()); // track the current user data
  currentTimeStr: Signal<string> = computed(() => this.timeService.currentTimeStrSig()); // track current time
  shortLastTaskName: Signal<string | null> = computed(() => this.tasksService.shortLastTaskNameSig()); // track latest task

  // User popup
  isUserPopupOpen = false;

  // Modal window
  isModalOpen = false;

  constructor(
    private tasksService: TasksService,
    private authService: AuthService,
    private timeService: TimeService,
    private parent: AppComponent,
  ) { }

  ngOnInit(): void { }

  toggleUserPopup() {
    this.isUserPopupOpen = !this.isUserPopupOpen
  }

  onLogoutClick() {
    this.authService.logout();
    this.parent.openLoginModal();
  }

  onLoginClick() {
    this.authService.logout();
    this.parent.openLoginModal();
  }

  newTask() {
    if (this.currentUserData()) {
      this.parent.openNewTaskModal();
    } else {
      this.parent.openLoginModal();
    }
  }
}
